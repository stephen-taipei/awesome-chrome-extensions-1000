// Decision Log - Popup Script

class DecisionLog {
  constructor() {
    this.decisions = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.decisionEl = document.getElementById('decision');
    this.contextEl = document.getElementById('context');
    this.decidedByEl = document.getElementById('decidedBy');
    this.addBtn = document.getElementById('addDecision');
    this.exportBtn = document.getElementById('exportBtn');
    this.listEl = document.getElementById('decisionsList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addDecision());
    this.decisionEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addDecision();
    });
    this.exportBtn.addEventListener('click', () => this.exportDecisions());
  }

  async loadData() {
    const result = await chrome.storage.local.get('decisionLog');
    if (result.decisionLog) {
      this.decisions = result.decisionLog;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ decisionLog: this.decisions });
  }

  addDecision() {
    const decision = this.decisionEl.value.trim();
    const context = this.contextEl.value.trim();
    const decidedBy = this.decidedByEl.value.trim();

    if (!decision) return;

    const now = new Date();
    this.decisions.unshift({
      id: Date.now(),
      decision,
      context,
      decidedBy: decidedBy || 'Team',
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (this.decisions.length > 50) {
      this.decisions.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.decisionEl.value = '';
    this.contextEl.value = '';
    this.decidedByEl.value = '';
  }

  deleteDecision(id) {
    this.decisions = this.decisions.filter(d => d.id !== id);
    this.saveData();
    this.render();
  }

  async exportDecisions() {
    if (this.decisions.length === 0) return;

    let text = `DECISION LOG\n${'═'.repeat(40)}\n\n`;

    this.decisions.forEach((d, i) => {
      text += `${i + 1}. ${d.decision}\n`;
      if (d.context) {
        text += `   Context: ${d.context}\n`;
      }
      text += `   Decided by: ${d.decidedBy}\n`;
      text += `   Date: ${d.date} at ${d.time}\n`;
      text += `${'─'.repeat(40)}\n`;
    });

    await navigator.clipboard.writeText(text);

    const original = this.exportBtn.textContent;
    this.exportBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.exportBtn.textContent = original;
    }, 1500);
  }

  render() {
    if (this.decisions.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No decisions logged</div>';
      return;
    }

    this.listEl.innerHTML = this.decisions.map(d => `
      <div class="decision-item">
        <div class="decision-text">${this.escapeHtml(d.decision)}</div>
        ${d.context ? `<div class="decision-context">${this.escapeHtml(d.context)}</div>` : ''}
        <div class="decision-footer">
          <div class="decision-meta">
            <span>By: ${this.escapeHtml(d.decidedBy)}</span>
            <span>${d.date}</span>
          </div>
          <button class="delete-btn" data-id="${d.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteDecision(parseInt(btn.dataset.id)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new DecisionLog());
