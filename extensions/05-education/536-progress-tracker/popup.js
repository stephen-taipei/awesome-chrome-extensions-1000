document.addEventListener('DOMContentLoaded', () => {
  const overallCircle = document.getElementById('overallCircle');
  const overallPercent = document.getElementById('overallPercent');
  const subjectName = document.getElementById('subjectName');
  const totalTopics = document.getElementById('totalTopics');
  const addSubjectBtn = document.getElementById('addSubjectBtn');
  const subjectsList = document.getElementById('subjectsList');
  const currentStreak = document.getElementById('currentStreak');
  const totalDays = document.getElementById('totalDays');

  loadProgress();
  updateStreak();

  addSubjectBtn.addEventListener('click', addSubject);
  subjectName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addSubject();
  });

  function addSubject() {
    const name = subjectName.value.trim();
    const total = parseInt(totalTopics.value);

    if (!name || !total || total < 1) {
      alert('Please enter subject name and total topics');
      return;
    }

    chrome.storage.local.get(['learningProgress'], (result) => {
      const progress = result.learningProgress || { subjects: [] };

      progress.subjects.push({
        id: Date.now(),
        name: name,
        total: total,
        completed: 0
      });

      chrome.storage.local.set({ learningProgress: progress }, () => {
        subjectName.value = '';
        totalTopics.value = '';
        loadProgress();
      });
    });
  }

  function loadProgress() {
    chrome.storage.local.get(['learningProgress'], (result) => {
      const progress = result.learningProgress || { subjects: [] };
      const subjects = progress.subjects;

      updateOverallProgress(subjects);

      if (subjects.length === 0) {
        subjectsList.innerHTML = '<p class="empty-message">No subjects added</p>';
        return;
      }

      subjectsList.innerHTML = subjects.map(s => {
        const percent = Math.round((s.completed / s.total) * 100);
        return `
          <div class="subject-item">
            <button class="delete-btn" data-id="${s.id}">&times;</button>
            <div class="header">
              <span class="name">${escapeHtml(s.name)}</span>
              <span class="count">${s.completed}/${s.total}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="actions">
              <button class="action-btn minus" data-id="${s.id}" data-action="decrease">-1</button>
              <button class="action-btn" data-id="${s.id}" data-action="increase">+1</button>
            </div>
          </div>
        `;
      }).join('');

      subjectsList.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          updateProgress(parseInt(btn.dataset.id), btn.dataset.action);
        });
      });

      subjectsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSubject(parseInt(btn.dataset.id)));
      });
    });
  }

  function updateProgress(id, action) {
    chrome.storage.local.get(['learningProgress'], (result) => {
      const progress = result.learningProgress || { subjects: [] };
      const subject = progress.subjects.find(s => s.id === id);

      if (subject) {
        if (action === 'increase' && subject.completed < subject.total) {
          subject.completed++;
          recordActivity();
        } else if (action === 'decrease' && subject.completed > 0) {
          subject.completed--;
        }
        chrome.storage.local.set({ learningProgress: progress }, loadProgress);
      }
    });
  }

  function deleteSubject(id) {
    if (!confirm('Delete this subject?')) return;

    chrome.storage.local.get(['learningProgress'], (result) => {
      const progress = result.learningProgress || { subjects: [] };
      progress.subjects = progress.subjects.filter(s => s.id !== id);
      chrome.storage.local.set({ learningProgress: progress }, loadProgress);
    });
  }

  function updateOverallProgress(subjects) {
    if (subjects.length === 0) {
      overallCircle.style.strokeDashoffset = 251;
      overallPercent.textContent = '0%';
      return;
    }

    const totalCompleted = subjects.reduce((sum, s) => sum + s.completed, 0);
    const totalItems = subjects.reduce((sum, s) => sum + s.total, 0);
    const percent = Math.round((totalCompleted / totalItems) * 100);

    const offset = 251 - (251 * percent / 100);
    overallCircle.style.strokeDashoffset = offset;
    overallPercent.textContent = `${percent}%`;
  }

  function recordActivity() {
    chrome.storage.local.get(['activityDays'], (result) => {
      const days = result.activityDays || [];
      const today = new Date().toDateString();

      if (!days.includes(today)) {
        days.push(today);
        chrome.storage.local.set({ activityDays: days }, updateStreak);
      }
    });
  }

  function updateStreak() {
    chrome.storage.local.get(['activityDays'], (result) => {
      const days = result.activityDays || [];
      totalDays.textContent = days.length;

      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();

        if (days.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      currentStreak.textContent = streak;
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
