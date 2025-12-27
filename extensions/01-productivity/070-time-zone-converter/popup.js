// Time Zone Converter - Popup Script

const timeZones = [
  { id: 'Pacific/Auckland', name: '奧克蘭', offset: '+12:00' },
  { id: 'Asia/Tokyo', name: '東京', offset: '+09:00' },
  { id: 'Asia/Seoul', name: '首爾', offset: '+09:00' },
  { id: 'Asia/Shanghai', name: '上海', offset: '+08:00' },
  { id: 'Asia/Taipei', name: '台北', offset: '+08:00' },
  { id: 'Asia/Hong_Kong', name: '香港', offset: '+08:00' },
  { id: 'Asia/Singapore', name: '新加坡', offset: '+08:00' },
  { id: 'Asia/Bangkok', name: '曼谷', offset: '+07:00' },
  { id: 'Asia/Kolkata', name: '新德里', offset: '+05:30' },
  { id: 'Asia/Dubai', name: '杜拜', offset: '+04:00' },
  { id: 'Europe/Moscow', name: '莫斯科', offset: '+03:00' },
  { id: 'Europe/Istanbul', name: '伊斯坦堡', offset: '+03:00' },
  { id: 'Europe/Paris', name: '巴黎', offset: '+01:00' },
  { id: 'Europe/Berlin', name: '柏林', offset: '+01:00' },
  { id: 'Europe/London', name: '倫敦', offset: '+00:00' },
  { id: 'America/Sao_Paulo', name: '聖保羅', offset: '-03:00' },
  { id: 'America/New_York', name: '紐約', offset: '-05:00' },
  { id: 'America/Chicago', name: '芝加哥', offset: '-06:00' },
  { id: 'America/Denver', name: '丹佛', offset: '-07:00' },
  { id: 'America/Los_Angeles', name: '洛杉磯', offset: '-08:00' }
];

const defaultWorldClock = ['Asia/Taipei', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'America/Los_Angeles', 'Europe/Paris'];

class TimeZoneConverter {
  constructor() {
    this.data = {
      quickZones: ['America/New_York', 'Europe/London', 'Asia/Tokyo']
    };
    this.initElements();
    this.populateSelects();
    this.bindEvents();
    this.loadData();
    this.startClock();
  }

  initElements() {
    this.currentTimeEl = document.getElementById('currentTime');
    this.sourceTimeEl = document.getElementById('sourceTime');
    this.sourceZoneEl = document.getElementById('sourceZone');
    this.targetZoneEl = document.getElementById('targetZone');
    this.convertedTimeEl = document.getElementById('convertedTime');
    this.quickZonesEl = document.getElementById('quickZones');
    this.addQuickZoneBtn = document.getElementById('addQuickZone');
    this.worldClockEl = document.getElementById('worldClock');

    // Set default source time to now
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    this.sourceTimeEl.value = localDateTime;
  }

  populateSelects() {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    timeZones.forEach(zone => {
      const sourceOption = document.createElement('option');
      sourceOption.value = zone.id;
      sourceOption.textContent = `${zone.name} (UTC${zone.offset})`;
      if (zone.id === localZone || zone.name === '台北') {
        sourceOption.selected = true;
      }
      this.sourceZoneEl.appendChild(sourceOption);

      const targetOption = document.createElement('option');
      targetOption.value = zone.id;
      targetOption.textContent = `${zone.name} (UTC${zone.offset})`;
      this.targetZoneEl.appendChild(targetOption);
    });

    // Default target to New York
    this.targetZoneEl.value = 'America/New_York';
  }

  bindEvents() {
    this.sourceTimeEl.addEventListener('change', () => this.convert());
    this.sourceZoneEl.addEventListener('change', () => this.convert());
    this.targetZoneEl.addEventListener('change', () => this.convert());

    this.addQuickZoneBtn.addEventListener('click', () => this.showAddZoneDialog());
  }

  async loadData() {
    const result = await chrome.storage.local.get('timeZoneConverterData');
    if (result.timeZoneConverterData) {
      this.data = result.timeZoneConverterData;
    }
    this.renderQuickZones();
    this.renderWorldClock();
    this.convert();
  }

  async saveData() {
    await chrome.storage.local.set({ timeZoneConverterData: this.data });
  }

  startClock() {
    this.updateCurrentTime();
    setInterval(() => {
      this.updateCurrentTime();
      this.renderQuickZones();
      this.renderWorldClock();
    }, 1000);
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTimeEl.textContent = now.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getTimeInZone(date, timeZone) {
    return new Date(date.toLocaleString('en-US', { timeZone }));
  }

  formatTime(date, timeZone) {
    return date.toLocaleTimeString('zh-TW', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(date, timeZone) {
    return date.toLocaleString('zh-TW', {
      timeZone,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  convert() {
    const sourceTime = new Date(this.sourceTimeEl.value);
    const sourceZone = this.sourceZoneEl.value;
    const targetZone = this.targetZoneEl.value;

    if (isNaN(sourceTime.getTime())) return;

    // Convert the source time to target timezone
    const result = sourceTime.toLocaleString('zh-TW', {
      timeZone: targetZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.convertedTimeEl.textContent = result;
  }

  renderQuickZones() {
    const now = new Date();

    this.quickZonesEl.innerHTML = this.data.quickZones.map(zoneId => {
      const zone = timeZones.find(z => z.id === zoneId);
      if (!zone) return '';

      const time = this.formatTime(now, zoneId);

      return `
        <div class="quick-zone" data-zone="${zoneId}">
          <div class="zone-info">
            <span class="zone-name">${zone.name}</span>
            <span class="zone-offset">UTC${zone.offset}</span>
          </div>
          <span class="zone-time">${time}</span>
          <button class="zone-remove" data-zone="${zoneId}">×</button>
        </div>
      `;
    }).join('');

    // Bind events
    this.quickZonesEl.querySelectorAll('.quick-zone').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.classList.contains('zone-remove')) {
          const zoneId = el.dataset.zone;
          this.targetZoneEl.value = zoneId;
          this.convert();
        }
      });
    });

    this.quickZonesEl.querySelectorAll('.zone-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeQuickZone(btn.dataset.zone);
      });
    });
  }

  renderWorldClock() {
    const now = new Date();

    this.worldClockEl.innerHTML = defaultWorldClock.map(zoneId => {
      const zone = timeZones.find(z => z.id === zoneId);
      if (!zone) return '';

      const time = this.formatTime(now, zoneId);
      const dateStr = now.toLocaleDateString('zh-TW', {
        timeZone: zoneId,
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="world-clock-item">
          <span class="clock-city">${zone.name}</span>
          <span class="clock-time">${time}</span>
          <span class="clock-date">${dateStr}</span>
        </div>
      `;
    }).join('');
  }

  showAddZoneDialog() {
    const availableZones = timeZones.filter(z => !this.data.quickZones.includes(z.id));

    if (availableZones.length === 0) {
      alert('已添加所有時區');
      return;
    }

    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; padding: 8px; margin-top: 8px; border-radius: 6px;';

    availableZones.forEach(zone => {
      const option = document.createElement('option');
      option.value = zone.id;
      option.textContent = `${zone.name} (UTC${zone.offset})`;
      select.appendChild(option);
    });

    // Simple inline dialog
    const firstZone = availableZones[0];
    this.addQuickZone(firstZone.id);
  }

  async addQuickZone(zoneId) {
    if (!this.data.quickZones.includes(zoneId)) {
      this.data.quickZones.push(zoneId);
      await this.saveData();
      this.renderQuickZones();
    }
  }

  async removeQuickZone(zoneId) {
    this.data.quickZones = this.data.quickZones.filter(z => z !== zoneId);
    await this.saveData();
    this.renderQuickZones();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TimeZoneConverter();
});
