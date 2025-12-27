// Feedback Collector - Popup Script

const SENTIMENT_ICONS = {
  positive: '😊',
  neutral: '😐',
  negative: '😞'
};

class FeedbackCollector {
  constructor() {
    this.feedbacks = [];
    this.filter = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.sourceEl = document.getElementById('source');
    this.sentimentEl = document.getElementById('sentiment');
    this.feedbackEl = document.getElementById('feedback');
    this.addBtn = document.getElementById('addFeedback');
    this.listEl = document.getElementById('feedbackList');
    this.filterBtns = document.querySelectorAll('.filter-btn');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addFeedback());
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('collectedFeedback');
    if (result.collectedFeedback) {
      this.feedbacks = result.collectedFeedback;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ collectedFeedback: this.feedbacks });
  }

  addFeedback() {
    const source = this.sourceEl.value.trim();
    const sentiment = this.sentimentEl.value;
    const content = this.feedbackEl.value.trim();

    if (!source || !content) return;

    this.feedbacks.unshift({
      id: Date.now(),
      source,
      sentiment,
      content,
      date: new Date().toLocaleDateString()
    });

    if (this.feedbacks.length > 100) {
      this.feedbacks.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.sourceEl.value = '';
    this.feedbackEl.value = '';
    this.sentimentEl.value = 'positive';
  }

  setFilter(filter) {
    this.filter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  deleteFeedback(id) {
    this.feedbacks = this.feedbacks.filter(f => f.id !== id);
    this.saveData();
    this.render();
  }

  getFilteredFeedback() {
    if (this.filter === 'all') return this.feedbacks;
    return this.feedbacks.filter(f => f.sentiment === this.filter);
  }

  render() {
    const filtered = this.getFilteredFeedback();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No feedback collected</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(f => `
      <div class="feedback-item">
        <div class="feedback-header">
          <span class="feedback-source">${this.escapeHtml(f.source)}</span>
          <span class="feedback-sentiment">${SENTIMENT_ICONS[f.sentiment]}</span>
        </div>
        <div class="feedback-content">${this.escapeHtml(f.content)}</div>
        <div class="feedback-footer">
          <span class="feedback-date">${f.date}</span>
          <button class="delete-btn" data-id="${f.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteFeedback(parseInt(btn.dataset.id)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new FeedbackCollector());
