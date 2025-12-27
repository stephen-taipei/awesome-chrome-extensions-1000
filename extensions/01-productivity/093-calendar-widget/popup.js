// Calendar Widget - Popup Script

class CalendarWidget {
  constructor() {
    this.data = { events: {} };
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.monthYearEl = document.getElementById('monthYear');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.calendarGridEl = document.getElementById('calendarGrid');
    this.selectedDateTextEl = document.getElementById('selectedDateText');
    this.todayBtn = document.getElementById('todayBtn');
    this.eventInputEl = document.getElementById('eventInput');
    this.addEventBtn = document.getElementById('addEventBtn');
    this.eventsListEl = document.getElementById('eventsList');
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextBtn.addEventListener('click', () => this.changeMonth(1));
    this.todayBtn.addEventListener('click', () => this.goToToday());
    this.addEventBtn.addEventListener('click', () => this.addEvent());
    this.eventInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addEvent();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('calendarWidgetData');
    if (result.calendarWidgetData) {
      this.data = result.calendarWidgetData;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ calendarWidgetData: this.data });
  }

  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.render();
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.render();
  }

  selectDate(date) {
    this.selectedDate = new Date(date);
    this.render();
  }

  async addEvent() {
    const text = this.eventInputEl.value.trim();
    if (!text) return;

    const dateKey = this.getDateKey(this.selectedDate);
    if (!this.data.events[dateKey]) {
      this.data.events[dateKey] = [];
    }

    this.data.events[dateKey].push({
      id: Date.now().toString(36),
      text,
      createdAt: Date.now()
    });

    await this.saveData();
    this.eventInputEl.value = '';
    this.render();
  }

  async deleteEvent(dateKey, eventId) {
    if (this.data.events[dateKey]) {
      this.data.events[dateKey] = this.data.events[dateKey].filter(e => e.id !== eventId);
      if (this.data.events[dateKey].length === 0) {
        delete this.data.events[dateKey];
      }
      await this.saveData();
      this.render();
    }
  }

  render() {
    this.renderHeader();
    this.renderCalendar();
    this.renderSelectedDate();
    this.renderEvents();
  }

  renderHeader() {
    const options = { month: 'long', year: 'numeric' };
    this.monthYearEl.textContent = this.currentDate.toLocaleDateString('en-US', options);
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    const todayKey = this.getDateKey(today);
    const selectedKey = this.getDateKey(this.selectedDate);

    let html = '';

    // Previous month days
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLast - i;
      html += `<div class="day-cell other-month">${day}</div>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = this.getDateKey(date);
      const isToday = dateKey === todayKey;
      const isSelected = dateKey === selectedKey;
      const hasEvents = this.data.events[dateKey]?.length > 0;

      let classes = 'day-cell';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';
      if (hasEvents) classes += ' has-events';

      html += `<div class="${classes}" data-date="${dateKey}">${day}</div>`;
    }

    // Next month days
    const totalCells = startDay + daysInMonth;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="day-cell other-month">${i}</div>`;
    }

    this.calendarGridEl.innerHTML = html;

    this.calendarGridEl.querySelectorAll('.day-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        this.selectDate(cell.dataset.date);
      });
    });
  }

  renderSelectedDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    this.selectedDateTextEl.textContent = this.selectedDate.toLocaleDateString('en-US', options);
  }

  renderEvents() {
    const dateKey = this.getDateKey(this.selectedDate);
    const events = this.data.events[dateKey] || [];

    this.eventsListEl.innerHTML = events.map(event => `
      <div class="event-item" data-id="${event.id}">
        <span>${event.text}</span>
        <button>×</button>
      </div>
    `).join('');

    this.eventsListEl.querySelectorAll('.event-item button').forEach(btn => {
      btn.addEventListener('click', () => {
        const eventId = btn.parentElement.dataset.id;
        this.deleteEvent(dateKey, eventId);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new CalendarWidget());
