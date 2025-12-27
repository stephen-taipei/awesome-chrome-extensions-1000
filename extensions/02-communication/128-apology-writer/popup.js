// Apology Writer - Popup Script

const CONTEXT_LABELS = {
  personal: 'Personal',
  professional: 'Professional',
  customer: 'Customer',
  delay: 'Delay',
  mistake: 'Mistake'
};

class ApologyWriter {
  constructor() {
    this.apologies = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.contextEl = document.getElementById('context');
    this.recipientEl = document.getElementById('recipient');
    this.situationEl = document.getElementById('situation');
    this.messageEl = document.getElementById('message');
    this.saveBtn = document.getElementById('saveApology');
    this.listEl = document.getElementById('apologyList');
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => this.saveApology());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedApologies');
    if (result.savedApologies) {
      this.apologies = result.savedApologies;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedApologies: this.apologies });
  }

  saveApology() {
    const context = this.contextEl.value;
    const recipient = this.recipientEl.value.trim();
    const situation = this.situationEl.value.trim();
    const message = this.messageEl.value.trim();

    if (!recipient || !message) return;

    this.apologies.unshift({
      id: Date.now(),
      context,
      recipient,
      situation,
      message
    });

    if (this.apologies.length > 30) {
      this.apologies.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.recipientEl.value = '';
    this.situationEl.value = '';
    this.messageEl.value = '';
    this.contextEl.value = 'personal';
  }

  formatApology(apology) {
    let text = `Dear ${apology.recipient},\n\n`;
    text += apology.message;
    text += `\n\nSincerely,\n[Your Name]`;
    return text;
  }

  async copyApology(id) {
    const apology = this.apologies.find(a => a.id === id);
    if (apology) {
      const formatted = this.formatApology(apology);
      await navigator.clipboard.writeText(formatted);
      this.showCopied(id);
    }
  }

  showCopied(id) {
    const btn = this.listEl.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  }

  deleteApology(id) {
    this.apologies = this.apologies.filter(a => a.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.apologies.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved apologies</div>';
      return;
    }

    this.listEl.innerHTML = this.apologies.map(a => `
      <div class="apology-item">
        <div class="apology-header">
          <span class="apology-to">To: ${this.escapeHtml(a.recipient)}</span>
          <span class="apology-context">${CONTEXT_LABELS[a.context]}</span>
        </div>
        ${a.situation ? `<div class="apology-situation">${this.escapeHtml(a.situation)}</div>` : ''}
        <div class="apology-message">${this.escapeHtml(a.message)}</div>
        <div class="apology-actions">
          <button class="copy-btn" data-copy="${a.id}">Copy</button>
          <button class="delete-btn" data-delete="${a.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyApology(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteApology(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ApologyWriter());
