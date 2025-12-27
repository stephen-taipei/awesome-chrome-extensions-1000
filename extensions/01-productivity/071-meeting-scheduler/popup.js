// Meeting Scheduler - Popup Script

class MeetingScheduler {
  constructor() {
    this.data = {
      meetings: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDate();
  }

  initElements() {
    this.todayDateEl = document.getElementById('todayDate');
    this.todayMeetingsEl = document.getElementById('todayMeetings');
    this.upcomingMeetingsEl = document.getElementById('upcomingMeetings');
    this.meetingTitleEl = document.getElementById('meetingTitle');
    this.meetingDateEl = document.getElementById('meetingDate');
    this.meetingTimeEl = document.getElementById('meetingTime');
    this.meetingDurationEl = document.getElementById('meetingDuration');
    this.reminderTimeEl = document.getElementById('reminderTime');
    this.meetingLinkEl = document.getElementById('meetingLink');
    this.addBtn = document.getElementById('addBtn');

    // Display today's date
    const today = new Date();
    this.todayDateEl.textContent = today.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }

  setDefaultDate() {
    const today = new Date();
    this.meetingDateEl.value = today.toISOString().split('T')[0];
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addMeeting());
    this.meetingTitleEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addMeeting();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('meetingSchedulerData');
    if (result.meetingSchedulerData) {
      this.data = result.meetingSchedulerData;
    }
    this.cleanupPastMeetings();
    this.renderMeetings();
  }

  async saveData() {
    await chrome.storage.local.set({ meetingSchedulerData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async addMeeting() {
    const title = this.meetingTitleEl.value.trim();
    const date = this.meetingDateEl.value;
    const time = this.meetingTimeEl.value;
    const duration = parseInt(this.meetingDurationEl.value);
    const reminder = parseInt(this.reminderTimeEl.value);
    const link = this.meetingLinkEl.value.trim();

    if (!title || !date || !time) {
      this.addBtn.textContent = '請填寫必填欄位';
      setTimeout(() => {
        this.addBtn.textContent = '新增會議';
      }, 1500);
      return;
    }

    const meeting = {
      id: this.generateId(),
      title,
      date,
      time,
      duration,
      reminder,
      link,
      createdAt: Date.now()
    };

    this.data.meetings.push(meeting);
    await this.saveData();

    // Set reminder alarm
    this.setReminder(meeting);

    // Clear form
    this.meetingTitleEl.value = '';
    this.meetingLinkEl.value = '';

    this.addBtn.textContent = '已新增 ✓';
    setTimeout(() => {
      this.addBtn.textContent = '新增會議';
    }, 1500);

    this.renderMeetings();
  }

  setReminder(meeting) {
    const meetingTime = new Date(`${meeting.date}T${meeting.time}`);
    const reminderTime = meetingTime.getTime() - meeting.reminder * 60 * 1000;

    if (reminderTime > Date.now()) {
      chrome.alarms.create(`meeting_${meeting.id}`, {
        when: reminderTime
      });
    }
  }

  async deleteMeeting(id) {
    this.data.meetings = this.data.meetings.filter(m => m.id !== id);
    chrome.alarms.clear(`meeting_${id}`);
    await this.saveData();
    this.renderMeetings();
  }

  cleanupPastMeetings() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    // Keep meetings from the past 7 days for reference
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    this.data.meetings = this.data.meetings.filter(m => {
      const meetingDate = new Date(m.date);
      return meetingDate >= sevenDaysAgo;
    });
  }

  isPastMeeting(meeting) {
    const now = new Date();
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
    const endTime = new Date(meetingDateTime.getTime() + meeting.duration * 60 * 1000);
    return endTime < now;
  }

  renderMeetings() {
    const today = new Date().toISOString().split('T')[0];

    // Sort meetings by date and time
    const sorted = [...this.data.meetings].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA - dateTimeB;
    });

    // Today's meetings
    const todayMeetings = sorted.filter(m => m.date === today);
    this.todayMeetingsEl.innerHTML = todayMeetings.map(m => this.renderMeetingCard(m)).join('');

    // Upcoming meetings (excluding today, next 7 days)
    const upcoming = sorted.filter(m => m.date > today).slice(0, 5);
    this.upcomingMeetingsEl.innerHTML = upcoming.map(m => this.renderMeetingCard(m, true)).join('');

    this.bindMeetingEvents();
  }

  renderMeetingCard(meeting, showDate = false) {
    const isPast = this.isPastMeeting(meeting);
    const dateStr = showDate ? new Date(meeting.date).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    }) : '';

    return `
      <div class="meeting-card ${isPast ? 'past' : ''}" data-id="${meeting.id}">
        <div class="meeting-time">
          <span class="meeting-hour">${meeting.time}</span>
          <span class="meeting-duration">${meeting.duration}分</span>
        </div>
        <div class="meeting-info">
          <div class="meeting-title">${meeting.title}</div>
          ${showDate ? `<div class="meeting-date">${dateStr}</div>` : ''}
        </div>
        <div class="meeting-actions">
          ${meeting.link ? `<button class="action-btn link" data-link="${meeting.link}" title="開啟連結">🔗</button>` : ''}
          <button class="action-btn delete" title="刪除">×</button>
        </div>
      </div>
    `;
  }

  bindMeetingEvents() {
    document.querySelectorAll('.meeting-card').forEach(card => {
      const id = card.dataset.id;

      const deleteBtn = card.querySelector('.action-btn.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteMeeting(id));
      }

      const linkBtn = card.querySelector('.action-btn.link');
      if (linkBtn) {
        linkBtn.addEventListener('click', () => {
          window.open(linkBtn.dataset.link, '_blank');
        });
      }
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MeetingScheduler();
});
