// Morning Routine - Popup Script

class MorningRoutine {
  constructor() {
    this.items = [];
    this.todayData = null;
    this.startTime = null;
    this.timerInterval = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.updateGreeting();
  }

  initElements() {
    this.greeting = document.getElementById('greeting');
    this.progressCircle = document.getElementById('progressCircle');
    this.progressPercent = document.getElementById('progressPercent');
    this.elapsedTime = document.getElementById('elapsedTime');
    this.streakCount = document.getElementById('streakCount');
    this.routineList = document.getElementById('routineList');
    this.completedState = document.getElementById('completedState');
    this.completionTime = document.getElementById('completionTime');

    // Buttons
    this.editBtn = document.getElementById('editBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.startBtn = document.getElementById('startBtn');

    // Modal
    this.modal = document.getElementById('editModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.editList = document.getElementById('editList');
    this.newItemInput = document.getElementById('newItemInput');
    this.addItemBtn = document.getElementById('addItemBtn');
    this.saveEditBtn = document.getElementById('saveEditBtn');
  }

  bindEvents() {
    this.editBtn.addEventListener('click', () => this.openEditModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.addItemBtn.addEventListener('click', () => this.addNewItem());
    this.newItemInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addNewItem();
    });
    this.saveEditBtn.addEventListener('click', () => this.saveEdit());
    this.resetBtn.addEventListener('click', () => this.resetToday());
    this.startBtn.addEventListener('click', () => this.startRoutine());
  }

  updateGreeting() {
    const hour = new Date().getHours();
    let greetingText;
    if (hour < 12) {
      greetingText = '早安！開始美好的一天';
    } else if (hour < 18) {
      greetingText = '午安！保持動力';
    } else {
      greetingText = '晚安！明天繼續';
    }
    this.greeting.textContent = greetingText;
  }

  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  async loadData() {
    const result = await chrome.storage.local.get(['morningRoutineItems', 'morningRoutineHistory']);

    this.items = result.morningRoutineItems || [
      { id: '1', text: '喝一杯水' },
      { id: '2', text: '伸展運動' },
      { id: '3', text: '冥想5分鐘' },
      { id: '4', text: '吃早餐' },
      { id: '5', text: '檢視今日計劃' }
    ];

    const history = result.morningRoutineHistory || {};
    const today = this.getTodayKey();
    this.todayData = history[today] || null;

    this.calculateStreak(history);
    this.renderRoutine();
    this.updateProgress();

    // Resume timer if started
    if (this.todayData?.startTime && !this.todayData?.completedTime) {
      this.startTime = new Date(this.todayData.startTime);
      this.startTimer();
      this.startBtn.disabled = true;
    }
  }

  async saveData() {
    const result = await chrome.storage.local.get(['morningRoutineHistory']);
    const history = result.morningRoutineHistory || {};
    const today = this.getTodayKey();

    history[today] = this.todayData;

    await chrome.storage.local.set({
      morningRoutineItems: this.items,
      morningRoutineHistory: history
    });
  }

  calculateStreak(history) {
    const dates = Object.keys(history).sort().reverse();
    let streak = 0;
    const today = this.getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    for (const date of dates) {
      if (history[date]?.completedTime) {
        if (date === today || date === yesterdayKey ||
            (streak > 0 && this.isConsecutive(dates[dates.indexOf(date) - 1], date))) {
          streak++;
        } else if (streak === 0 && date !== today && date !== yesterdayKey) {
          break;
        }
      }
    }

    this.streakCount.textContent = streak;
  }

  isConsecutive(date1, date2) {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
    return diff === 1;
  }

  startRoutine() {
    this.startTime = new Date();
    this.todayData = {
      startTime: this.startTime.toISOString(),
      completedItems: [],
      completedTime: null
    };
    this.saveData();
    this.startTimer();
    this.startBtn.disabled = true;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.updateElapsedTime();
    }, 1000);
    this.updateElapsedTime();
  }

  updateElapsedTime() {
    if (!this.startTime) return;

    const now = new Date();
    const diff = Math.floor((now - this.startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    this.elapsedTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async toggleItem(itemId) {
    if (!this.todayData) return;

    const index = this.todayData.completedItems.indexOf(itemId);
    if (index === -1) {
      this.todayData.completedItems.push(itemId);
    } else {
      this.todayData.completedItems.splice(index, 1);
    }

    // Check if all completed
    if (this.todayData.completedItems.length === this.items.length) {
      this.todayData.completedTime = new Date().toISOString();
      clearInterval(this.timerInterval);

      const diff = Math.floor((new Date(this.todayData.completedTime) - this.startTime) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      this.completionTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      this.todayData.completedTime = null;
    }

    await this.saveData();
    this.renderRoutine();
    this.updateProgress();
  }

  async resetToday() {
    this.todayData = null;
    this.startTime = null;
    clearInterval(this.timerInterval);
    this.elapsedTime.textContent = '0:00';
    this.startBtn.disabled = false;

    const result = await chrome.storage.local.get(['morningRoutineHistory']);
    const history = result.morningRoutineHistory || {};
    const today = this.getTodayKey();
    delete history[today];
    await chrome.storage.local.set({ morningRoutineHistory: history });

    this.renderRoutine();
    this.updateProgress();
  }

  updateProgress() {
    const completed = this.todayData?.completedItems?.length || 0;
    const total = this.items.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.progressPercent.textContent = `${percent}%`;

    // Update circle (circumference = 2 * PI * 45 ≈ 283)
    const offset = 283 - (283 * percent / 100);
    this.progressCircle.style.strokeDashoffset = offset;

    // Show/hide completed state
    const allDone = this.todayData?.completedTime;
    this.completedState.classList.toggle('hidden', !allDone);
    this.routineList.classList.toggle('hidden', allDone);
  }

  renderRoutine() {
    this.routineList.innerHTML = '';
    const completedItems = this.todayData?.completedItems || [];

    this.items.forEach((item, index) => {
      const isCompleted = completedItems.includes(item.id);

      const div = document.createElement('div');
      div.className = `routine-item ${isCompleted ? 'completed' : ''}`;

      div.innerHTML = `
        <button class="item-check" data-id="${item.id}">
          ${isCompleted ? '✓' : ''}
        </button>
        <span class="item-order">${index + 1}</span>
        <span class="item-text">${this.escapeHtml(item.text)}</span>
      `;

      const checkBtn = div.querySelector('.item-check');
      checkBtn.addEventListener('click', () => {
        if (this.todayData) {
          this.toggleItem(item.id);
        }
      });

      this.routineList.appendChild(div);
    });
  }

  openEditModal() {
    this.renderEditList();
    this.modal.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  renderEditList() {
    this.editList.innerHTML = '';

    this.items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'edit-item';
      div.innerHTML = `
        <span style="color:#94a3b8">${index + 1}.</span>
        <input type="text" value="${this.escapeHtml(item.text)}" data-id="${item.id}">
        <button class="delete-item-btn" data-id="${item.id}">✕</button>
      `;

      const deleteBtn = div.querySelector('.delete-item-btn');
      deleteBtn.addEventListener('click', () => {
        this.items = this.items.filter(i => i.id !== item.id);
        this.renderEditList();
      });

      this.editList.appendChild(div);
    });
  }

  addNewItem() {
    const text = this.newItemInput.value.trim();
    if (!text) return;

    this.items.push({
      id: Date.now().toString(),
      text
    });

    this.newItemInput.value = '';
    this.renderEditList();
  }

  async saveEdit() {
    // Update item texts from inputs
    this.editList.querySelectorAll('input').forEach(input => {
      const item = this.items.find(i => i.id === input.dataset.id);
      if (item) {
        item.text = input.value.trim();
      }
    });

    // Remove empty items
    this.items = this.items.filter(i => i.text);

    await chrome.storage.local.set({ morningRoutineItems: this.items });
    this.renderRoutine();
    this.updateProgress();
    this.closeModal();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new MorningRoutine();
});
