// Peer Review - Popup Script

class PeerReview {
  constructor() {
    this.reviews = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('reviewType');
    this.colleagueEl = document.getElementById('colleague');
    this.strengthsEl = document.getElementById('strengths');
    this.achievementsEl = document.getElementById('achievements');
    this.improvementsEl = document.getElementById('improvements');
    this.suggestionsEl = document.getElementById('suggestions');
    this.copyBtn = document.getElementById('copyReview');
    this.saveBtn = document.getElementById('saveReview');
    this.listEl = document.getElementById('reviewList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyReview());
    this.saveBtn.addEventListener('click', () => this.saveReview());
  }

  async loadData() {
    const result = await chrome.storage.local.get('peerReviews');
    if (result.peerReviews) {
      this.reviews = result.peerReviews;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ peerReviews: this.reviews });
  }

  getTypeLabel(type) {
    const labels = {
      performance: 'Performance',
      code: 'Code',
      project: 'Project',
      '360': '360',
      skills: 'Skills',
      general: 'General'
    };
    return labels[type] || type;
  }

  formatReview() {
    const colleague = this.colleagueEl.value.trim();
    const strengths = this.strengthsEl.value.trim();
    const achievements = this.achievementsEl.value.trim();
    const improvements = this.improvementsEl.value.trim();
    const suggestions = this.suggestionsEl.value.trim();

    let review = `Peer Review${colleague ? ` for ${colleague}` : ''}\n\n`;

    if (strengths) {
      review += `✨ Key Strengths:\n${strengths}\n\n`;
    }

    if (achievements) {
      review += `🏆 Notable Achievements:\n${achievements}\n\n`;
    }

    if (improvements) {
      review += `📈 Areas for Improvement:\n${improvements}\n\n`;
    }

    if (suggestions) {
      review += `💡 Suggestions for Growth:\n${suggestions}\n\n`;
    }

    review += 'Overall, it has been a pleasure working with this colleague. I look forward to continued collaboration and seeing their continued growth.';

    return review;
  }

  async copyReview() {
    const text = this.formatReview();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveReview() {
    const colleague = this.colleagueEl.value.trim();
    if (!colleague) return;

    const review = {
      id: Date.now(),
      type: this.typeEl.value,
      colleague,
      strengths: this.strengthsEl.value.trim(),
      achievements: this.achievementsEl.value.trim(),
      improvements: this.improvementsEl.value.trim(),
      suggestions: this.suggestionsEl.value.trim(),
      created: Date.now()
    };

    this.reviews.unshift(review);
    if (this.reviews.length > 15) {
      this.reviews.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadReview(id) {
    const review = this.reviews.find(r => r.id === id);
    if (review) {
      this.typeEl.value = review.type || 'performance';
      this.colleagueEl.value = review.colleague || '';
      this.strengthsEl.value = review.strengths || '';
      this.achievementsEl.value = review.achievements || '';
      this.improvementsEl.value = review.improvements || '';
      this.suggestionsEl.value = review.suggestions || '';
    }
  }

  deleteReview(id) {
    this.reviews = this.reviews.filter(r => r.id !== id);
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
    if (this.reviews.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved reviews</div>';
      return;
    }

    this.listEl.innerHTML = this.reviews.map(r => `
      <div class="review-item">
        <div class="review-info">
          <div class="review-colleague">${this.escapeHtml(this.truncate(r.colleague))}</div>
          <div class="review-type">${this.getTypeLabel(r.type)}</div>
        </div>
        <div class="review-actions">
          <button class="load-btn" data-load="${r.id}">Load</button>
          <button class="delete-btn" data-delete="${r.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadReview(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteReview(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new PeerReview());
