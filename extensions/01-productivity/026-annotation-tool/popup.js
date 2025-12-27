// Annotation Tool - Popup Script

class AnnotationPopup {
  constructor() {
    this.isActive = false;
    this.currentTool = 'pen';
    this.currentColor = '#FF0000';
    this.currentSize = 3;

    this.initElements();
    this.loadState();
    this.bindEvents();
  }

  initElements() {
    this.toggleBtn = document.getElementById('toggleBtn');
    this.toggleText = this.toggleBtn.querySelector('.toggle-text');
    this.toolBtns = document.querySelectorAll('.tool-btn');
    this.colorBtns = document.querySelectorAll('.color-btn');
    this.sizeSlider = document.getElementById('sizeSlider');
    this.sizeValue = document.getElementById('sizeValue');
    this.undoBtn = document.getElementById('undoBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.annotationCount = document.getElementById('annotationCount');
    this.toast = document.getElementById('toast');
  }

  async loadState() {
    try {
      const result = await chrome.storage.local.get(['annotationSettings']);
      const settings = result.annotationSettings || {};

      this.currentTool = settings.tool || 'pen';
      this.currentColor = settings.color || '#FF0000';
      this.currentSize = settings.size || 3;

      this.updateToolSelection();
      this.updateColorSelection();
      this.sizeSlider.value = this.currentSize;
      this.sizeValue.textContent = this.currentSize + 'px';

      // Check if annotation mode is active on current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { type: 'getState' });
          this.isActive = response?.active || false;
          this.updateToggleButton();
          this.annotationCount.textContent = `本頁 ${response?.count || 0} 個標註`;
        } catch (e) {
          // Content script not injected yet
        }
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        annotationSettings: {
          tool: this.currentTool,
          color: this.currentColor,
          size: this.currentSize
        }
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  updateToggleButton() {
    this.toggleBtn.classList.toggle('active', this.isActive);
    this.toggleText.textContent = this.isActive ? '停止標註' : '開始標註';
  }

  updateToolSelection() {
    this.toolBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === this.currentTool);
    });
  }

  updateColorSelection() {
    this.colorBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === this.currentColor);
    });
  }

  async toggleAnnotation() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    if (!this.isActive) {
      // Inject content script and start annotation
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content.css']
        });
      } catch (e) {
        // Script might already be injected
      }

      await chrome.tabs.sendMessage(tab.id, {
        type: 'start',
        tool: this.currentTool,
        color: this.currentColor,
        size: this.currentSize
      });

      this.isActive = true;
    } else {
      await chrome.tabs.sendMessage(tab.id, { type: 'stop' });
      this.isActive = false;
    }

    this.updateToggleButton();
  }

  async sendSettings() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && this.isActive) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'updateSettings',
        tool: this.currentTool,
        color: this.currentColor,
        size: this.currentSize
      }).catch(() => {});
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    this.updateToolSelection();
    this.saveSettings();
    this.sendSettings();
  }

  setColor(color) {
    this.currentColor = color;
    this.updateColorSelection();
    this.saveSettings();
    this.sendSettings();
  }

  setSize(size) {
    this.currentSize = size;
    this.sizeValue.textContent = size + 'px';
    this.saveSettings();
    this.sendSettings();
  }

  async undo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'undo' });
      if (response?.count !== undefined) {
        this.annotationCount.textContent = `本頁 ${response.count} 個標註`;
      }
    }
  }

  async clear() {
    if (!confirm('確定要清除所有標註嗎？')) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, { type: 'clear' });
      this.annotationCount.textContent = '本頁 0 個標註';
      this.showToast('已清除所有標註', 'success');
    }
  }

  async save() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'save' });
      if (response?.success) {
        this.showToast('已儲存標註', 'success');
      }
    }
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggleAnnotation());

    this.toolBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
    });

    this.colorBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setColor(btn.dataset.color));
    });

    this.sizeSlider.addEventListener('input', (e) => {
      this.setSize(parseInt(e.target.value));
    });

    this.undoBtn.addEventListener('click', () => this.undo());
    this.clearBtn.addEventListener('click', () => this.clear());
    this.saveBtn.addEventListener('click', () => this.save());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AnnotationPopup();
});
