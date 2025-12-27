// RSVP Response - Popup Script

class RSVPResponse {
  constructor() {
    this.responses = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('responseType');
    this.hostEl = document.getElementById('host');
    this.eventEl = document.getElementById('event');
    this.messageEl = document.getElementById('message');
    this.guestsEl = document.getElementById('guests');
    this.copyBtn = document.getElementById('copyResponse');
    this.saveBtn = document.getElementById('saveResponse');
    this.listEl = document.getElementById('responseList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyResponse());
    this.saveBtn.addEventListener('click', () => this.saveResponse());
  }

  async loadData() {
    const result = await chrome.storage.local.get('rsvpResponses');
    if (result.rsvpResponses) {
      this.responses = result.rsvpResponses;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ rsvpResponses: this.responses });
  }

  getTypeLabel(type) {
    const labels = {
      accept: 'Accept',
      decline: 'Decline',
      tentative: 'Maybe',
      plusone: '+1',
      reschedule: 'Reschedule',
      question: 'Question'
    };
    return labels[type] || type;
  }

  formatResponse() {
    const type = this.typeEl.value;
    const host = this.hostEl.value.trim();
    const event = this.eventEl.value.trim();
    const message = this.messageEl.value.trim();
    const guests = this.guestsEl.value.trim();

    let response = `Dear${host ? ` ${host}` : ''},\n\n`;
    response += `Thank you for the invitation${event ? ` to ${event}` : ''}!\n\n`;

    if (type === 'accept') {
      response += '✅ I am delighted to accept and will be attending.\n\n';
    } else if (type === 'decline') {
      response += 'Unfortunately, I regret that I am unable to attend due to a prior commitment.\n\n';
    } else if (type === 'tentative') {
      response += 'I would love to attend, but I\'m not yet certain of my availability. I will confirm as soon as possible.\n\n';
    } else if (type === 'plusone') {
      response += `✅ I am happy to accept and will be attending${guests ? ` with ${guests} guest(s)` : ' with a guest'}.\n\n`;
    } else if (type === 'reschedule') {
      response += 'I am very interested in attending but have a conflict with the scheduled date. Would it be possible to discuss an alternative time?\n\n';
    } else if (type === 'question') {
      response += 'I am interested in attending and would appreciate some additional information before confirming.\n\n';
    }

    if (message) {
      response += `${message}\n\n`;
    }

    response += 'Thank you again for thinking of me.\n\n';
    response += 'Warm regards';

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
    const event = this.eventEl.value.trim();
    if (!event) return;

    const response = {
      id: Date.now(),
      type: this.typeEl.value,
      host: this.hostEl.value.trim(),
      event,
      message: this.messageEl.value.trim(),
      guests: this.guestsEl.value.trim(),
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
      this.typeEl.value = response.type || 'accept';
      this.hostEl.value = response.host || '';
      this.eventEl.value = response.event || '';
      this.messageEl.value = response.message || '';
      this.guestsEl.value = response.guests || '';
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
          <div class="response-event">${this.escapeHtml(this.truncate(r.event))}</div>
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

document.addEventListener('DOMContentLoaded', () => new RSVPResponse());
