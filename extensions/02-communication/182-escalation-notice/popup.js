// Escalation Notice - Popup Script

class EscalationNotice {
  constructor() {
    this.notices = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('escalationType');
    this.recipientEl = document.getElementById('recipient');
    this.subjectEl = document.getElementById('subject');
    this.issueEl = document.getElementById('issue');
    this.impactEl = document.getElementById('impact');
    this.requestEl = document.getElementById('request');
    this.copyBtn = document.getElementById('copyNotice');
    this.saveBtn = document.getElementById('saveNotice');
    this.listEl = document.getElementById('noticeList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNotice());
    this.saveBtn.addEventListener('click', () => this.saveNotice());
  }

  async loadData() {
    const result = await chrome.storage.local.get('escalationNotices');
    if (result.escalationNotices) {
      this.notices = result.escalationNotices;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ escalationNotices: this.notices });
  }

  getTypeLabel(type) {
    const labels = {
      priority: 'Priority',
      timeline: 'Timeline',
      resource: 'Resource',
      decision: 'Decision',
      blocker: 'Blocker',
      customer: 'Customer'
    };
    return labels[type] || type;
  }

  formatNotice() {
    const recipient = this.recipientEl.value.trim();
    const subject = this.subjectEl.value.trim();
    const issue = this.issueEl.value.trim();
    const impact = this.impactEl.value.trim();
    const request = this.requestEl.value.trim();

    let notice = `🚨 ESCALATION: ${subject || 'Urgent Issue'}\n\n`;
    notice += `Hi${recipient ? ` ${recipient}` : ''},\n\n`;
    notice += 'I am escalating the following issue that requires your immediate attention.\n\n';

    if (issue) {
      notice += `📋 Issue:\n${issue}\n\n`;
    }

    if (impact) {
      notice += `⚠️ Business Impact:\n${impact}\n\n`;
    }

    if (request) {
      notice += `🎯 Action Needed:\n${request}\n\n`;
    }

    notice += 'I appreciate your urgent attention to this matter. Please let me know if you need any additional information.\n\n';
    notice += 'Best regards';

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
    const subject = this.subjectEl.value.trim();
    if (!subject) return;

    const notice = {
      id: Date.now(),
      type: this.typeEl.value,
      recipient: this.recipientEl.value.trim(),
      subject,
      issue: this.issueEl.value.trim(),
      impact: this.impactEl.value.trim(),
      request: this.requestEl.value.trim(),
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
      this.typeEl.value = notice.type || 'priority';
      this.recipientEl.value = notice.recipient || '';
      this.subjectEl.value = notice.subject || '';
      this.issueEl.value = notice.issue || '';
      this.impactEl.value = notice.impact || '';
      this.requestEl.value = notice.request || '';
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
          <div class="notice-subject">${this.escapeHtml(this.truncate(n.subject))}</div>
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

document.addEventListener('DOMContentLoaded', () => new EscalationNotice());
