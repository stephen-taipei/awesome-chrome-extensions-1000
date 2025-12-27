// Customer Retention - Popup Script

class CustomerRetention {
  constructor() {
    this.messages = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('retentionType');
    this.customerEl = document.getElementById('customer');
    this.offerEl = document.getElementById('offer');
    this.messageEl = document.getElementById('message');
    this.deadlineEl = document.getElementById('deadline');
    this.copyBtn = document.getElementById('copyRetention');
    this.saveBtn = document.getElementById('saveRetention');
    this.listEl = document.getElementById('retentionList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRetention());
    this.saveBtn.addEventListener('click', () => this.saveRetention());
  }

  async loadData() {
    const result = await chrome.storage.local.get('retentionMessages');
    if (result.retentionMessages) {
      this.messages = result.retentionMessages;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ retentionMessages: this.messages });
  }

  getTypeLabel(type) {
    const labels = {
      winback: 'Win-Back',
      discount: 'Discount',
      loyalty: 'Loyalty',
      feedback: 'Feedback',
      upgrade: 'Upgrade',
      reactivate: 'Reactivate'
    };
    return labels[type] || type;
  }

  formatRetention() {
    const customer = this.customerEl.value.trim();
    const offer = this.offerEl.value.trim();
    const message = this.messageEl.value.trim();
    const deadline = this.deadlineEl.value.trim();

    let retention = `Dear${customer ? ` ${customer}` : ' Valued Customer'},\n\n`;
    retention += 'We miss you! We noticed you haven\'t been around lately, and we wanted to reach out.\n\n';

    if (message) {
      retention += `${message}\n\n`;
    }

    if (offer) {
      retention += `🎁 Special Offer: ${offer}\n\n`;
    }

    if (deadline) {
      retention += `⏰ This offer is valid until ${deadline}.\n\n`;
    }

    retention += 'We value your business and would love to have you back. If there\'s anything we can do to improve your experience, please let us know.\n\n';
    retention += 'Warm regards,\nThe Team';

    return retention;
  }

  async copyRetention() {
    const text = this.formatRetention();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveRetention() {
    const customer = this.customerEl.value.trim();
    if (!customer) return;

    const retention = {
      id: Date.now(),
      type: this.typeEl.value,
      customer,
      offer: this.offerEl.value.trim(),
      message: this.messageEl.value.trim(),
      deadline: this.deadlineEl.value.trim(),
      created: Date.now()
    };

    this.messages.unshift(retention);
    if (this.messages.length > 15) {
      this.messages.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadRetention(id) {
    const retention = this.messages.find(m => m.id === id);
    if (retention) {
      this.typeEl.value = retention.type || 'winback';
      this.customerEl.value = retention.customer || '';
      this.offerEl.value = retention.offer || '';
      this.messageEl.value = retention.message || '';
      this.deadlineEl.value = retention.deadline || '';
    }
  }

  deleteRetention(id) {
    this.messages = this.messages.filter(m => m.id !== id);
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
    if (this.messages.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved messages</div>';
      return;
    }

    this.listEl.innerHTML = this.messages.map(m => `
      <div class="retention-item">
        <div class="retention-info">
          <div class="retention-customer">${this.escapeHtml(this.truncate(m.customer))}</div>
          <div class="retention-type">${this.getTypeLabel(m.type)}</div>
        </div>
        <div class="retention-actions">
          <button class="load-btn" data-load="${m.id}">Load</button>
          <button class="delete-btn" data-delete="${m.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadRetention(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteRetention(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new CustomerRetention());
