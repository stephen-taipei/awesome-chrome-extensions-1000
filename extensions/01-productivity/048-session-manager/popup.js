// Session Manager - Popup Script

class SessionManager {
  constructor() {
    this.sessions = [];
    this.currentTabs = [];
    this.selectedSessionId = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.sessionList = document.getElementById('sessionList');
    this.emptyState = document.getElementById('emptyState');
    this.currentTabCount = document.getElementById('currentTabCount');

    // Save modal
    this.saveSessionBtn = document.getElementById('saveSessionBtn');
    this.saveModal = document.getElementById('saveModal');
    this.sessionName = document.getElementById('sessionName');
    this.previewCount = document.getElementById('previewCount');
    this.tabPreviewList = document.getElementById('tabPreviewList');
    this.confirmSaveBtn = document.getElementById('confirmSaveBtn');

    // Restore modal
    this.restoreModal = document.getElementById('restoreModal');
    this.restoreModalTitle = document.getElementById('restoreModalTitle');
  }

  bindEvents() {
    // Save session
    this.saveSessionBtn.addEventListener('click', () => this.openSaveModal());
    this.confirmSaveBtn.addEventListener('click', () => this.saveSession());
    this.sessionName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveSession();
    });

    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        document.getElementById(modalId).classList.add('hidden');
      });
    });

    // Modal backdrop clicks
    [this.saveModal, this.restoreModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });

    // Restore options
    this.restoreModal.querySelectorAll('.restore-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.restoreSession(this.selectedSessionId, action);
        this.restoreModal.classList.add('hidden');
      });
    });
  }

  async loadData() {
    // Load sessions
    const result = await chrome.storage.local.get(['savedSessions']);
    this.sessions = result.savedSessions || [];

    // Get current tabs
    this.currentTabs = await chrome.tabs.query({ currentWindow: true });
    this.currentTabCount.textContent = this.currentTabs.length;

    this.renderSessions();
  }

  async saveData() {
    await chrome.storage.local.set({ savedSessions: this.sessions });
  }

  async openSaveModal() {
    this.currentTabs = await chrome.tabs.query({ currentWindow: true });

    // Filter out chrome:// and extension pages
    const savableTabs = this.currentTabs.filter(tab =>
      !tab.url.startsWith('chrome://') &&
      !tab.url.startsWith('chrome-extension://')
    );

    this.previewCount.textContent = savableTabs.length;

    // Generate preview list
    this.tabPreviewList.innerHTML = savableTabs.map(tab => `
      <div class="preview-item">
        <img src="${this.getFaviconUrl(tab.url)}" onerror="this.style.display='none'">
        <span>${this.escapeHtml(tab.title.substring(0, 40))}${tab.title.length > 40 ? '...' : ''}</span>
      </div>
    `).join('');

    // Default session name
    const date = new Date();
    this.sessionName.value = `工作階段 ${date.toLocaleDateString('zh-TW')} ${date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`;

    this.saveModal.classList.remove('hidden');
    this.sessionName.select();
  }

  async saveSession() {
    const name = this.sessionName.value.trim();
    if (!name) return;

    // Get savable tabs
    const tabs = this.currentTabs
      .filter(tab =>
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('chrome-extension://')
      )
      .map(tab => ({
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl || ''
      }));

    if (tabs.length === 0) return;

    const session = {
      id: Date.now().toString(),
      name,
      tabs,
      createdAt: new Date().toISOString()
    };

    this.sessions.unshift(session);
    await this.saveData();
    this.renderSessions();
    this.saveModal.classList.add('hidden');
  }

  openRestoreModal(session) {
    this.selectedSessionId = session.id;
    this.restoreModalTitle.textContent = `還原「${session.name}」`;
    this.restoreModal.classList.remove('hidden');
  }

  async restoreSession(sessionId, action) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;

    if (action === 'replace') {
      // Close all current tabs except one (we need at least one)
      const currentTabs = await chrome.tabs.query({ currentWindow: true });

      // Open session tabs first
      for (const tab of session.tabs) {
        await chrome.tabs.create({ url: tab.url });
      }

      // Then close old tabs
      const tabIdsToClose = currentTabs.map(t => t.id);
      await chrome.tabs.remove(tabIdsToClose);
    } else {
      // Just add new tabs
      for (const tab of session.tabs) {
        await chrome.tabs.create({ url: tab.url });
      }
    }

    window.close();
  }

  async deleteSession(sessionId) {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    await this.saveData();
    this.renderSessions();
  }

  getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return '今天 ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 172800000) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    }
  }

  renderSessions() {
    this.sessionList.innerHTML = '';

    if (this.sessions.length === 0) {
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    this.sessions.forEach(session => {
      const item = document.createElement('div');
      item.className = 'session-item';

      item.innerHTML = `
        <div class="session-header">
          <div class="session-icon">📑</div>
          <div class="session-info">
            <div class="session-name">${this.escapeHtml(session.name)}</div>
            <div class="session-meta">
              <span>${session.tabs.length} 個分頁</span>
              <span>•</span>
              <span>${this.formatDate(session.createdAt)}</span>
            </div>
          </div>
          <div class="session-actions">
            <button class="action-btn restore" data-id="${session.id}" title="還原">▶️</button>
            <button class="action-btn delete" data-id="${session.id}" title="刪除">🗑️</button>
          </div>
        </div>
        <div class="session-tabs">
          ${session.tabs.slice(0, 5).map(tab => `
            <div class="tab-item" data-url="${this.escapeHtml(tab.url)}">
              <div class="tab-favicon">
                <img src="${this.getFaviconUrl(tab.url)}" onerror="this.parentElement.textContent='🔗'">
              </div>
              <span class="tab-title">${this.escapeHtml(tab.title)}</span>
            </div>
          `).join('')}
          ${session.tabs.length > 5 ? `<div class="tab-item"><span class="tab-title">還有 ${session.tabs.length - 5} 個分頁...</span></div>` : ''}
        </div>
      `;

      // Toggle expand
      const header = item.querySelector('.session-header');
      header.addEventListener('click', (e) => {
        if (!e.target.closest('.action-btn')) {
          item.classList.toggle('expanded');
        }
      });

      // Restore button
      const restoreBtn = item.querySelector('.restore');
      restoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openRestoreModal(session);
      });

      // Delete button
      const deleteBtn = item.querySelector('.delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSession(session.id);
      });

      // Tab clicks
      item.querySelectorAll('.tab-item[data-url]').forEach(tabEl => {
        tabEl.addEventListener('click', () => {
          chrome.tabs.create({ url: tabEl.dataset.url });
        });
      });

      this.sessionList.appendChild(item);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new SessionManager();
});
