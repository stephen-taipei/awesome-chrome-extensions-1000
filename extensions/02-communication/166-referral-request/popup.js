// Referral Request - Popup Script

class ReferralRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('referralType');
    this.contactEl = document.getElementById('contactName');
    this.targetEl = document.getElementById('targetCompany');
    this.positionEl = document.getElementById('position');
    this.contextEl = document.getElementById('context');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('referralRequests');
    if (result.referralRequests) {
      this.requests = result.referralRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ referralRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = {
      job: 'Job',
      business: 'Business',
      recommendation: 'LinkedIn',
      customer: 'Customer',
      partnership: 'Partnership'
    };
    return labels[type] || type;
  }

  formatRequest() {
    const contact = this.contactEl.value.trim();
    const target = this.targetEl.value.trim();
    const position = this.positionEl.value.trim();
    const context = this.contextEl.value.trim();

    let message = contact ? `Hi ${contact},\n\n` : 'Hi,\n\n';
    message += 'I hope this message finds you well! ';

    if (target && position) {
      message += `I noticed you\'re connected to ${target} and wanted to reach out. I\'m interested in the ${position} opportunity there.\n\n`;
    } else if (target) {
      message += `I noticed you\'re connected to ${target} and was hoping you might be able to help with an introduction.\n\n`;
    } else {
      message += 'I\'m currently exploring new opportunities and thought you might be able to help.\n\n';
    }

    if (context) {
      message += `${context}\n\n`;
    }

    message += 'Would you be open to making an introduction or providing a referral? I\'d be happy to send over any materials that would be helpful.\n\n';
    message += 'Thanks so much for considering this!\n\nBest regards';

    return message;
  }

  async copyRequest() {
    const text = this.formatRequest();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveRequest() {
    const target = this.targetEl.value.trim();
    const contact = this.contactEl.value.trim();
    if (!target && !contact) return;

    const request = {
      id: Date.now(),
      type: this.typeEl.value,
      contact,
      target,
      position: this.positionEl.value.trim(),
      context: this.contextEl.value.trim(),
      created: Date.now()
    };

    this.requests.unshift(request);
    if (this.requests.length > 15) {
      this.requests.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadRequest(id) {
    const request = this.requests.find(r => r.id === id);
    if (request) {
      this.typeEl.value = request.type || 'job';
      this.contactEl.value = request.contact || '';
      this.targetEl.value = request.target || '';
      this.positionEl.value = request.position || '';
      this.contextEl.value = request.context || '';
    }
  }

  deleteRequest(id) {
    this.requests = this.requests.filter(r => r.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.requests.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>';
      return;
    }

    this.listEl.innerHTML = this.requests.map(r => `
      <div class="request-item">
        <div class="request-info">
          <div class="request-target">${this.escapeHtml(r.target || r.contact)}</div>
          <div class="request-type">${this.getTypeLabel(r.type)}</div>
        </div>
        <div class="request-actions">
          <button class="load-btn" data-load="${r.id}">Load</button>
          <button class="delete-btn" data-delete="${r.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadRequest(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteRequest(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ReferralRequest());
