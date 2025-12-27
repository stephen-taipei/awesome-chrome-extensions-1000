// Renewal Notice - Popup Script

class RenewalNotice {
  constructor() {
    this.notices = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('renewalType');
    this.customerEl = document.getElementById('customer');
    this.subscriptionEl = document.getElementById('subscription');
    this.expiryDateEl = document.getElementById('expiryDate');
    this.benefitsEl = document.getElementById('benefits');
    this.actionEl = document.getElementById('action');
    this.copyBtn = document.getElementById('copyNotice');
    this.saveBtn = document.getElementById('saveNotice');
    this.listEl = document.getElementById('noticeList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNotice());
    this.saveBtn.addEventListener('click', () => this.saveNotice());
  }

  async loadData() {
    const result = await chrome.storage.local.get('renewalNotices');
    if (result.renewalNotices) {
      this.notices = result.renewalNotices;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ renewalNotices: this.notices });
  }

  getTypeLabel(type) {
    const labels = {
      upcoming: 'Upcoming',
      expired: 'Expired',
      autorenew: 'Auto-Renew',
      discount: 'Discount',
      contract: 'Contract',
      final: 'Final'
    };
    return labels[type] || type;
  }

  formatNotice() {
    const customer = this.customerEl.value.trim();
    const subscription = this.subscriptionEl.value.trim();
    const expiryDate = this.expiryDateEl.value.trim();
    const benefits = this.benefitsEl.value.trim();
    const action = this.actionEl.value.trim();

    let notice = `Dear${customer ? ` ${customer}` : ' Valued Customer'},\n\n`;
    notice += '🔔 Renewal Reminder\n\n';

    if (subscription) {
      notice += `Your ${subscription} subscription `;
    } else {
      notice += 'Your subscription ';
    }

    if (expiryDate) {
      notice += `is set to expire on ${expiryDate}.\n\n`;
    } else {
      notice += 'is due for renewal.\n\n';
    }

    if (benefits) {
      notice += `What you\'ll continue to enjoy:\n${benefits}\n\n`;
    }

    if (action) {
      notice += `📋 Action Required: ${action}\n\n`;
    }

    notice += 'To ensure uninterrupted service, please renew before the expiration date.\n\n';
    notice += 'If you have any questions about your renewal, please don\'t hesitate to contact us.\n\n';
    notice += 'Best regards,\nThe Team';

    return notice;
  }

  async copyNotice() {
    const text = this.formatNotice();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveNotice() {
    const customer = this.customerEl.value.trim();
    if (!customer) return;

    const notice = {
      id: Date.now(),
      type: this.typeEl.value,
      customer,
      subscription: this.subscriptionEl.value.trim(),
      expiryDate: this.expiryDateEl.value.trim(),
      benefits: this.benefitsEl.value.trim(),
      action: this.actionEl.value.trim(),
      created: Date.now()
    };

    this.notices.unshift(notice);
    if (this.notices.length > 15) {
      this.notices.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadNotice(id) {
    const notice = this.notices.find(n => n.id === id);
    if (notice) {
      this.typeEl.value = notice.type || 'upcoming';
      this.customerEl.value = notice.customer || '';
      this.subscriptionEl.value = notice.subscription || '';
      this.expiryDateEl.value = notice.expiryDate || '';
      this.benefitsEl.value = notice.benefits || '';
      this.actionEl.value = notice.action || '';
    }
  }

  deleteNotice(id) {
    this.notices = this.notices.filter(n => n.id !== id);
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
    if (this.notices.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved notices</div>';
      return;
    }

    this.listEl.innerHTML = this.notices.map(n => `
      <div class="notice-item">
        <div class="notice-info">
          <div class="notice-customer">${this.escapeHtml(this.truncate(n.customer))}</div>
          <div class="notice-type">${this.getTypeLabel(n.type)}</div>
        </div>
        <div class="notice-actions">
          <button class="load-btn" data-load="${n.id}">Load</button>
          <button class="delete-btn" data-delete="${n.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadNotice(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteNotice(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new RenewalNotice());
