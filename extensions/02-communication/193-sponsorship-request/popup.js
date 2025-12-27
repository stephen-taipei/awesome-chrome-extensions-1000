// Sponsorship Request - Popup Script

class SponsorshipRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('sponsorshipType');
    this.sponsorEl = document.getElementById('sponsor');
    this.projectEl = document.getElementById('project');
    this.opportunityEl = document.getElementById('opportunity');
    this.benefitsEl = document.getElementById('benefits');
    this.amountEl = document.getElementById('amount');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('sponsorshipRequests');
    if (result.sponsorshipRequests) {
      this.requests = result.sponsorshipRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ sponsorshipRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = { event: 'Event', content: 'Content', team: 'Team', nonprofit: 'Nonprofit', podcast: 'Podcast', community: 'Community' };
    return labels[type] || type;
  }

  formatRequest() {
    const sponsor = this.sponsorEl.value.trim();
    const project = this.projectEl.value.trim();
    const opportunity = this.opportunityEl.value.trim();
    const benefits = this.benefitsEl.value.trim();
    const amount = this.amountEl.value.trim();

    let request = `Dear${sponsor ? ` ${sponsor}` : ' Prospective Sponsor'},\n\n`;
    request += `I am reaching out regarding an exciting sponsorship opportunity${project ? ` for ${project}` : ''}.\n\n`;

    if (opportunity) { request += `About the Opportunity:\n${opportunity}\n\n`; }
    if (benefits) { request += `Benefits for You:\n${benefits}\n\n`; }
    if (amount) { request += `Investment Levels: ${amount}\n\n`; }

    request += 'I would love to discuss this opportunity further and explore how we can create a mutually beneficial partnership.\n\n';
    request += 'Best regards';

    return request;
  }

  async copyRequest() {
    await navigator.clipboard.writeText(this.formatRequest());
    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => { this.copyBtn.textContent = original; }, 1500);
  }

  saveRequest() {
    const sponsor = this.sponsorEl.value.trim();
    if (!sponsor) return;

    this.requests.unshift({
      id: Date.now(), type: this.typeEl.value, sponsor,
      project: this.projectEl.value.trim(), opportunity: this.opportunityEl.value.trim(),
      benefits: this.benefitsEl.value.trim(), amount: this.amountEl.value.trim(), created: Date.now()
    });
    if (this.requests.length > 15) this.requests.pop();
    this.saveData();
    this.render();
    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => { this.saveBtn.textContent = original; }, 1500);
  }

  loadRequest(id) {
    const r = this.requests.find(r => r.id === id);
    if (r) {
      this.typeEl.value = r.type || 'event';
      this.sponsorEl.value = r.sponsor || '';
      this.projectEl.value = r.project || '';
      this.opportunityEl.value = r.opportunity || '';
      this.benefitsEl.value = r.benefits || '';
      this.amountEl.value = r.amount || '';
    }
  }

  deleteRequest(id) {
    this.requests = this.requests.filter(r => r.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  truncate(text, len = 25) { return (!text || text.length <= len) ? (text || '') : text.substring(0, len) + '...'; }

  render() {
    if (this.requests.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>';
      return;
    }
    this.listEl.innerHTML = this.requests.map(r => `
      <div class="request-item">
        <div class="request-info">
          <div class="request-sponsor">${this.escapeHtml(this.truncate(r.sponsor))}</div>
          <div class="request-type">${this.getTypeLabel(r.type)}</div>
        </div>
        <div class="request-actions">
          <button class="load-btn" data-load="${r.id}">Load</button>
          <button class="delete-btn" data-delete="${r.id}">Del</button>
        </div>
      </div>
    `).join('');
    this.listEl.querySelectorAll('[data-load]').forEach(btn => btn.addEventListener('click', () => this.loadRequest(parseInt(btn.dataset.load))));
    this.listEl.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => this.deleteRequest(parseInt(btn.dataset.delete))));
  }
}

document.addEventListener('DOMContentLoaded', () => new SponsorshipRequest());
