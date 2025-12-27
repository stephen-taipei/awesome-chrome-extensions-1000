// Exit Interview - Popup Script

class ExitInterview {
  constructor() {
    this.interviews = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('interviewType');
    this.employeeEl = document.getElementById('employee');
    this.departmentEl = document.getElementById('department');
    this.contentEl = document.getElementById('content');
    this.notesEl = document.getElementById('notes');
    this.copyBtn = document.getElementById('copyInterview');
    this.saveBtn = document.getElementById('saveInterview');
    this.listEl = document.getElementById('interviewList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyInterview());
    this.saveBtn.addEventListener('click', () => this.saveInterview());
  }

  async loadData() {
    const result = await chrome.storage.local.get('exitInterviews');
    if (result.exitInterviews) {
      this.interviews = result.exitInterviews;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ exitInterviews: this.interviews });
  }

  getTypeLabel(type) {
    const labels = {
      invitation: 'Invitation',
      questions: 'Questions',
      summary: 'Summary',
      farewell: 'Farewell',
      handoff: 'Handoff',
      feedback: 'Feedback'
    };
    return labels[type] || type;
  }

  formatInterview() {
    const type = this.typeEl.value;
    const employee = this.employeeEl.value.trim();
    const department = this.departmentEl.value.trim();
    const content = this.contentEl.value.trim();
    const notes = this.notesEl.value.trim();

    let interview = '';

    if (type === 'invitation') {
      interview = `Dear${employee ? ` ${employee}` : ''},\n\n`;
      interview += 'As you prepare for your departure, we would like to schedule an exit interview to discuss your experience with the company.\n\n';
    } else if (type === 'farewell') {
      interview = `Farewell${employee ? ` ${employee}` : ''}!\n\n`;
      interview += 'Thank you for your contributions to the team. We wish you all the best in your future endeavors.\n\n';
    } else {
      interview = `Exit Interview${employee ? ` - ${employee}` : ''}${department ? ` (${department})` : ''}\n\n`;
    }

    if (content) {
      interview += `${content}\n\n`;
    }

    if (notes) {
      interview += `Notes:\n${notes}\n\n`;
    }

    if (type === 'invitation') {
      interview += 'Please let us know your availability for a brief meeting at your convenience.\n\n';
    }

    interview += 'Best regards';

    return interview;
  }

  async copyInterview() {
    const text = this.formatInterview();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveInterview() {
    const employee = this.employeeEl.value.trim();
    if (!employee) return;

    const interview = {
      id: Date.now(),
      type: this.typeEl.value,
      employee,
      department: this.departmentEl.value.trim(),
      content: this.contentEl.value.trim(),
      notes: this.notesEl.value.trim(),
      created: Date.now()
    };

    this.interviews.unshift(interview);
    if (this.interviews.length > 15) {
      this.interviews.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadInterview(id) {
    const interview = this.interviews.find(i => i.id === id);
    if (interview) {
      this.typeEl.value = interview.type || 'invitation';
      this.employeeEl.value = interview.employee || '';
      this.departmentEl.value = interview.department || '';
      this.contentEl.value = interview.content || '';
      this.notesEl.value = interview.notes || '';
    }
  }

  deleteInterview(id) {
    this.interviews = this.interviews.filter(i => i.id !== id);
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
    if (this.interviews.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved items</div>';
      return;
    }

    this.listEl.innerHTML = this.interviews.map(i => `
      <div class="interview-item">
        <div class="interview-info">
          <div class="interview-employee">${this.escapeHtml(this.truncate(i.employee))}</div>
          <div class="interview-type">${this.getTypeLabel(i.type)}</div>
        </div>
        <div class="interview-actions">
          <button class="load-btn" data-load="${i.id}">Load</button>
          <button class="delete-btn" data-delete="${i.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadInterview(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteInterview(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ExitInterview());
