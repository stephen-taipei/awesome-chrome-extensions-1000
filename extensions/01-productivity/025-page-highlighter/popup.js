// Page Highlighter - Popup Script

class HighlighterPopup {
  constructor() {
    this.currentColor = '#FFEB3B';
    this.enabled = true;
    this.currentUrl = '';

    this.initElements();
    this.loadSettings();
    this.getCurrentTab();
    this.bindEvents();
  }

  initElements() {
    this.colorPicker = document.getElementById('colorPicker');
    this.enableToggle = document.getElementById('enableToggle');
    this.highlightList = document.getElementById('highlightList');
    this.highlightCount = document.getElementById('highlightCount');
    this.totalCount = document.getElementById('totalCount');
    this.clearPageBtn = document.getElementById('clearPageBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.toast = document.getElementById('toast');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['highlighterSettings']);
      const settings = result.highlighterSettings || {};
      this.currentColor = settings.color || '#FFEB3B';
      this.enabled = settings.enabled !== false;

      this.enableToggle.checked = this.enabled;
      this.updateColorSelection();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        highlighterSettings: {
          color: this.currentColor,
          enabled: this.enabled
        }
      });

      // Notify content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'settingsUpdate',
          color: this.currentColor,
          enabled: this.enabled
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        this.currentUrl = new URL(tab.url).origin + new URL(tab.url).pathname;
        await this.loadHighlights();
      }
    } catch (error) {
      console.error('Failed to get current tab:', error);
    }
  }

  async loadHighlights() {
    try {
      const result = await chrome.storage.local.get(['highlights']);
      const allHighlights = result.highlights || {};
      const pageHighlights = allHighlights[this.currentUrl] || [];

      this.renderHighlights(pageHighlights);
      this.updateCounts(allHighlights);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  }

  renderHighlights(highlights) {
    this.highlightCount.textContent = highlights.length;

    if (highlights.length === 0) {
      this.highlightList.innerHTML = '<p class="empty-message">此頁面尚無標記</p>';
      return;
    }

    this.highlightList.innerHTML = highlights.map((h, index) => `
      <div class="highlight-item" data-index="${index}">
        <div class="highlight-color" style="background:${h.color}"></div>
        <span class="highlight-text">${this.escapeHtml(this.truncate(h.text, 60))}</span>
        <button class="highlight-delete" title="Delete">×</button>
      </div>
    `).join('');
  }

  updateCounts(allHighlights) {
    let total = 0;
    Object.values(allHighlights).forEach(highlights => {
      total += highlights.length;
    });
    this.totalCount.textContent = total;
  }

  updateColorSelection() {
    this.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === this.currentColor);
    });
  }

  setColor(color) {
    this.currentColor = color;
    this.updateColorSelection();
    this.saveSettings();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();
  }

  async deleteHighlight(index) {
    try {
      const result = await chrome.storage.local.get(['highlights']);
      const allHighlights = result.highlights || {};
      const pageHighlights = allHighlights[this.currentUrl] || [];

      if (index >= 0 && index < pageHighlights.length) {
        const deleted = pageHighlights.splice(index, 1)[0];
        allHighlights[this.currentUrl] = pageHighlights;

        await chrome.storage.local.set({ highlights: allHighlights });

        // Notify content script to remove highlight
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'removeHighlight',
            id: deleted.id
          }).catch(() => {});
        }

        this.renderHighlights(pageHighlights);
        this.updateCounts(allHighlights);
        this.showToast('已刪除標記', 'success');
      }
    } catch (error) {
      console.error('Failed to delete highlight:', error);
    }
  }

  async clearPage() {
    if (!confirm('確定要清除此頁面的所有標記嗎？')) return;

    try {
      const result = await chrome.storage.local.get(['highlights']);
      const allHighlights = result.highlights || {};

      delete allHighlights[this.currentUrl];

      await chrome.storage.local.set({ highlights: allHighlights });

      // Notify content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'clearHighlights'
        }).catch(() => {});
      }

      this.renderHighlights([]);
      this.updateCounts(allHighlights);
      this.showToast('已清除所有標記', 'success');
    } catch (error) {
      console.error('Failed to clear page:', error);
    }
  }

  async exportAll() {
    try {
      const result = await chrome.storage.local.get(['highlights']);
      const allHighlights = result.highlights || {};

      let content = '# Page Highlighter Export\n\n';
      content += `Export Date: ${new Date().toLocaleString('zh-TW')}\n\n---\n\n`;

      Object.entries(allHighlights).forEach(([url, highlights]) => {
        if (highlights.length > 0) {
          content += `## ${url}\n\n`;
          highlights.forEach(h => {
            content += `- ${h.text}\n`;
          });
          content += '\n';
        }
      });

      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `highlights-${new Date().toISOString().split('T')[0]}.md`;
      a.click();

      URL.revokeObjectURL(url);
      this.showToast('已匯出所有標記', 'success');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  }

  truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) this.toast.classList.add(type);

    setTimeout(() => this.toast.classList.add('hidden'), 2000);
  }

  bindEvents() {
    // Color selection
    this.colorPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-btn');
      if (btn) this.setColor(btn.dataset.color);
    });

    // Enable toggle
    this.enableToggle.addEventListener('change', (e) => {
      this.setEnabled(e.target.checked);
    });

    // Delete highlight
    this.highlightList.addEventListener('click', (e) => {
      if (e.target.classList.contains('highlight-delete')) {
        const item = e.target.closest('.highlight-item');
        if (item) {
          this.deleteHighlight(parseInt(item.dataset.index));
        }
      }
    });

    // Clear page
    this.clearPageBtn.addEventListener('click', () => this.clearPage());

    // Export
    this.exportBtn.addEventListener('click', () => this.exportAll());

    // Listen for highlight updates from content script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'highlightAdded') {
        this.loadHighlights();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HighlighterPopup();
});
