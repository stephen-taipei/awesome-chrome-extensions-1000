document.addEventListener('DOMContentLoaded', () => {
  const prevDayBtn = document.getElementById('prevDayBtn');
  const nextDayBtn = document.getElementById('nextDayBtn');
  const currentDateEl = document.getElementById('currentDate');
  const subjectInput = document.getElementById('subjectInput');
  const startTime = document.getElementById('startTime');
  const endTime = document.getElementById('endTime');
  const topicInput = document.getElementById('topicInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const addSessionBtn = document.getElementById('addSessionBtn');
  const scheduleList = document.getElementById('scheduleList');
  const totalHours = document.getElementById('totalHours');
  const completedSessions = document.getElementById('completedSessions');
  const pendingSessions = document.getElementById('pendingSessions');

  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  updateDateDisplay();
  loadSchedule();

  prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadSchedule();
  });

  nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadSchedule();
  });

  addSessionBtn.addEventListener('click', () => {
    const subject = subjectInput.value.trim();
    const start = startTime.value;
    const end = endTime.value;
    const topic = topicInput.value.trim();
    const priority = prioritySelect.value;

    if (!subject || !start || !end) {
      alert('Please fill in subject and times');
      return;
    }

    const dateKey = getDateKey(currentDate);

    chrome.storage.local.get(['studySchedule'], (result) => {
      const schedule = result.studySchedule || {};
      if (!schedule[dateKey]) schedule[dateKey] = [];

      schedule[dateKey].push({
        id: Date.now(),
        subject: subject,
        startTime: start,
        endTime: end,
        topic: topic,
        priority: priority,
        completed: false
      });

      schedule[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime));

      chrome.storage.local.set({ studySchedule: schedule }, () => {
        subjectInput.value = '';
        topicInput.value = '';
        prioritySelect.value = 'normal';
        loadSchedule();
      });
    });
  });

  function updateDateDisplay() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentDate.getTime() === today.getTime()) {
      currentDateEl.textContent = 'Today';
    } else {
      currentDateEl.textContent = currentDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  function getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  function loadSchedule() {
    const dateKey = getDateKey(currentDate);

    chrome.storage.local.get(['studySchedule'], (result) => {
      const schedule = result.studySchedule || {};
      const sessions = schedule[dateKey] || [];

      const completed = sessions.filter(s => s.completed).length;
      const pending = sessions.filter(s => !s.completed).length;
      let hours = 0;

      sessions.forEach(s => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        hours += (eh * 60 + em - sh * 60 - sm) / 60;
      });

      totalHours.textContent = hours.toFixed(1) + 'h';
      completedSessions.textContent = completed;
      pendingSessions.textContent = pending;

      if (sessions.length === 0) {
        scheduleList.innerHTML = '<p class="empty-message">No sessions planned</p>';
        return;
      }

      scheduleList.innerHTML = sessions.map(s => `
        <div class="session-item ${s.completed ? 'completed' : ''} ${s.priority}">
          <div class="actions">
            <button class="action-btn complete-btn" data-id="${s.id}" title="${s.completed ? 'Mark incomplete' : 'Mark complete'}">
              ${s.completed ? '↩' : '✓'}
            </button>
            <button class="action-btn delete-btn" data-id="${s.id}" title="Delete">×</button>
          </div>
          <div class="time">${formatTime(s.startTime)} - ${formatTime(s.endTime)}</div>
          <div class="subject">${escapeHtml(s.subject)}</div>
          ${s.topic ? `<div class="topic">${escapeHtml(s.topic)}</div>` : ''}
        </div>
      `).join('');

      scheduleList.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleComplete(parseInt(btn.dataset.id)));
      });

      scheduleList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSession(parseInt(btn.dataset.id)));
      });
    });
  }

  function toggleComplete(id) {
    const dateKey = getDateKey(currentDate);

    chrome.storage.local.get(['studySchedule'], (result) => {
      const schedule = result.studySchedule || {};
      const sessions = schedule[dateKey] || [];
      const session = sessions.find(s => s.id === id);
      if (session) {
        session.completed = !session.completed;
        chrome.storage.local.set({ studySchedule: schedule }, loadSchedule);
      }
    });
  }

  function deleteSession(id) {
    const dateKey = getDateKey(currentDate);

    chrome.storage.local.get(['studySchedule'], (result) => {
      const schedule = result.studySchedule || {};
      schedule[dateKey] = (schedule[dateKey] || []).filter(s => s.id !== id);
      chrome.storage.local.set({ studySchedule: schedule }, loadSchedule);
    });
  }

  function formatTime(time) {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
