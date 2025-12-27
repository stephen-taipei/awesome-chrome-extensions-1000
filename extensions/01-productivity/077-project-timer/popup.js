// Project Timer - Popup Script

class ProjectTimer {
  constructor() {
    this.data = {
      projects: [],
      activeTimer: null,
      todayLogs: []
    };
    this.selectedColor = '#8b5cf6';
    this.timerInterval = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.activeTimerEl = document.getElementById('activeTimer');
    this.timerProject = document.getElementById('timerProject');
    this.timerDisplay = document.getElementById('timerDisplay');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.addProjectBtn = document.getElementById('addProjectBtn');
    this.projectsList = document.getElementById('projectsList');
    this.todayTotalEl = document.getElementById('todayTotal');
    this.todayProjectsEl = document.getElementById('todayProjects');
    this.addForm = document.getElementById('addForm');
    this.projectNameInput = document.getElementById('projectName');
    this.colorBtns = document.querySelectorAll('.color-btn');
    this.saveProjectBtn = document.getElementById('saveProjectBtn');
  }

  bindEvents() {
    this.addProjectBtn.addEventListener('click', () => this.toggleForm());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.stopBtn.addEventListener('click', () => this.stopTimer());

    this.colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedColor = btn.dataset.color;
      });
    });

    this.saveProjectBtn.addEventListener('click', () => this.saveProject());
    this.projectNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveProject();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('projectTimerData');
    if (result.projectTimerData) {
      this.data = result.projectTimerData;
    }

    // Clean up old logs (keep last 7 days)
    this.cleanupLogs();

    // Restore timer if active
    if (this.data.activeTimer) {
      this.startTimerDisplay();
    }

    this.renderProjects();
    this.updateSummary();
  }

  async saveData() {
    await chrome.storage.local.set({ projectTimerData: this.data });
  }

  cleanupLogs() {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.data.todayLogs = this.data.todayLogs.filter(log => log.endTime > sevenDaysAgo);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  toggleForm() {
    this.addForm.classList.toggle('hidden');
    if (!this.addForm.classList.contains('hidden')) {
      this.projectNameInput.focus();
    }
  }

  async saveProject() {
    const name = this.projectNameInput.value.trim();
    if (!name) return;

    const project = {
      id: this.generateId(),
      name,
      color: this.selectedColor,
      totalTime: 0,
      createdAt: Date.now()
    };

    this.data.projects.push(project);
    await this.saveData();

    this.projectNameInput.value = '';
    this.addForm.classList.add('hidden');
    this.renderProjects();
  }

  async deleteProject(id) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    if (this.data.activeTimer?.projectId === id) {
      this.stopTimer();
    }
    await this.saveData();
    this.renderProjects();
  }

  async startTimer(projectId) {
    // Stop any existing timer
    if (this.data.activeTimer) {
      await this.stopTimer();
    }

    const project = this.data.projects.find(p => p.id === projectId);
    if (!project) return;

    this.data.activeTimer = {
      projectId,
      projectName: project.name,
      projectColor: project.color,
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false
    };

    await this.saveData();
    this.startTimerDisplay();
    this.renderProjects();
  }

  startTimerDisplay() {
    this.activeTimerEl.classList.remove('hidden');
    this.timerProject.textContent = this.data.activeTimer.projectName;
    this.timerProject.style.color = this.data.activeTimer.projectColor;

    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => this.updateTimerDisplay(), 1000);
  }

  updateTimerDisplay() {
    if (!this.data.activeTimer) return;

    let elapsed;
    if (this.data.activeTimer.isPaused) {
      elapsed = this.data.activeTimer.pausedTime;
    } else {
      elapsed = Date.now() - this.data.activeTimer.startTime + this.data.activeTimer.pausedTime;
    }

    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    this.timerDisplay.textContent =
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async pauseTimer() {
    if (!this.data.activeTimer) return;

    if (this.data.activeTimer.isPaused) {
      // Resume
      this.data.activeTimer.startTime = Date.now();
      this.data.activeTimer.isPaused = false;
      this.pauseBtn.textContent = '⏸️';
    } else {
      // Pause
      this.data.activeTimer.pausedTime += Date.now() - this.data.activeTimer.startTime;
      this.data.activeTimer.isPaused = true;
      this.pauseBtn.textContent = '▶️';
    }

    await this.saveData();
  }

  async stopTimer() {
    if (!this.data.activeTimer) return;

    clearInterval(this.timerInterval);

    let elapsed;
    if (this.data.activeTimer.isPaused) {
      elapsed = this.data.activeTimer.pausedTime;
    } else {
      elapsed = Date.now() - this.data.activeTimer.startTime + this.data.activeTimer.pausedTime;
    }

    // Log this session
    this.data.todayLogs.push({
      projectId: this.data.activeTimer.projectId,
      duration: elapsed,
      endTime: Date.now()
    });

    // Update project total time
    const project = this.data.projects.find(p => p.id === this.data.activeTimer.projectId);
    if (project) {
      project.totalTime = (project.totalTime || 0) + elapsed;
    }

    this.data.activeTimer = null;
    await this.saveData();

    this.activeTimerEl.classList.add('hidden');
    this.pauseBtn.textContent = '⏸️';
    this.renderProjects();
    this.updateSummary();
  }

  formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  updateSummary() {
    const today = new Date().toDateString();
    const todayLogs = this.data.todayLogs.filter(log => {
      return new Date(log.endTime).toDateString() === today;
    });

    const totalMs = todayLogs.reduce((sum, log) => sum + log.duration, 0);
    const uniqueProjects = new Set(todayLogs.map(log => log.projectId)).size;

    this.todayTotalEl.textContent = this.formatTime(totalMs);
    this.todayProjectsEl.textContent = uniqueProjects;
  }

  renderProjects() {
    this.projectsList.innerHTML = this.data.projects.map(project => {
      const isActive = this.data.activeTimer?.projectId === project.id;

      return `
        <div class="project-card" style="border-color: ${project.color}" data-id="${project.id}">
          <div class="project-info">
            <div class="project-name">${project.name}</div>
            <div class="project-time">總計: ${this.formatTime(project.totalTime || 0)}</div>
          </div>
          <div class="project-actions">
            ${isActive ? '' : `<button class="project-btn play" title="開始">▶️</button>`}
            <button class="project-btn delete" title="刪除">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind events
    this.projectsList.querySelectorAll('.project-card').forEach(card => {
      const id = card.dataset.id;

      const playBtn = card.querySelector('.play');
      if (playBtn) {
        playBtn.addEventListener('click', () => this.startTimer(id));
      }

      card.querySelector('.delete').addEventListener('click', () => this.deleteProject(id));
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ProjectTimer();
});
