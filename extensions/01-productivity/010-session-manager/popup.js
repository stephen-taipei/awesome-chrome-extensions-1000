document.addEventListener('DOMContentLoaded', () => {
  const currentTabsEl = document.getElementById('currentTabs');
  const sessionsListEl = document.getElementById('sessionsList');
  const saveSessionBtn = document.getElementById('saveSession');
  const saveModal = document.getElementById('saveModal');
  const sessionNameInput = document.getElementById('sessionName');
  const confirmSaveBtn = document.getElementById('confirmSave');
  const cancelSaveBtn = document.getElementById('cancelSave');

  let sessions = [];
  let currentTabs = [];

  // Load current tabs and saved sessions
  loadCurrentTabs();
  loadSessions();

  function loadCurrentTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      currentTabs = tabs.map(t => ({
        title: t.title,
        url: t.url,
        favIconUrl: t.favIconUrl
      }));
      renderCurrentTabs();
    });
  }

  function loadSessions() {
    chrome.storage.local.get(['sessions'], (result) => {
      sessions = result.sessions || [];
      renderSessions();
    });
  }

  function renderCurrentTabs() {
    currentTabsEl.innerHTML = currentTabs.slice(0, 8).map(tab => `
      <div class="tab-chip">
        <img src="${tab.favIconUrl || ''}" onerror="this.style.display='none'">
        <span>${truncate(tab.title, 15)}</span>
      </div>
    `).join('') + (currentTabs.length > 8 ? `<div class="tab-chip">+${currentTabs.length - 8} more</div>` : '');
  }

  function renderSessions() {
    if (sessions.length === 0) {
      sessionsListEl.innerHTML = `
        <div class="empty-state">
          <div class="icon">📁</div>
          <p>No saved sessions</p>
        </div>
      `;
      return;
    }

    sessionsListEl.innerHTML = sessions.map(session => `
      <div class="session-card" data-id="${session.id}">
        <div class="session-header">
          <span class="session-name">${escapeHtml(session.name)}</span>
          <span class="session-meta">${session.tabs.length} tabs • ${formatDate(session.createdAt)}</span>
        </div>
        <div class="session-tabs">
          ${session.tabs.slice(0, 6).map(tab => `
            <div class="tab-chip">
              <img src="${tab.favIconUrl || ''}" onerror="this.style.display='none'">
              <span>${truncate(tab.title, 12)}</span>
            </div>
          `).join('')}
          ${session.tabs.length > 6 ? `<div class="tab-chip">+${session.tabs.length - 6}</div>` : ''}
        </div>
        <div class="session-actions">
          <button class="btn-restore">Restore</button>
          <button class="btn-delete">Delete</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.session-card').forEach(card => {
      const id = card.dataset.id;

      card.querySelector('.btn-restore').addEventListener('click', () => {
        restoreSession(id);
      });

      card.querySelector('.btn-delete').addEventListener('click', () => {
        deleteSession(id);
      });
    });
  }

  function showSaveModal() {
    sessionNameInput.value = `Session ${new Date().toLocaleDateString()}`;
    saveModal.classList.remove('hidden');
    sessionNameInput.focus();
    sessionNameInput.select();
  }

  function hideSaveModal() {
    saveModal.classList.add('hidden');
  }

  function saveCurrentSession() {
    const name = sessionNameInput.value.trim() || 'Unnamed Session';

    const session = {
      id: generateId(),
      name,
      tabs: currentTabs,
      createdAt: Date.now()
    };

    sessions.unshift(session);
    chrome.storage.local.set({ sessions }, () => {
      hideSaveModal();
      renderSessions();
    });
  }

  function restoreSession(id) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    session.tabs.forEach(tab => {
      chrome.tabs.create({ url: tab.url, active: false });
    });
  }

  function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    chrome.storage.local.set({ sessions }, () => {
      renderSessions();
    });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  saveSessionBtn.addEventListener('click', showSaveModal);
  confirmSaveBtn.addEventListener('click', saveCurrentSession);
  cancelSaveBtn.addEventListener('click', hideSaveModal);

  sessionNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveCurrentSession();
    if (e.key === 'Escape') hideSaveModal();
  });

  saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) hideSaveModal();
  });
});
