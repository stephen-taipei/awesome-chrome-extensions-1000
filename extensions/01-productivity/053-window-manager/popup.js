// Window Manager - Popup Script

class WindowManager {
  constructor() {
    this.currentWindowId = null;
    this.screenWidth = screen.availWidth;
    this.screenHeight = screen.availHeight;
    this.screenLeft = screen.availLeft || 0;
    this.screenTop = screen.availTop || 0;
    this.initElements();
    this.bindEvents();
    this.loadWindows();
    this.getCurrentWindow();
  }

  initElements() {
    this.windowList = document.getElementById('windowList');
    this.windowCount = document.getElementById('windowCount');
    this.minimizeAllBtn = document.getElementById('minimizeAllBtn');
    this.closeOthersBtn = document.getElementById('closeOthersBtn');
  }

  bindEvents() {
    // Layout buttons
    document.querySelectorAll('.layout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const layout = btn.dataset.layout;
        this.applyLayout(layout);
      });
    });

    // Multi-window layout buttons
    document.querySelectorAll('.multi-layout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const multi = btn.dataset.multi;
        this.applyMultiLayout(multi);
      });
    });

    this.minimizeAllBtn.addEventListener('click', () => this.minimizeAll());
    this.closeOthersBtn.addEventListener('click', () => this.closeOthers());
  }

  async getCurrentWindow() {
    const win = await chrome.windows.getCurrent();
    this.currentWindowId = win.id;
  }

  async loadWindows() {
    const windows = await chrome.windows.getAll({ populate: true });
    this.renderWindows(windows);
  }

  renderWindows(windows) {
    this.windowList.innerHTML = '';
    this.windowCount.textContent = windows.length;

    windows.forEach(win => {
      const isCurrent = win.id === this.currentWindowId;
      const item = document.createElement('div');
      item.className = `window-item ${isCurrent ? 'current' : ''}`;

      const tabCount = win.tabs?.length || 0;
      const windowType = this.getWindowType(win);

      item.innerHTML = `
        <span class="window-icon">${isCurrent ? '✅' : '🪟'}</span>
        <div class="window-info">
          <div class="window-tabs">${tabCount} 個分頁</div>
          <div class="window-type">${windowType}</div>
        </div>
        <button class="window-focus-btn" title="聚焦">👁️</button>
      `;

      item.querySelector('.window-focus-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusWindow(win.id);
      });

      item.addEventListener('click', () => {
        this.focusWindow(win.id);
      });

      this.windowList.appendChild(item);
    });
  }

  getWindowType(win) {
    if (win.type === 'popup') return '彈出視窗';
    if (win.type === 'panel') return '面板';
    if (win.type === 'app') return '應用程式';
    if (win.state === 'minimized') return '已最小化';
    if (win.state === 'maximized') return '已最大化';
    if (win.state === 'fullscreen') return '全螢幕';
    return '一般視窗';
  }

  async focusWindow(windowId) {
    await chrome.windows.update(windowId, { focused: true });
  }

  async applyLayout(layout) {
    const win = await chrome.windows.getCurrent();

    let updateInfo = {};

    switch (layout) {
      case 'maximize':
        updateInfo = { state: 'maximized' };
        break;

      case 'left':
        updateInfo = {
          state: 'normal',
          left: this.screenLeft,
          top: this.screenTop,
          width: Math.floor(this.screenWidth / 2),
          height: this.screenHeight
        };
        break;

      case 'right':
        updateInfo = {
          state: 'normal',
          left: this.screenLeft + Math.floor(this.screenWidth / 2),
          top: this.screenTop,
          width: Math.floor(this.screenWidth / 2),
          height: this.screenHeight
        };
        break;

      case 'top-left':
        updateInfo = {
          state: 'normal',
          left: this.screenLeft,
          top: this.screenTop,
          width: Math.floor(this.screenWidth / 2),
          height: Math.floor(this.screenHeight / 2)
        };
        break;

      case 'top-right':
        updateInfo = {
          state: 'normal',
          left: this.screenLeft + Math.floor(this.screenWidth / 2),
          top: this.screenTop,
          width: Math.floor(this.screenWidth / 2),
          height: Math.floor(this.screenHeight / 2)
        };
        break;

      case 'bottom-left':
        updateInfo = {
          state: 'normal',
          left: this.screenLeft,
          top: this.screenTop + Math.floor(this.screenHeight / 2),
          width: Math.floor(this.screenWidth / 2),
          height: Math.floor(this.screenHeight / 2)
        };
        break;

      case 'bottom-right':
        updateInfo = {
          state: 'normal',
          left: this.screenLeft + Math.floor(this.screenWidth / 2),
          top: this.screenTop + Math.floor(this.screenHeight / 2),
          width: Math.floor(this.screenWidth / 2),
          height: Math.floor(this.screenHeight / 2)
        };
        break;

      case 'center':
        const centerWidth = Math.floor(this.screenWidth * 0.7);
        const centerHeight = Math.floor(this.screenHeight * 0.8);
        updateInfo = {
          state: 'normal',
          left: this.screenLeft + Math.floor((this.screenWidth - centerWidth) / 2),
          top: this.screenTop + Math.floor((this.screenHeight - centerHeight) / 2),
          width: centerWidth,
          height: centerHeight
        };
        break;
    }

    // First set to normal state if needed (can't resize maximized window)
    if (layout !== 'maximize' && win.state !== 'normal') {
      await chrome.windows.update(win.id, { state: 'normal' });
    }

    await chrome.windows.update(win.id, updateInfo);
  }

  async applyMultiLayout(layout) {
    const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    const count = windows.length;

    if (count === 0) return;

    // Set all to normal state first
    for (const win of windows) {
      if (win.state !== 'normal') {
        await chrome.windows.update(win.id, { state: 'normal' });
      }
    }

    switch (layout) {
      case 'side-by-side':
        const sideWidth = Math.floor(this.screenWidth / count);
        for (let i = 0; i < count; i++) {
          await chrome.windows.update(windows[i].id, {
            left: this.screenLeft + (i * sideWidth),
            top: this.screenTop,
            width: sideWidth,
            height: this.screenHeight
          });
        }
        break;

      case 'grid':
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const gridWidth = Math.floor(this.screenWidth / cols);
        const gridHeight = Math.floor(this.screenHeight / rows);

        for (let i = 0; i < count; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          await chrome.windows.update(windows[i].id, {
            left: this.screenLeft + (col * gridWidth),
            top: this.screenTop + (row * gridHeight),
            width: gridWidth,
            height: gridHeight
          });
        }
        break;

      case 'stack':
        const stackHeight = Math.floor(this.screenHeight / count);
        for (let i = 0; i < count; i++) {
          await chrome.windows.update(windows[i].id, {
            left: this.screenLeft,
            top: this.screenTop + (i * stackHeight),
            width: this.screenWidth,
            height: stackHeight
          });
        }
        break;
    }

    this.loadWindows();
  }

  async minimizeAll() {
    const windows = await chrome.windows.getAll();
    for (const win of windows) {
      await chrome.windows.update(win.id, { state: 'minimized' });
    }
  }

  async closeOthers() {
    const windows = await chrome.windows.getAll();
    for (const win of windows) {
      if (win.id !== this.currentWindowId) {
        await chrome.windows.remove(win.id);
      }
    }
    this.loadWindows();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new WindowManager();
});
