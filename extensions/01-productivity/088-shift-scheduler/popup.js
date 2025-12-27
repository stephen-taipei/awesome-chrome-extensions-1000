// Shift Scheduler - Popup Script

class ShiftScheduler {
  constructor() {
    this.data = {
      shifts: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDate();
  }

  initElements() {
    this.weekHoursEl = document.getElementById('weekHours');
    this.monthHoursEl = document.getElementById('monthHours');
    this.upcomingCountEl = document.getElementById('upcomingCount');
    this.shiftDateEl = document.getElementById('shiftDate');
    this.startTimeEl = document.getElementById('startTime');
    this.endTimeEl = document.getElementById('endTime');
    this.shiftTypeEl = document.getElementById('shiftType');
    this.addBtn = document.getElementById('addBtn');
    this.weekViewEl = document.getElementById('weekView');
    this.shiftsListEl = document.getElementById('shiftsList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addShift());
  }

  async loadData() {
    const result = await chrome.storage.local.get('shiftSchedulerData');
    if (result.shiftSchedulerData) {
      this.data = result.shiftSchedulerData;
    }
    this.updateUI();
  }

  async saveData() {
    await chrome.storage.local.set({ shiftSchedulerData: this.data });
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    this.shiftDateEl.value = today;
    this.startTimeEl.value = '09:00';
    this.endTimeEl.value = '17:00';
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }

  getMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  calculateDuration(startTime, endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let hours = endH - startH;
    let mins = endM - startM;
    if (mins < 0) {
      hours--;
      mins += 60;
    }
    return hours + mins / 60;
  }

  async addShift() {
    const date = this.shiftDateEl.value;
    const startTime = this.startTimeEl.value;
    const endTime = this.endTimeEl.value;
    const type = this.shiftTypeEl.value;

    if (!date || !startTime || !endTime) {
      this.addBtn.textContent = 'Fill all fields!';
      setTimeout(() => {
        this.addBtn.textContent = 'Add Shift';
      }, 1500);
      return;
    }

    const duration = this.calculateDuration(startTime, endTime);
    if (duration <= 0) {
      this.addBtn.textContent = 'Invalid time!';
      setTimeout(() => {
        this.addBtn.textContent = 'Add Shift';
      }, 1500);
      return;
    }

    const shift = {
      id: this.generateId(),
      date,
      startTime,
      endTime,
      type,
      duration,
      createdAt: Date.now()
    };

    this.data.shifts.push(shift);
    await this.saveData();
    this.setDefaultDate();
    this.updateUI();
  }

  async deleteShift(id) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    await this.saveData();
    this.updateUI();
  }

  getWeekShifts() {
    const weekStart = this.getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return this.data.shifts.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate >= weekStart && shiftDate < weekEnd;
    });
  }

  getMonthShifts() {
    const monthStart = this.getMonthStart();
    return this.data.shifts.filter(s => new Date(s.date) >= monthStart);
  }

  getUpcomingShifts() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.shifts
      .filter(s => s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  updateUI() {
    const weekShifts = this.getWeekShifts();
    const monthShifts = this.getMonthShifts();
    const upcomingShifts = this.getUpcomingShifts();

    const weekHours = weekShifts.reduce((sum, s) => sum + s.duration, 0);
    const monthHours = monthShifts.reduce((sum, s) => sum + s.duration, 0);

    this.weekHoursEl.textContent = Math.round(weekHours) + 'h';
    this.monthHoursEl.textContent = Math.round(monthHours) + 'h';
    this.upcomingCountEl.textContent = upcomingShifts.length;

    this.renderWeekView();
    this.renderShifts(upcomingShifts.slice(0, 5));
  }

  renderWeekView() {
    const weekStart = this.getWeekStart();
    const today = new Date().toISOString().split('T')[0];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let html = '';
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === today;

      const dayShifts = this.data.shifts.filter(s => s.date === dateStr);
      const dayHours = dayShifts.reduce((sum, s) => sum + s.duration, 0);

      html += `
        <div class="day-column ${isToday ? 'today' : ''}">
          <div class="day-name">${days[i]}</div>
          <div class="day-date">${date.getDate()}</div>
          <div class="day-hours ${dayHours > 0 ? 'has-shift' : ''}">${dayHours > 0 ? dayHours.toFixed(1) + 'h' : '-'}</div>
        </div>
      `;
    }
    this.weekViewEl.innerHTML = html;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  renderShifts(shifts) {
    this.shiftsListEl.innerHTML = shifts.map(shift => `
      <div class="shift-item ${shift.type}" data-id="${shift.id}">
        <span class="shift-date">${this.formatDate(shift.date)}</span>
        <span class="shift-time">${shift.startTime} - ${shift.endTime}</span>
        <span class="shift-duration">${shift.duration.toFixed(1)}h</span>
        <button class="shift-delete">×</button>
      </div>
    `).join('');

    this.shiftsListEl.querySelectorAll('.shift-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.parentElement.dataset.id;
        this.deleteShift(id);
      });
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ShiftScheduler();
});
