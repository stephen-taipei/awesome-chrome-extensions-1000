// Interview Prep - Popup Script

class InterviewPrep {
  constructor() {
    this.questions = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.categoryEl = document.getElementById('category');
    this.questionEl = document.getElementById('question');
    this.answerEl = document.getElementById('answer');
    this.addBtn = document.getElementById('addQA');
    this.filterEl = document.getElementById('filterCategory');
    this.listEl = document.getElementById('qaList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addQA());
    this.filterEl.addEventListener('change', () => this.render());
    this.questionEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.answerEl.focus();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('interviewPrep');
    if (result.interviewPrep) {
      this.questions = result.interviewPrep;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ interviewPrep: this.questions });
  }

  addQA() {
    const question = this.questionEl.value.trim();
    const answer = this.answerEl.value.trim();
    if (!question || !answer) return;

    const qa = {
      id: Date.now(),
      category: this.categoryEl.value,
      question,
      answer,
      created: Date.now()
    };

    this.questions.unshift(qa);
    this.saveData();
    this.render();

    this.questionEl.value = '';
    this.answerEl.value = '';
    this.questionEl.focus();
  }

  async copyAnswer(id) {
    const qa = this.questions.find(q => q.id === id);
    if (qa) {
      const text = `Q: ${qa.question}\n\nA: ${qa.answer}`;
      await navigator.clipboard.writeText(text);
    }
  }

  deleteQA(id) {
    this.questions = this.questions.filter(q => q.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatCategory(cat) {
    const labels = {
      behavioral: 'Behavioral',
      technical: 'Technical',
      situational: 'Situational',
      company: 'Company'
    };
    return labels[cat] || cat;
  }

  render() {
    const filter = this.filterEl.value;
    const filtered = filter === 'all'
      ? this.questions
      : this.questions.filter(q => q.category === filter);

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No prepared answers yet</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(q => `
      <div class="qa-item">
        <div class="qa-header">
          <div class="qa-question">${this.escapeHtml(q.question)}</div>
          <span class="qa-category">${this.formatCategory(q.category)}</span>
        </div>
        <div class="qa-answer">${this.escapeHtml(q.answer)}</div>
        <div class="qa-actions">
          <button class="copy-btn" data-copy="${q.id}">Copy</button>
          <button class="delete-btn" data-delete="${q.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyAnswer(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteQA(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new InterviewPrep());
