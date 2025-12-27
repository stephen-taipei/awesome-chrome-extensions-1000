// Policy Update - Popup Script

class PolicyUpdate {
  constructor() {
    this.updates = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('policyType');
    this.policyNameEl = document.getElementById('policyName');
    this.effectiveDateEl = document.getElementById('effectiveDate');
    this.changesEl = document.getElementById('changes');
    this.impactEl = document.getElementById('impact');
    this.copyBtn = document.getElementById('copyUpdate');
    this.saveBtn = document.getElementById('saveUpdate');
    this.listEl = document.getElementById('updateList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyUpdate());
    this.saveBtn.addEventListener('click', () => this.saveUpdate());
  }

  async loadData() {
    const result = await chrome.storage.local.get('policyUpdates');
    if (result.policyUpdates) {
      this.updates = result.policyUpdates;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ policyUpdates: this.updates });
  }

  getTypeLabel(type) {
    const labels = {
      privacy: 'Privacy',
      terms: 'Terms',
      hr: 'HR',
      security: 'Security',
      company: 'Company',
      compliance: 'Compliance'
    };
    return labels[type] || type;
  }

  formatUpdate() {
    const policyName = this.policyNameEl.value.trim();
    const effectiveDate = this.effectiveDateEl.value.trim();
    const changes = this.changesEl.value.trim();
    const impact = this.impactEl.value.trim();

    let update = `📋 Policy Update${policyName ? `: ${policyName}` : ''}\n\n`;
    update += 'Dear Team,\n\n';
    update += 'We are writing to inform you of an important policy update.\n\n';

    if (effectiveDate) {
      update += `📅 Effective Date: ${effectiveDate}\n\n`;
    }

    if (changes) {
      update += `Key Changes:\n${changes}\n\n`;
    }

    if (impact) {
      update += `How This Affects You:\n${impact}\n\n`;
    }

    update += 'Please review the updated policy carefully. If you have any questions, please contact HR or your manager.\n\n';
    update += 'Thank you for your attention to this matter.\n\n';
    update += 'Best regards,\nManagement';

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
    const policyName = this.policyNameEl.value.trim();
    if (!policyName) return;

    const update = {
      id: Date.now(),
      type: this.typeEl.value,
      policyName,
      effectiveDate: this.effectiveDateEl.value.trim(),
      changes: this.changesEl.value.trim(),
      impact: this.impactEl.value.trim(),
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
      this.typeEl.value = update.type || 'privacy';
      this.policyNameEl.value = update.policyName || '';
      this.effectiveDateEl.value = update.effectiveDate || '';
      this.changesEl.value = update.changes || '';
      this.impactEl.value = update.impact || '';
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
          <div class="update-name">${this.escapeHtml(this.truncate(u.policyName))}</div>
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

document.addEventListener('DOMContentLoaded', () => new PolicyUpdate());
