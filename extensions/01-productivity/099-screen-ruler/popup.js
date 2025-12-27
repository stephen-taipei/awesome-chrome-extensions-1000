// Screen Ruler - Popup Script

class ScreenRuler {
  constructor() {
    this.history = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.startBtn = document.getElementById('startMeasure');
    this.widthValueEl = document.getElementById('widthValue');
    this.heightValueEl = document.getElementById('heightValue');
    this.diagonalValueEl = document.getElementById('diagonalValue');
    this.historyListEl = document.getElementById('historyList');
    this.clearHistoryBtn = document.getElementById('clearHistory');
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startMeasuring());
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // Listen for measurement results from content script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'measurementResult') {
        this.displayMeasurement(message.data);
      }
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('rulerHistory');
    if (result.rulerHistory) {
      this.history = result.rulerHistory;
    }
    this.renderHistory();
  }

  async saveData() {
    await chrome.storage.local.set({ rulerHistory: this.history });
  }

  async startMeasuring() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: this.injectRuler
    });

    window.close();
  }

  injectRuler() {
    // Remove existing ruler if any
    const existing = document.getElementById('screen-ruler-overlay');
    if (existing) existing.remove();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'screen-ruler-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483647;
      cursor: crosshair;
    `;

    // Create selection box
    const box = document.createElement('div');
    box.style.cssText = `
      position: absolute;
      border: 2px dashed #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      display: none;
    `;
    overlay.appendChild(box);

    // Create dimension label
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      background: #f59e0b;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 600;
      display: none;
      pointer-events: none;
    `;
    overlay.appendChild(label);

    let startX, startY, isDrawing = false;

    overlay.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDrawing = true;
      box.style.display = 'block';
      box.style.left = startX + 'px';
      box.style.top = startY + 'px';
      box.style.width = '0px';
      box.style.height = '0px';
    });

    overlay.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;

      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);
      const left = Math.min(e.clientX, startX);
      const top = Math.min(e.clientY, startY);

      box.style.left = left + 'px';
      box.style.top = top + 'px';
      box.style.width = width + 'px';
      box.style.height = height + 'px';

      label.style.display = 'block';
      label.style.left = (left + width + 10) + 'px';
      label.style.top = (top + height / 2 - 10) + 'px';
      label.textContent = `${width} × ${height} px`;
    });

    overlay.addEventListener('mouseup', (e) => {
      if (!isDrawing) return;
      isDrawing = false;

      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);

      if (width > 5 && height > 5) {
        chrome.runtime.sendMessage({
          type: 'measurementResult',
          data: { width, height }
        });
      }

      setTimeout(() => overlay.remove(), 500);
    });

    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
    overlay.focus();
  }

  displayMeasurement(data) {
    const { width, height } = data;
    const diagonal = Math.round(Math.sqrt(width * width + height * height));

    this.widthValueEl.textContent = `${width} px`;
    this.heightValueEl.textContent = `${height} px`;
    this.diagonalValueEl.textContent = `${diagonal} px`;

    // Add to history
    this.history.unshift({
      width,
      height,
      timestamp: Date.now()
    });

    if (this.history.length > 10) {
      this.history.pop();
    }

    this.saveData();
    this.renderHistory();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyListEl.innerHTML = '<div class="empty-state">No measurements yet</div>';
      return;
    }

    this.historyListEl.innerHTML = this.history.map(item => {
      const time = this.formatTime(item.timestamp);
      return `
        <div class="history-item">
          <span class="history-dimensions">${item.width} × ${item.height} px</span>
          <span class="history-time">${time}</span>
        </div>
      `;
    }).join('');
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  clearHistory() {
    this.history = [];
    this.saveData();
    this.renderHistory();
    this.widthValueEl.textContent = '— px';
    this.heightValueEl.textContent = '— px';
    this.diagonalValueEl.textContent = '— px';
  }
}

document.addEventListener('DOMContentLoaded', () => new ScreenRuler());
