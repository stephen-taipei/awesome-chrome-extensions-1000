// Workspace Manager - Popup Script

class WorkspaceManager {
  constructor() {
    this.workspaces = [];
    this.currentWorkspaceId = null;
    this.editingId = null;
    this.selectedColor = '#3b82f6';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.workspaceList = document.getElementById('workspaceList');
    this.emptyState = document.getElementById('emptyState');
    this.currentName = document.getElementById('currentName');

    // Modal elements
    this.newWorkspaceBtn = document.getElementById('newWorkspaceBtn');
    this.modal = document.getElementById('newModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.workspaceName = document.getElementById('workspaceName');
    this.colorPicker = document.getElementById('colorPicker');
    this.saveCurrentTabs = document.getElementById('saveCurrentTabs');
    this.saveWorkspaceBtn = document.getElementById('saveWorkspaceBtn');
    this.deleteWorkspaceBtn = document.getElementById('deleteWorkspaceBtn');
  }

  bindEvents() {
    this.newWorkspaceBtn.addEventListener('click', () => this.openNewModal());

    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        document.getElementById(modalId).classList.add('hidden');
      });
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.modal.classList.add('hidden');
    });

    this.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.colorPicker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedColor = btn.dataset.color;
      });
    });

    this.saveWorkspaceBtn.addEventListener('click', () => this.saveWorkspace());
    this.deleteWorkspaceBtn.addEventListener('click', () => this.deleteWorkspace());
    this.workspaceName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveWorkspace();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get(['workspaces', 'currentWorkspaceId']);
    this.workspaces = result.workspaces || [];
    this.currentWorkspaceId = result.currentWorkspaceId || null;

    this.updateCurrentWorkspaceDisplay();
    this.renderWorkspaces();
  }

  async saveData() {
    await chrome.storage.local.set({
      workspaces: this.workspaces,
      currentWorkspaceId: this.currentWorkspaceId
    });
  }

  updateCurrentWorkspaceDisplay() {
    if (this.currentWorkspaceId) {
      const current = this.workspaces.find(w => w.id === this.currentWorkspaceId);
      this.currentName.textContent = current?.name || '無';
    } else {
      this.currentName.textContent = '無';
    }
  }

  openNewModal() {
    this.editingId = null;
    this.modalTitle.textContent = '新增工作區';
    this.saveWorkspaceBtn.textContent = '建立';
    this.deleteWorkspaceBtn.classList.add('hidden');
    this.workspaceName.value = '';
    this.saveCurrentTabs.checked = true;
    this.saveCurrentTabs.parentElement.style.display = '';
    this.selectedColor = '#3b82f6';

    this.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === '#3b82f6');
    });

    this.modal.classList.remove('hidden');
    this.workspaceName.focus();
  }

  openEditModal(workspace) {
    this.editingId = workspace.id;
    this.modalTitle.textContent = '編輯工作區';
    this.saveWorkspaceBtn.textContent = '儲存';
    this.deleteWorkspaceBtn.classList.remove('hidden');
    this.workspaceName.value = workspace.name;
    this.saveCurrentTabs.parentElement.style.display = 'none';
    this.selectedColor = workspace.color;

    this.colorPicker.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === workspace.color);
    });

    this.modal.classList.remove('hidden');
    this.workspaceName.focus();
  }

  async saveWorkspace() {
    const name = this.workspaceName.value.trim();
    if (!name) return;

    if (this.editingId) {
      // Update existing
      const workspace = this.workspaces.find(w => w.id === this.editingId);
      if (workspace) {
        workspace.name = name;
        workspace.color = this.selectedColor;
      }
    } else {
      // Create new
      let tabs = [];
      if (this.saveCurrentTabs.checked) {
        const currentTabs = await chrome.tabs.query({ currentWindow: true });
        tabs = currentTabs
          .filter(t => !t.url.startsWith('chrome://'))
          .map(t => ({
            title: t.title,
            url: t.url,
            favicon: t.favIconUrl
          }));
      }

      const workspace = {
        id: Date.now().toString(),
        name,
        color: this.selectedColor,
        tabs,
        createdAt: new Date().toISOString()
      };

      this.workspaces.push(workspace);

      // Set as current if it has tabs
      if (tabs.length > 0) {
        this.currentWorkspaceId = workspace.id;
      }
    }

    await this.saveData();
    this.updateCurrentWorkspaceDisplay();
    this.renderWorkspaces();
    this.modal.classList.add('hidden');
  }

  async deleteWorkspace() {
    if (!this.editingId) return;

    this.workspaces = this.workspaces.filter(w => w.id !== this.editingId);

    if (this.currentWorkspaceId === this.editingId) {
      this.currentWorkspaceId = null;
    }

    await this.saveData();
    this.updateCurrentWorkspaceDisplay();
    this.renderWorkspaces();
    this.modal.classList.add('hidden');
  }

  async switchToWorkspace(workspace) {
    // Save current tabs to current workspace first
    if (this.currentWorkspaceId && this.currentWorkspaceId !== workspace.id) {
      const currentWorkspace = this.workspaces.find(w => w.id === this.currentWorkspaceId);
      if (currentWorkspace) {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        currentWorkspace.tabs = tabs
          .filter(t => !t.url.startsWith('chrome://'))
          .map(t => ({
            title: t.title,
            url: t.url,
            favicon: t.favIconUrl
          }));
      }
    }

    // Open workspace tabs in new window
    if (workspace.tabs && workspace.tabs.length > 0) {
      const urls = workspace.tabs.map(t => t.url);
      await chrome.windows.create({ url: urls });
    }

    this.currentWorkspaceId = workspace.id;
    await this.saveData();
    this.updateCurrentWorkspaceDisplay();
    this.renderWorkspaces();
  }

  async updateWorkspaceTabs(workspace) {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    workspace.tabs = tabs
      .filter(t => !t.url.startsWith('chrome://'))
      .map(t => ({
        title: t.title,
        url: t.url,
        favicon: t.favIconUrl
      }));

    await this.saveData();
    this.renderWorkspaces();
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
  }

  renderWorkspaces() {
    this.workspaceList.innerHTML = '';

    if (this.workspaces.length === 0) {
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    this.workspaces.forEach(workspace => {
      const isActive = workspace.id === this.currentWorkspaceId;

      const item = document.createElement('div');
      item.className = `workspace-item ${isActive ? 'active' : ''}`;

      item.innerHTML = `
        <div class="workspace-icon" style="background:${workspace.color}">🗂️</div>
        <div class="workspace-info">
          <div class="workspace-name">${this.escapeHtml(workspace.name)}</div>
          <div class="workspace-meta">
            ${workspace.tabs?.length || 0} 分頁 • ${this.formatDate(workspace.createdAt)}
          </div>
        </div>
        <div class="workspace-actions">
          <button class="action-btn update" data-id="${workspace.id}" title="更新分頁">🔄</button>
          <button class="action-btn edit" data-id="${workspace.id}" title="編輯">✎</button>
        </div>
      `;

      // Click to switch
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.workspace-actions')) {
          this.switchToWorkspace(workspace);
        }
      });

      // Update tabs
      const updateBtn = item.querySelector('.update');
      updateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateWorkspaceTabs(workspace);
      });

      // Edit
      const editBtn = item.querySelector('.edit');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditModal(workspace);
      });

      this.workspaceList.appendChild(item);
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
  new WorkspaceManager();
});
