// Mentorship Request - Popup Script

class MentorshipRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('mentorType');
    this.mentorEl = document.getElementById('mentor');
    this.backgroundEl = document.getElementById('background');
    this.goalsEl = document.getElementById('goals');
    this.whyThemEl = document.getElementById('whyThem');
    this.commitmentEl = document.getElementById('commitment');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('mentorshipRequests');
    if (result.mentorshipRequests) {
      this.requests = result.mentorshipRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ mentorshipRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = {
      career: 'Career',
      technical: 'Technical',
      leadership: 'Leadership',
      startup: 'Startup',
      academic: 'Academic',
      general: 'General'
    };
    return labels[type] || type;
  }

  formatRequest() {
    const mentor = this.mentorEl.value.trim();
    const background = this.backgroundEl.value.trim();
    const goals = this.goalsEl.value.trim();
    const whyThem = this.whyThemEl.value.trim();
    const commitment = this.commitmentEl.value.trim();

    let request = `Dear${mentor ? ` ${mentor}` : ''},\n\n`;
    request += 'I hope this message finds you well. I am reaching out because I greatly admire your work and would be honored to learn from your experience.\n\n';

    if (background) {
      request += `About me: ${background}\n\n`;
    }

    if (goals) {
      request += `My goals: ${goals}\n\n`;
    }

    if (whyThem) {
      request += `Why I\'m reaching out to you: ${whyThem}\n\n`;
    }

    if (commitment) {
      request += `What I\'m asking: ${commitment}. I understand your time is valuable and would be grateful for whatever guidance you can offer.\n\n`;
    }

    request += 'I would deeply appreciate the opportunity to learn from you. Please let me know if you would be open to a brief conversation.\n\n';
    request += 'Thank you for considering my request.\n\n';
    request += 'Respectfully';

    return request;
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
    const mentor = this.mentorEl.value.trim();
    if (!mentor) return;

    const request = {
      id: Date.now(),
      type: this.typeEl.value,
      mentor,
      background: this.backgroundEl.value.trim(),
      goals: this.goalsEl.value.trim(),
      whyThem: this.whyThemEl.value.trim(),
      commitment: this.commitmentEl.value.trim(),
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
      this.typeEl.value = request.type || 'career';
      this.mentorEl.value = request.mentor || '';
      this.backgroundEl.value = request.background || '';
      this.goalsEl.value = request.goals || '';
      this.whyThemEl.value = request.whyThem || '';
      this.commitmentEl.value = request.commitment || '';
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

  truncate(text, len = 25) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.requests.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>';
      return;
    }

    this.listEl.innerHTML = this.requests.map(r => `
      <div class="request-item">
        <div class="request-info">
          <div class="request-mentor">${this.escapeHtml(this.truncate(r.mentor))}</div>
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

document.addEventListener('DOMContentLoaded', () => new MentorshipRequest());
