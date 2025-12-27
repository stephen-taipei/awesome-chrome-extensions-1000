// Collaboration Request - Popup Script

class CollaborationRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('collabType');
    this.partnerEl = document.getElementById('partnerName');
    this.brandEl = document.getElementById('yourBrand');
    this.proposalEl = document.getElementById('proposal');
    this.benefitsEl = document.getElementById('benefits');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('collabRequests');
    if (result.collabRequests) {
      this.requests = result.collabRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ collabRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = {
      content: 'Content',
      product: 'Product',
      marketing: 'Marketing',
      event: 'Event',
      research: 'Research',
      influencer: 'Influencer'
    };
    return labels[type] || type;
  }

  formatRequest() {
    const partner = this.partnerEl.value.trim();
    const brand = this.brandEl.value.trim();
    const proposal = this.proposalEl.value.trim();
    const benefits = this.benefitsEl.value.trim();

    let message = partner ? `Hi ${partner},\n\n` : 'Hi,\n\n';

    if (brand) {
      message += `I'm reaching out from ${brand}. `;
    } else {
      message += 'I\'m reaching out ';
    }

    message += 'I\'ve been following your work and am really impressed by what you\'ve built.\n\n';

    if (proposal) {
      message += `I have a collaboration idea I\'d love to discuss: ${proposal}\n\n`;
    }

    if (benefits) {
      message += `Here\'s what I think could be in it for you:\n${benefits}\n\n`;
    }

    message += 'Would you be open to a quick call to explore this further? I\'d love to hear your thoughts and see if there\'s a fit.\n\n';
    message += 'Looking forward to connecting!\n\nBest regards';

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
    const partner = this.partnerEl.value.trim();
    if (!partner) return;

    const request = {
      id: Date.now(),
      type: this.typeEl.value,
      partner,
      brand: this.brandEl.value.trim(),
      proposal: this.proposalEl.value.trim(),
      benefits: this.benefitsEl.value.trim(),
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
      this.typeEl.value = request.type || 'content';
      this.partnerEl.value = request.partner || '';
      this.brandEl.value = request.brand || '';
      this.proposalEl.value = request.proposal || '';
      this.benefitsEl.value = request.benefits || '';
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
          <div class="request-partner">${this.escapeHtml(r.partner)}</div>
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

document.addEventListener('DOMContentLoaded', () => new CollaborationRequest());
