// Crisis Response - Popup Script

class CrisisResponse {
  constructor() {
    this.responses = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('crisisType');
    this.situationEl = document.getElementById('situation');
    this.acknowledgmentEl = document.getElementById('acknowledgment');
    this.actionEl = document.getElementById('action');
    this.updateEl = document.getElementById('update');
    this.copyBtn = document.getElementById('copyResponse');
    this.saveBtn = document.getElementById('saveResponse');
    this.listEl = document.getElementById('responseList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyResponse());
    this.saveBtn.addEventListener('click', () => this.saveResponse());
  }

  async loadData() {
    const result = await chrome.storage.local.get('crisisResponses');
    if (result.crisisResponses) {
      this.responses = result.crisisResponses;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ crisisResponses: this.responses });
  }

  getTypeLabel(type) {
    const labels = {
      service: 'Service',
      security: 'Security',
      pr: 'PR',
      product: 'Product',
      internal: 'Internal',
      customer: 'Customer'
    };
    return labels[type] || type;
  }

  formatResponse() {
    const situation = this.situationEl.value.trim();
    const acknowledgment = this.acknowledgmentEl.value.trim();
    const action = this.actionEl.value.trim();
    const update = this.updateEl.value.trim();

    let response = '⚠️ Important Update\n\n';

    if (situation) {
      response += `We are aware of ${situation}.\n\n`;
    }

    if (acknowledgment) {
      response += `${acknowledgment}\n\n`;
    }

    if (action) {
      response += `What we\'re doing:\n${action}\n\n`;
    }

    if (update) {
      response += `Next update: ${update}\n\n`;
    }

    response += 'We apologize for any inconvenience and appreciate your patience. Our team is working to resolve this as quickly as possible.\n\n';
    response += 'Thank you for your understanding.';

    return response;
  }

  async copyResponse() {
    const text = this.formatResponse();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveResponse() {
    const situation = this.situationEl.value.trim();
    if (!situation) return;

    const response = {
      id: Date.now(),
      type: this.typeEl.value,
      situation,
      acknowledgment: this.acknowledgmentEl.value.trim(),
      action: this.actionEl.value.trim(),
      update: this.updateEl.value.trim(),
      created: Date.now()
    };

    this.responses.unshift(response);
    if (this.responses.length > 15) {
      this.responses.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadResponse(id) {
    const response = this.responses.find(r => r.id === id);
    if (response) {
      this.typeEl.value = response.type || 'service';
      this.situationEl.value = response.situation || '';
      this.acknowledgmentEl.value = response.acknowledgment || '';
      this.actionEl.value = response.action || '';
      this.updateEl.value = response.update || '';
    }
  }

  deleteResponse(id) {
    this.responses = this.responses.filter(r => r.id !== id);
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
    if (this.responses.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved responses</div>';
      return;
    }

    this.listEl.innerHTML = this.responses.map(r => `
      <div class="response-item">
        <div class="response-info">
          <div class="response-situation">${this.escapeHtml(this.truncate(r.situation))}</div>
          <div class="response-type">${this.getTypeLabel(r.type)}</div>
        </div>
        <div class="response-actions">
          <button class="load-btn" data-load="${r.id}">Load</button>
          <button class="delete-btn" data-delete="${r.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadResponse(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteResponse(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new CrisisResponse());
