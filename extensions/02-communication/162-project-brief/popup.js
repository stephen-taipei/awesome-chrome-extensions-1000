// Project Brief - Popup Script

class ProjectBrief {
  constructor() {
    this.briefs = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.nameEl = document.getElementById('projectName');
    this.objectiveEl = document.getElementById('objective');
    this.scopeEl = document.getElementById('scope');
    this.timelineEl = document.getElementById('timeline');
    this.stakeholdersEl = document.getElementById('stakeholders');
    this.copyBtn = document.getElementById('copyBrief');
    this.saveBtn = document.getElementById('saveBrief');
    this.listEl = document.getElementById('briefList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyBrief());
    this.saveBtn.addEventListener('click', () => this.saveBrief());
  }

  async loadData() {
    const result = await chrome.storage.local.get('projectBriefs');
    if (result.projectBriefs) {
      this.briefs = result.projectBriefs;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ projectBriefs: this.briefs });
  }

  formatBrief() {
    const name = this.nameEl.value.trim() || 'Untitled Project';
    const objective = this.objectiveEl.value.trim();
    const scope = this.scopeEl.value.trim();
    const timeline = this.timelineEl.value.trim();
    const stakeholders = this.stakeholdersEl.value.trim();

    let output = '📋 PROJECT BRIEF\n';
    output += '═'.repeat(30) + '\n\n';
    output += `📌 ${name}\n\n`;

    output += '🎯 OBJECTIVE\n';
    output += '─'.repeat(20) + '\n';
    output += (objective || '(Not specified)') + '\n\n';

    output += '📐 SCOPE\n';
    output += '─'.repeat(20) + '\n';
    output += (scope || '(Not specified)') + '\n\n';

    output += '📅 TIMELINE\n';
    output += '─'.repeat(20) + '\n';
    output += (timeline || '(Not specified)') + '\n\n';

    output += '👥 STAKEHOLDERS\n';
    output += '─'.repeat(20) + '\n';
    output += (stakeholders || '(Not specified)') + '\n\n';

    output += '═'.repeat(30);

    return output;
  }

  async copyBrief() {
    const text = this.formatBrief();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveBrief() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    const brief = {
      id: Date.now(),
      name,
      objective: this.objectiveEl.value.trim(),
      scope: this.scopeEl.value.trim(),
      timeline: this.timelineEl.value.trim(),
      stakeholders: this.stakeholdersEl.value.trim(),
      created: Date.now()
    };

    this.briefs.unshift(brief);
    if (this.briefs.length > 15) {
      this.briefs.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadBrief(id) {
    const brief = this.briefs.find(b => b.id === id);
    if (brief) {
      this.nameEl.value = brief.name || '';
      this.objectiveEl.value = brief.objective || '';
      this.scopeEl.value = brief.scope || '';
      this.timelineEl.value = brief.timeline || '';
      this.stakeholdersEl.value = brief.stakeholders || '';
    }
  }

  deleteBrief(id) {
    this.briefs = this.briefs.filter(b => b.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.briefs.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved briefs</div>';
      return;
    }

    this.listEl.innerHTML = this.briefs.map(b => `
      <div class="brief-item">
        <div class="brief-name">${this.escapeHtml(b.name)}</div>
        <div class="brief-actions">
          <button class="load-btn" data-load="${b.id}">Load</button>
          <button class="delete-btn" data-delete="${b.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadBrief(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteBrief(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ProjectBrief());
