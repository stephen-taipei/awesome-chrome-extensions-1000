// Testimonial Request - Popup Script

class TestimonialRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('requestType');
    this.clientEl = document.getElementById('clientName');
    this.productEl = document.getElementById('productService');
    this.contextEl = document.getElementById('context');
    this.platformEl = document.getElementById('platform');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('testimonialRequests');
    if (result.testimonialRequests) {
      this.requests = result.testimonialRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ testimonialRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = {
      product: 'Product',
      service: 'Service',
      linkedin: 'LinkedIn',
      video: 'Video',
      'case-study': 'Case Study'
    };
    return labels[type] || type;
  }

  formatRequest() {
    const client = this.clientEl.value.trim();
    const product = this.productEl.value.trim();
    const context = this.contextEl.value.trim();
    const platform = this.platformEl.value.trim();

    let message = client ? `Hi ${client},\n\n` : 'Hi,\n\n';
    message += 'I hope you\'re doing well! ';

    if (product) {
      message += `I wanted to reach out regarding your experience with ${product}. `;
    }

    if (context) {
      message += `${context}\n\n`;
    } else {
      message += '\n\n';
    }

    message += 'Your feedback has been invaluable, and I was wondering if you\'d be willing to share a brief testimonial about your experience? ';
    message += 'It would really help others who are considering working with us.\n\n';

    if (platform) {
      message += `If you have a moment, you can leave your review at: ${platform}\n\n`;
    }

    message += 'I completely understand if you\'re too busy - no pressure at all! Thank you so much for your time and continued support.\n\n';
    message += 'Best regards';

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
    const client = this.clientEl.value.trim();
    if (!client) return;

    const request = {
      id: Date.now(),
      type: this.typeEl.value,
      client,
      product: this.productEl.value.trim(),
      context: this.contextEl.value.trim(),
      platform: this.platformEl.value.trim(),
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
      this.typeEl.value = request.type || 'product';
      this.clientEl.value = request.client || '';
      this.productEl.value = request.product || '';
      this.contextEl.value = request.context || '';
      this.platformEl.value = request.platform || '';
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
          <div class="request-client">${this.escapeHtml(r.client)}</div>
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

document.addEventListener('DOMContentLoaded', () => new TestimonialRequest());
