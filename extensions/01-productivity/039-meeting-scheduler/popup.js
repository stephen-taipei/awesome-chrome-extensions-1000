// Meeting Scheduler - Popup Script

class MeetingScheduler {
  constructor() {
    this.meetings = [];
    this.editingMeeting = null;

    this.initElements();
    this.loadMeetings();
    this.bindEvents();
    this.startCountdownUpdates();
  }

  initElements() {
    this.addBtn = document.getElementById('addBtn');
    this.todayLabel = document.getElementById('todayLabel');
    this.meetingCount = document.getElementById('meetingCount');
    this.meetingsList = document.getElementById('meetingsList');
    this.upcomingList = document.getElementById('upcomingList');

    // Modal
    this.addModal = document.getElementById('addModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.meetingTitle = document.getElementById('meetingTitle');
    this.meetingDate = document.getElementById('meetingDate');
    this.meetingTime = document.getElementById('meetingTime');
    this.meetingLink = document.getElementById('meetingLink');
    this.meetingReminder = document.getElementById('meetingReminder');
    this.meetingNotes = document.getElementById('meetingNotes');
    this.saveMeetingBtn = document.getElementById('saveMeetingBtn');
    this.deleteMeetingBtn = document.getElementById('deleteMeetingBtn');
  }

  async loadMeetings() {
    try {
      const result = await chrome.storage.local.get(['meetings']);
      this.meetings = result.meetings || [];
      this.render();
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  }

  async saveMeetings() {
    try {
      await chrome.storage.local.set({ meetings: this.meetings });
      this.updateAlarms();
      this.updateBadge();
    } catch (error) {
      console.error('Failed to save meetings:', error);
    }
  }

  async updateAlarms() {
    // Clear existing alarms
    const alarms = await chrome.alarms.getAll();
    for (const alarm of alarms) {
      if (alarm.name.startsWith('meeting-')) {
        await chrome.alarms.clear(alarm.name);
      }
    }

    // Set new alarms for upcoming meetings
    const now = Date.now();
    this.meetings.forEach(meeting => {
      const meetingTime = new Date(meeting.datetime).getTime();
      const reminderTime = meetingTime - (meeting.reminder * 60 * 1000);

      if (reminderTime > now) {
        chrome.alarms.create(`meeting-${meeting.id}`, {
          when: reminderTime
        });
      }
    });
  }

  updateBadge() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const todayMeetings = this.meetings.filter(m => {
      const meetingDate = m.datetime.split('T')[0];
      return meetingDate === today && new Date(m.datetime) > now;
    });

    const count = todayMeetings.length;
    chrome.runtime.sendMessage({
      type: 'updateBadge',
      text: count > 0 ? count.toString() : '',
      color: '#4f46e5'
    });
  }

  getDateKey(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  formatTime(datetime) {
    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return { time: `${hour12}:${minutes}`, period };
  }

  formatDate(datetime) {
    const date = new Date(datetime);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  }

  getCountdown(datetime) {
    const now = Date.now();
    const meetingTime = new Date(datetime).getTime();
    const diff = meetingTime - now;

    if (diff < 0) return null;
    if (diff < 60000) return '即將開始';
    if (diff < 3600000) return `${Math.ceil(diff / 60000)} 分鐘後`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時後`;
    return `${Math.floor(diff / 86400000)} 天後`;
  }

  render() {
    const now = new Date();
    const today = this.getDateKey();
    const tomorrow = this.getDateKey(new Date(now.getTime() + 86400000));

    // Update today label
    this.todayLabel.textContent = now.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric'
    }) + ' 會議';

    // Separate meetings
    const todayMeetings = this.meetings.filter(m => m.datetime.startsWith(today));
    const upcomingMeetings = this.meetings.filter(m => {
      const date = m.datetime.split('T')[0];
      return date > today;
    }).sort((a, b) => a.datetime.localeCompare(b.datetime)).slice(0, 5);

    this.meetingCount.textContent = todayMeetings.length;

    // Render today's meetings
    this.renderMeetings(this.meetingsList, todayMeetings, true);

    // Render upcoming meetings
    this.renderMeetings(this.upcomingList, upcomingMeetings, false);
  }

  renderMeetings(container, meetings, isToday) {
    if (meetings.length === 0) {
      container.innerHTML = `<div class="empty-state">${isToday ? '今日無會議' : '無即將到來的會議'}</div>`;
      return;
    }

    const now = Date.now();

    container.innerHTML = meetings.map(meeting => {
      const meetingTime = new Date(meeting.datetime).getTime();
      const isPast = meetingTime < now;
      const isSoon = !isPast && (meetingTime - now) < 30 * 60 * 1000;
      const { time, period } = this.formatTime(meeting.datetime);
      const countdown = this.getCountdown(meeting.datetime);

      return `
        <div class="meeting-item ${isPast ? 'past' : ''} ${isSoon ? 'soon' : ''}" data-id="${meeting.id}">
          <div class="meeting-time-box">
            <div class="meeting-time">${time}</div>
            <div class="meeting-period">${period}</div>
          </div>
          <div class="meeting-info">
            <div class="meeting-title">${this.escapeHtml(meeting.title)}</div>
            <div class="meeting-meta">
              ${!isToday ? `<span>${this.formatDate(meeting.datetime)}</span>` : ''}
              ${countdown ? `<span class="meeting-countdown">${countdown}</span>` : ''}
            </div>
          </div>
          ${meeting.link ? `<button class="meeting-link-btn" data-link="${meeting.link}">加入</button>` : ''}
        </div>
      `;
    }).join('');
  }

  showModal(meeting = null) {
    this.editingMeeting = meeting;
    this.modalTitle.textContent = meeting ? '編輯會議' : '新增會議';
    this.deleteMeetingBtn.classList.toggle('hidden', !meeting);

    if (meeting) {
      const [date, time] = meeting.datetime.split('T');
      this.meetingTitle.value = meeting.title;
      this.meetingDate.value = date;
      this.meetingTime.value = time.substring(0, 5);
      this.meetingLink.value = meeting.link || '';
      this.meetingReminder.value = meeting.reminder;
      this.meetingNotes.value = meeting.notes || '';
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      now.setMinutes(0);

      this.meetingTitle.value = '';
      this.meetingDate.value = this.getDateKey();
      this.meetingTime.value = now.toTimeString().substring(0, 5);
      this.meetingLink.value = '';
      this.meetingReminder.value = '10';
      this.meetingNotes.value = '';
    }

    this.addModal.classList.remove('hidden');
    this.meetingTitle.focus();
  }

  hideModal() {
    this.addModal.classList.add('hidden');
    this.editingMeeting = null;
  }

  saveMeeting() {
    const title = this.meetingTitle.value.trim();
    const date = this.meetingDate.value;
    const time = this.meetingTime.value;

    if (!title || !date || !time) {
      alert('請填寫會議名稱、日期和時間');
      return;
    }

    const meeting = {
      id: this.editingMeeting?.id || Date.now().toString(),
      title,
      datetime: `${date}T${time}:00`,
      link: this.meetingLink.value.trim(),
      reminder: parseInt(this.meetingReminder.value),
      notes: this.meetingNotes.value.trim()
    };

    if (this.editingMeeting) {
      const index = this.meetings.findIndex(m => m.id === this.editingMeeting.id);
      if (index !== -1) {
        this.meetings[index] = meeting;
      }
    } else {
      this.meetings.push(meeting);
    }

    // Sort by datetime
    this.meetings.sort((a, b) => a.datetime.localeCompare(b.datetime));

    this.saveMeetings();
    this.hideModal();
    this.render();
  }

  deleteMeeting() {
    if (!this.editingMeeting) return;
    if (!confirm('確定要刪除此會議嗎？')) return;

    this.meetings = this.meetings.filter(m => m.id !== this.editingMeeting.id);
    this.saveMeetings();
    this.hideModal();
    this.render();
  }

  openMeetingLink(link) {
    window.open(link, '_blank');
  }

  startCountdownUpdates() {
    setInterval(() => this.render(), 60000); // Update every minute
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.showModal());
    this.closeModalBtn.addEventListener('click', () => this.hideModal());
    this.saveMeetingBtn.addEventListener('click', () => this.saveMeeting());
    this.deleteMeetingBtn.addEventListener('click', () => this.deleteMeeting());

    this.addModal.addEventListener('click', (e) => {
      if (e.target === this.addModal) this.hideModal();
    });

    // Meeting list clicks
    [this.meetingsList, this.upcomingList].forEach(list => {
      list.addEventListener('click', (e) => {
        const linkBtn = e.target.closest('.meeting-link-btn');
        if (linkBtn) {
          e.stopPropagation();
          this.openMeetingLink(linkBtn.dataset.link);
          return;
        }

        const item = e.target.closest('.meeting-item');
        if (item) {
          const meeting = this.meetings.find(m => m.id === item.dataset.id);
          if (meeting) this.showModal(meeting);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MeetingScheduler();
});
