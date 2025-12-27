// Compliment Generator - Popup Script

const CATEGORY_LABELS = {
  personality: 'Personality',
  work: 'Work',
  appearance: 'Appearance',
  character: 'Character',
  general: 'General'
};

const DEFAULT_COMPLIMENTS = [
  "You have such a wonderful sense of humor!",
  "Your positive energy is contagious.",
  "You're incredibly thoughtful and kind.",
  "Your creativity knows no bounds.",
  "You make everyone around you feel valued.",
  "Your dedication is truly inspiring.",
  "You have a gift for making people smile.",
  "Your kindness makes the world a better place.",
  "You're amazingly talented at what you do.",
  "Your enthusiasm is infectious!"
];

class ComplimentGenerator {
  constructor() {
    this.compliments = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.randomBtn = document.getElementById('randomBtn');
    this.randomResult = document.getElementById('randomResult');
    this.categoryEl = document.getElementById('category');
    this.complimentEl = document.getElementById('compliment');
    this.saveBtn = document.getElementById('saveBtn');
    this.listEl = document.getElementById('complimentsList');
  }

  bindEvents() {
    this.randomBtn.addEventListener('click', () => this.showRandom());
    this.saveBtn.addEventListener('click', () => this.saveCompliment());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedCompliments');
    if (result.savedCompliments) {
      this.compliments = result.savedCompliments;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedCompliments: this.compliments });
  }

  showRandom() {
    const allCompliments = [
      ...DEFAULT_COMPLIMENTS,
      ...this.compliments.map(c => c.text)
    ];
    const random = allCompliments[Math.floor(Math.random() * allCompliments.length)];
    this.randomResult.textContent = `"${random}"`;
    this.randomResult.classList.remove('hidden');
  }

  saveCompliment() {
    const category = this.categoryEl.value;
    const text = this.complimentEl.value.trim();

    if (!text) return;

    this.compliments.unshift({
      id: Date.now(),
      category,
      text
    });

    if (this.compliments.length > 50) {
      this.compliments.pop();
    }

    this.complimentEl.value = '';
    this.categoryEl.value = 'personality';
    this.saveData();
    this.render();
  }

  async copyCompliment(id) {
    const compliment = this.compliments.find(c => c.id === id);
    if (compliment) {
      await navigator.clipboard.writeText(compliment.text);
      this.showCopied(id);
    }
  }

  showCopied(id) {
    const btn = this.listEl.querySelector(`[data-copy="${id}"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  }

  deleteCompliment(id) {
    this.compliments = this.compliments.filter(c => c.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.compliments.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved compliments</div>';
      return;
    }

    this.listEl.innerHTML = this.compliments.map(c => `
      <div class="compliment-item">
        <div class="compliment-header">
          <span class="compliment-category">${CATEGORY_LABELS[c.category]}</span>
        </div>
        <div class="compliment-text">${this.escapeHtml(c.text)}</div>
        <div class="compliment-actions">
          <button class="copy-btn" data-copy="${c.id}">Copy</button>
          <button class="delete-btn" data-delete="${c.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyCompliment(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCompliment(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ComplimentGenerator());
