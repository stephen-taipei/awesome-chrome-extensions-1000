// Cold Email - Popup Script

class ColdEmail {
  constructor() {
    this.emails = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('emailType');
    this.recipientEl = document.getElementById('recipient');
    this.companyEl = document.getElementById('company');
    this.hookEl = document.getElementById('hook');
    this.valueEl = document.getElementById('value');
    this.ctaEl = document.getElementById('cta');
    this.copyBtn = document.getElementById('copyEmail');
    this.saveBtn = document.getElementById('saveEmail');
    this.listEl = document.getElementById('emailList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyEmail());
    this.saveBtn.addEventListener('click', () => this.saveEmail());
  }

  async loadData() {
    const result = await chrome.storage.local.get('coldEmails');
    if (result.coldEmails) {
      this.emails = result.coldEmails;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ coldEmails: this.emails });
  }

  getTypeLabel(type) {
    const labels = {
      sales: 'Sales',
      networking: 'Networking',
      partnership: 'Partnership',
      job: 'Job',
      press: 'Press',
      investor: 'Investor'
    };
    return labels[type] || type;
  }

  formatEmail() {
    const recipient = this.recipientEl.value.trim();
    const company = this.companyEl.value.trim();
    const hook = this.hookEl.value.trim();
    const value = this.valueEl.value.trim();
    const cta = this.ctaEl.value.trim();

    let email = recipient ? `Hi ${recipient},\n\n` : 'Hi,\n\n';

    if (hook) {
      email += `${hook}\n\n`;
    }

    if (value) {
      email += `${value}\n\n`;
    }

    if (cta) {
      email += `${cta}\n\n`;
    } else {
      email += 'Would you be open to a quick chat?\n\n';
    }

    email += 'Best regards';

    return email;
  }

  async copyEmail() {
    const text = this.formatEmail();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveEmail() {
    const recipient = this.recipientEl.value.trim();
    const company = this.companyEl.value.trim();
    if (!recipient && !company) return;

    const email = {
      id: Date.now(),
      type: this.typeEl.value,
      recipient,
      company,
      hook: this.hookEl.value.trim(),
      value: this.valueEl.value.trim(),
      cta: this.ctaEl.value.trim(),
      created: Date.now()
    };

    this.emails.unshift(email);
    if (this.emails.length > 15) {
      this.emails.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadEmail(id) {
    const email = this.emails.find(e => e.id === id);
    if (email) {
      this.typeEl.value = email.type || 'sales';
      this.recipientEl.value = email.recipient || '';
      this.companyEl.value = email.company || '';
      this.hookEl.value = email.hook || '';
      this.valueEl.value = email.value || '';
      this.ctaEl.value = email.cta || '';
    }
  }

  deleteEmail(id) {
    this.emails = this.emails.filter(e => e.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.emails.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved templates</div>';
      return;
    }

    this.listEl.innerHTML = this.emails.map(e => `
      <div class="email-item">
        <div class="email-info">
          <div class="email-recipient">${this.escapeHtml(e.recipient || e.company)}</div>
          <div class="email-type">${this.getTypeLabel(e.type)}</div>
        </div>
        <div class="email-actions">
          <button class="load-btn" data-load="${e.id}">Load</button>
          <button class="delete-btn" data-delete="${e.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadEmail(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteEmail(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ColdEmail());
