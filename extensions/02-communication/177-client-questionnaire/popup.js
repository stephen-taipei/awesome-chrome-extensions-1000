// Client Questionnaire - Popup Script

class ClientQuestionnaire {
  constructor() {
    this.questionnaires = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.categoryEl = document.getElementById('category');
    this.titleEl = document.getElementById('title');
    this.introEl = document.getElementById('intro');
    this.questionsEl = document.getElementById('questions');
    this.closingEl = document.getElementById('closing');
    this.copyBtn = document.getElementById('copyQ');
    this.saveBtn = document.getElementById('saveQ');
    this.listEl = document.getElementById('qList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyQuestionnaire());
    this.saveBtn.addEventListener('click', () => this.saveQuestionnaire());
  }

  async loadData() {
    const result = await chrome.storage.local.get('clientQuestionnaires');
    if (result.clientQuestionnaires) {
      this.questionnaires = result.clientQuestionnaires;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ clientQuestionnaires: this.questionnaires });
  }

  getCategoryLabel(category) {
    const labels = {
      discovery: 'Discovery',
      project: 'Project',
      onboarding: 'Onboarding',
      feedback: 'Feedback',
      custom: 'Custom'
    };
    return labels[category] || category;
  }

  formatQuestionnaire() {
    const title = this.titleEl.value.trim();
    const intro = this.introEl.value.trim();
    const questions = this.questionsEl.value.trim();
    const closing = this.closingEl.value.trim();

    let output = '📋 ' + (title || 'Client Questionnaire') + '\n';
    output += '═'.repeat(30) + '\n\n';

    if (intro) {
      output += intro + '\n\n';
    }

    if (questions) {
      output += 'Please answer the following questions:\n\n';
      let num = 1;
      questions.split('\n').forEach(q => {
        if (q.trim()) {
          output += `${num}. ${q.trim()}\n\n`;
          num++;
        }
      });
    }

    if (closing) {
      output += '─'.repeat(20) + '\n';
      output += closing;
    } else {
      output += 'Thank you for your responses!';
    }

    return output;
  }

  async copyQuestionnaire() {
    const text = this.formatQuestionnaire();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveQuestionnaire() {
    const title = this.titleEl.value.trim();
    if (!title) return;

    const q = {
      id: Date.now(),
      category: this.categoryEl.value,
      title,
      intro: this.introEl.value.trim(),
      questions: this.questionsEl.value.trim(),
      closing: this.closingEl.value.trim(),
      created: Date.now()
    };

    this.questionnaires.unshift(q);
    if (this.questionnaires.length > 15) {
      this.questionnaires.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadQuestionnaire(id) {
    const q = this.questionnaires.find(item => item.id === id);
    if (q) {
      this.categoryEl.value = q.category || 'custom';
      this.titleEl.value = q.title || '';
      this.introEl.value = q.intro || '';
      this.questionsEl.value = q.questions || '';
      this.closingEl.value = q.closing || '';
    }
  }

  deleteQuestionnaire(id) {
    this.questionnaires = this.questionnaires.filter(q => q.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.questionnaires.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved questionnaires</div>';
      return;
    }

    this.listEl.innerHTML = this.questionnaires.map(q => `
      <div class="q-item">
        <div class="q-info">
          <div class="q-title">${this.escapeHtml(q.title)}</div>
          <div class="q-category">${this.getCategoryLabel(q.category)}</div>
        </div>
        <div class="q-actions">
          <button class="load-btn" data-load="${q.id}">Load</button>
          <button class="delete-btn" data-delete="${q.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadQuestionnaire(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteQuestionnaire(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ClientQuestionnaire());
