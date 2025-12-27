// Leave Request - Popup Script

class LeaveRequest {
  constructor() {
    this.requests = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('leaveType');
    this.managerEl = document.getElementById('manager');
    this.startEl = document.getElementById('startDate');
    this.endEl = document.getElementById('endDate');
    this.reasonEl = document.getElementById('reason');
    this.coverageEl = document.getElementById('coverage');
    this.copyBtn = document.getElementById('copyRequest');
    this.saveBtn = document.getElementById('saveRequest');
    this.listEl = document.getElementById('requestList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRequest());
    this.saveBtn.addEventListener('click', () => this.saveRequest());
  }

  async loadData() {
    const result = await chrome.storage.local.get('leaveRequests');
    if (result.leaveRequests) {
      this.requests = result.leaveRequests;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ leaveRequests: this.requests });
  }

  getTypeLabel(type) {
    const labels = {
      vacation: 'Vacation',
      sick: 'Sick',
      personal: 'Personal',
      family: 'Family',
      medical: 'Medical',
      bereavement: 'Bereavement'
    };
    return labels[type] || type;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatRequest() {
    const type = this.typeEl.value;
    const manager = this.managerEl.value.trim();
    const start = this.startEl.value;
    const end = this.endEl.value;
    const reason = this.reasonEl.value.trim();
    const coverage = this.coverageEl.value.trim();

    let message = manager ? `Dear ${manager},\n\n` : 'Hi,\n\n';
    message += `I am writing to request ${this.getTypeLabel(type).toLowerCase()} leave`;

    if (start && end) {
      message += ` from ${this.formatDate(start)} to ${this.formatDate(end)}`;
    } else if (start) {
      message += ` on ${this.formatDate(start)}`;
    }
    message += '.\n\n';

    if (reason) {
      message += `${reason}\n\n`;
    }

    if (coverage) {
      message += `Work Coverage Plan:\n${coverage}\n\n`;
    }

    message += 'I will ensure all pending tasks are completed or properly handed off before my leave. Please let me know if you need any additional information.\n\n';
    message += 'Thank you for your consideration.\n\nBest regards';

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
    const start = this.startEl.value;
    if (!start) return;

    const request = {
      id: Date.now(),
      type: this.typeEl.value,
      manager: this.managerEl.value.trim(),
      start,
      end: this.endEl.value,
      reason: this.reasonEl.value.trim(),
      coverage: this.coverageEl.value.trim(),
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
      this.typeEl.value = request.type || 'vacation';
      this.managerEl.value = request.manager || '';
      this.startEl.value = request.start || '';
      this.endEl.value = request.end || '';
      this.reasonEl.value = request.reason || '';
      this.coverageEl.value = request.coverage || '';
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

  formatShortDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.requests.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved requests</div>';
      return;
    }

    this.listEl.innerHTML = this.requests.map(r => `
      <div class="request-item">
        <div class="request-info">
          <div class="request-dates">${this.formatShortDate(r.start)}${r.end ? ' - ' + this.formatShortDate(r.end) : ''}</div>
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

document.addEventListener('DOMContentLoaded', () => new LeaveRequest());
