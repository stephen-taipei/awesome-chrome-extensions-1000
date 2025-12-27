// World Clock - Popup Script

const TIMEZONES = [
  { city: '台北', tz: 'Asia/Taipei', country: '台灣' },
  { city: '東京', tz: 'Asia/Tokyo', country: '日本' },
  { city: '首爾', tz: 'Asia/Seoul', country: '韓國' },
  { city: '上海', tz: 'Asia/Shanghai', country: '中國' },
  { city: '香港', tz: 'Asia/Hong_Kong', country: '中國' },
  { city: '新加坡', tz: 'Asia/Singapore', country: '新加坡' },
  { city: '雪梨', tz: 'Australia/Sydney', country: '澳洲' },
  { city: '墨爾本', tz: 'Australia/Melbourne', country: '澳洲' },
  { city: '奧克蘭', tz: 'Pacific/Auckland', country: '紐西蘭' },
  { city: '曼谷', tz: 'Asia/Bangkok', country: '泰國' },
  { city: '吉隆坡', tz: 'Asia/Kuala_Lumpur', country: '馬來西亞' },
  { city: '雅加達', tz: 'Asia/Jakarta', country: '印尼' },
  { city: '新德里', tz: 'Asia/Kolkata', country: '印度' },
  { city: '孟買', tz: 'Asia/Kolkata', country: '印度' },
  { city: '杜拜', tz: 'Asia/Dubai', country: '阿聯酋' },
  { city: '莫斯科', tz: 'Europe/Moscow', country: '俄羅斯' },
  { city: '倫敦', tz: 'Europe/London', country: '英國' },
  { city: '巴黎', tz: 'Europe/Paris', country: '法國' },
  { city: '柏林', tz: 'Europe/Berlin', country: '德國' },
  { city: '阿姆斯特丹', tz: 'Europe/Amsterdam', country: '荷蘭' },
  { city: '羅馬', tz: 'Europe/Rome', country: '義大利' },
  { city: '馬德里', tz: 'Europe/Madrid', country: '西班牙' },
  { city: '蘇黎世', tz: 'Europe/Zurich', country: '瑞士' },
  { city: '紐約', tz: 'America/New_York', country: '美國' },
  { city: '洛杉磯', tz: 'America/Los_Angeles', country: '美國' },
  { city: '芝加哥', tz: 'America/Chicago', country: '美國' },
  { city: '舊金山', tz: 'America/Los_Angeles', country: '美國' },
  { city: '西雅圖', tz: 'America/Los_Angeles', country: '美國' },
  { city: '多倫多', tz: 'America/Toronto', country: '加拿大' },
  { city: '溫哥華', tz: 'America/Vancouver', country: '加拿大' },
  { city: '聖保羅', tz: 'America/Sao_Paulo', country: '巴西' },
  { city: '墨西哥城', tz: 'America/Mexico_City', country: '墨西哥' }
];

class WorldClock {
  constructor() {
    this.clocks = [];
    this.localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.initElements();
    this.loadClocks();
    this.bindEvents();
    this.startClock();
  }

  initElements() {
    this.localTime = document.getElementById('localTime');
    this.localDate = document.getElementById('localDate');
    this.clocksList = document.getElementById('clocksList');
    this.addBtn = document.getElementById('addBtn');
    this.addModal = document.getElementById('addModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.searchInput = document.getElementById('searchInput');
    this.searchResults = document.getElementById('searchResults');
    this.convertTime = document.getElementById('convertTime');
    this.convertFrom = document.getElementById('convertFrom');
    this.convertResults = document.getElementById('convertResults');
  }

  async loadClocks() {
    try {
      const result = await chrome.storage.local.get(['worldClocks']);
      this.clocks = result.worldClocks || [
        { city: '東京', tz: 'Asia/Tokyo', country: '日本' },
        { city: '倫敦', tz: 'Europe/London', country: '英國' },
        { city: '紐約', tz: 'America/New_York', country: '美國' }
      ];
      this.render();
      this.updateConverter();
    } catch (error) {
      console.error('Failed to load clocks:', error);
    }
  }

  async saveClocks() {
    try {
      await chrome.storage.local.set({ worldClocks: this.clocks });
    } catch (error) {
      console.error('Failed to save clocks:', error);
    }
  }

  formatTime(date, tz, includeSeconds = false) {
    const options = {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    if (includeSeconds) {
      options.second = '2-digit';
    }
    return new Intl.DateTimeFormat('zh-TW', options).format(date);
  }

  formatDate(date, tz) {
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: tz,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  }

  getTimeDiff(tz) {
    const now = new Date();
    const localOffset = now.getTimezoneOffset();

    // Get offset for target timezone
    const targetDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: this.localTz }));

    const diffMs = targetDate - localDate;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours === 0) return '相同時區';
    return diffHours > 0 ? `+${diffHours} 小時` : `${diffHours} 小時`;
  }

  isDaytime(tz) {
    const now = new Date();
    const hour = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false
    }).format(now));
    return hour >= 6 && hour < 18;
  }

  render() {
    const now = new Date();

    // Update local time
    this.localTime.textContent = this.formatTime(now, this.localTz, true);
    this.localDate.textContent = this.formatDate(now, this.localTz);

    // Render clocks
    if (this.clocks.length === 0) {
      this.clocksList.innerHTML = '<div style="text-align:center;color:#64748b;padding:20px;">點擊右上角 + 新增時區</div>';
      return;
    }

    this.clocksList.innerHTML = this.clocks.map((clock, index) => {
      const isDay = this.isDaytime(clock.tz);
      return `
        <div class="clock-item ${isDay ? 'day' : 'night'}" data-index="${index}">
          <div class="clock-info">
            <div class="clock-city">${clock.city}</div>
            <div class="clock-timezone">${clock.country} · ${clock.tz}</div>
          </div>
          <div class="clock-time">
            <div class="clock-time-value">${this.formatTime(now, clock.tz)}</div>
            <div class="clock-diff">${this.getTimeDiff(clock.tz)}</div>
          </div>
          <button class="clock-remove" title="移除">×</button>
        </div>
      `;
    }).join('');
  }

  updateConverter() {
    // Populate converter dropdown
    const allTimezones = [
      { city: '本地', tz: this.localTz },
      ...this.clocks
    ];

    this.convertFrom.innerHTML = allTimezones.map(tz =>
      `<option value="${tz.tz}">${tz.city}</option>`
    ).join('');

    this.updateConvertResults();
  }

  updateConvertResults() {
    const timeStr = this.convertTime.value;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const fromTz = this.convertFrom.value;

    // Create a date in the source timezone
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const sourceDate = new Date(`${dateStr}T${timeStr}:00`);

    // Get the offset difference
    const results = this.clocks
      .filter(clock => clock.tz !== fromTz)
      .map(clock => {
        const convertedTime = this.formatTime(sourceDate, clock.tz);
        return `
          <div class="convert-result">
            <span class="city">${clock.city}</span>
            <span class="time">${convertedTime}</span>
          </div>
        `;
      }).join('');

    this.convertResults.innerHTML = results || '<div style="color:#64748b;font-size:12px;">新增更多時區以查看換算結果</div>';
  }

  showModal() {
    this.addModal.classList.remove('hidden');
    this.searchInput.focus();
    this.showAllTimezones();
  }

  hideModal() {
    this.addModal.classList.add('hidden');
    this.searchInput.value = '';
  }

  showAllTimezones() {
    this.searchResults.innerHTML = TIMEZONES.slice(0, 15).map(tz => `
      <div class="search-result" data-tz="${tz.tz}" data-city="${tz.city}" data-country="${tz.country}">
        <div class="result-city">${tz.city}</div>
        <div class="result-tz">${tz.country} · ${tz.tz}</div>
      </div>
    `).join('');
  }

  searchTimezones(query) {
    query = query.toLowerCase();
    const results = TIMEZONES.filter(tz =>
      tz.city.toLowerCase().includes(query) ||
      tz.country.toLowerCase().includes(query) ||
      tz.tz.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      this.searchResults.innerHTML = '<div style="color:#64748b;padding:10px;">找不到符合的時區</div>';
      return;
    }

    this.searchResults.innerHTML = results.map(tz => `
      <div class="search-result" data-tz="${tz.tz}" data-city="${tz.city}" data-country="${tz.country}">
        <div class="result-city">${tz.city}</div>
        <div class="result-tz">${tz.country} · ${tz.tz}</div>
      </div>
    `).join('');
  }

  addClock(city, tz, country) {
    // Check if already exists
    if (this.clocks.some(c => c.tz === tz && c.city === city)) {
      return;
    }

    this.clocks.push({ city, tz, country });
    this.saveClocks();
    this.render();
    this.updateConverter();
    this.hideModal();
  }

  removeClock(index) {
    this.clocks.splice(index, 1);
    this.saveClocks();
    this.render();
    this.updateConverter();
  }

  startClock() {
    setInterval(() => this.render(), 1000);
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.showModal());
    this.closeModalBtn.addEventListener('click', () => this.hideModal());
    this.addModal.addEventListener('click', (e) => {
      if (e.target === this.addModal) this.hideModal();
    });

    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query) {
        this.searchTimezones(query);
      } else {
        this.showAllTimezones();
      }
    });

    this.searchResults.addEventListener('click', (e) => {
      const result = e.target.closest('.search-result');
      if (result) {
        this.addClock(
          result.dataset.city,
          result.dataset.tz,
          result.dataset.country
        );
      }
    });

    this.clocksList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.clock-remove');
      if (removeBtn) {
        const item = removeBtn.closest('.clock-item');
        this.removeClock(parseInt(item.dataset.index));
      }
    });

    this.convertTime.addEventListener('change', () => this.updateConvertResults());
    this.convertFrom.addEventListener('change', () => this.updateConvertResults());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WorldClock();
});
