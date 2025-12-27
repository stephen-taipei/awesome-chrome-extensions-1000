// Status Update - Popup Script

class StatusUpdate {
  constructor() {
    this.updates = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('statusType');
    this.projectEl = document.getElementById('project');
    this.completedEl = document.getElementById('completed');
    this.inProgressEl = document.getElementById('inProgress');
    this.blockersEl = document.getElementById('blockers');
    this.copyBtn = document.getElementById('copyUpdate');
    this.saveBtn = document.getElementById('saveUpdate');
    this.listEl = document.getElementById('updateList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyUpdate());
    this.saveBtn.addEventListener('click', () => this.saveUpdate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('statusUpdates');
    if (result.statusUpdates) {
      this.updates = result.statusUpdates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ statusUpdates: this.updates });
  }

  getTypeLabel(type) {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      project: 'Project',
      milestone: 'Milestone',
      blocker: 'Blocker',
      general: 'General'
    };
    return labels[type] || type;
  }

  formatUpdate() {
    const type = this.typeEl.value;
    const project = this.projectEl.value.trim();
    const completed = this.completedEl.value.trim();
    const inProgress = this.inProgressEl.value.trim();
    const blockers = this.blockersEl.value.trim();

    let update = `📊 Status Update${project ? ` - ${project}` : ''}\n\n`;

    if (completed) {
      update += `✅ Completed:\n${completed}\n\n`;
    }

    if (inProgress) {
      update += `🔄 In Progress:\n${inProgress}\n\n`;
    }

    if (blockers) {
      update += `⚠️ Blockers:\n${blockers}\n\n`;
    }

    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    update += `📅 ${date}`;

    return update;
  }

  async copyUpdate() {
    const text = this.formatUpdate();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveUpdate() {
    const project = this.projectEl.value.trim();
    if (!project) return;

    const update = {
      id: Date.now(),
      type: this.typeEl.value,
      project,
      completed: this.completedEl.value.trim(),
      inProgress: this.inProgressEl.value.trim(),
      blockers: this.blockersEl.value.trim(),
      created: Date.now()
    };

    this.updates.unshift(update);
    if (this.updates.length > 15) {
      this.updates.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadUpdate(id) {
    const update = this.updates.find(u => u.id === id);
    if (update) {
      this.typeEl.value = update.type || 'daily';
      this.projectEl.value = update.project || '';
      this.completedEl.value = update.completed || '';
      this.inProgressEl.value = update.inProgress || '';
      this.blockersEl.value = update.blockers || '';
    }
  }

  deleteUpdate(id) {
    this.updates = this.updates.filter(u => u.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncate(text, len = 25) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.updates.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved updates</div>';
      return;
    }

    this.listEl.innerHTML = this.updates.map(u => `
      <div class="update-item">
        <div class="update-info">
          <div class="update-project">${this.escapeHtml(this.truncate(u.project))}</div>
          <div class="update-type">${this.getTypeLabel(u.type)}</div>
        </div>
        <div class="update-actions">
          <button class="load-btn" data-load="${u.id}">Load</button>
          <button class="delete-btn" data-delete="${u.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadUpdate(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteUpdate(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new StatusUpdate());
