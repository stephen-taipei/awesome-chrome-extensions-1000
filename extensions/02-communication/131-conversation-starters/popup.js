// Conversation Starters - Popup Script

const STARTERS = {
  networking: [
    "What brings you to this event?",
    "How did you get into your field?",
    "What's the most exciting project you're working on?",
    "Have you been to events like this before?",
    "What's your favorite part about what you do?"
  ],
  party: [
    "How do you know the host?",
    "Have you tried any of the food yet?",
    "What have you been binge-watching lately?",
    "Do you have any fun plans for the weekend?",
    "What's the best party you've ever been to?"
  ],
  date: [
    "What do you like to do when you're not working?",
    "What's something you're really passionate about?",
    "If you could travel anywhere tomorrow, where would you go?",
    "What's the best meal you've ever had?",
    "What's on your bucket list?"
  ],
  coworker: [
    "How long have you been with the company?",
    "What team are you on?",
    "What do you enjoy most about working here?",
    "Any tips for a newbie?",
    "Where's your favorite lunch spot nearby?"
  ],
  neighbor: [
    "How long have you lived here?",
    "Do you have any restaurant recommendations nearby?",
    "What do you think of the neighborhood?",
    "Do you have any pets?",
    "Have you met many of the other neighbors?"
  ]
};

class ConversationStarters {
  constructor() {
    this.favorites = [];
    this.currentStarter = '';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.situationEl = document.getElementById('situation');
    this.getBtn = document.getElementById('getStarter');
    this.resultEl = document.getElementById('starterResult');
    this.customEl = document.getElementById('customStarter');
    this.addBtn = document.getElementById('addBtn');
    this.listEl = document.getElementById('favoritesList');
  }

  bindEvents() {
    this.getBtn.addEventListener('click', () => this.getStarter());
    this.addBtn.addEventListener('click', () => this.addCustom());
    this.customEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addCustom();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('conversationFavorites');
    if (result.conversationFavorites) {
      this.favorites = result.conversationFavorites;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ conversationFavorites: this.favorites });
  }

  getStarter() {
    const situation = this.situationEl.value;
    const starters = STARTERS[situation];
    const random = starters[Math.floor(Math.random() * starters.length)];
    this.currentStarter = random;

    this.resultEl.innerHTML = `
      <div class="starter-text">${random}</div>
      <div class="starter-actions">
        <button class="copy-btn" id="copyResult">Copy</button>
        <button class="save-btn" id="saveResult">Save</button>
      </div>
    `;
    this.resultEl.classList.remove('hidden');

    document.getElementById('copyResult').addEventListener('click', () => this.copyStarter());
    document.getElementById('saveResult').addEventListener('click', () => this.saveCurrent());
  }

  async copyStarter() {
    await navigator.clipboard.writeText(this.currentStarter);
    document.getElementById('copyResult').textContent = 'Copied!';
  }

  saveCurrent() {
    if (!this.currentStarter) return;
    this.addFavorite(this.currentStarter);
    document.getElementById('saveResult').textContent = 'Saved!';
  }

  addCustom() {
    const text = this.customEl.value.trim();
    if (!text) return;
    this.addFavorite(text);
    this.customEl.value = '';
  }

  addFavorite(text) {
    if (this.favorites.some(f => f.text === text)) return;

    this.favorites.unshift({
      id: Date.now(),
      text
    });

    if (this.favorites.length > 30) {
      this.favorites.pop();
    }

    this.saveData();
    this.render();
  }

  async copyFavorite(id) {
    const fav = this.favorites.find(f => f.id === id);
    if (fav) {
      await navigator.clipboard.writeText(fav.text);
    }
  }

  deleteFavorite(id) {
    this.favorites = this.favorites.filter(f => f.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.favorites.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved favorites</div>';
      return;
    }

    this.listEl.innerHTML = this.favorites.map(f => `
      <div class="favorite-item">
        <span class="favorite-text">${this.escapeHtml(f.text)}</span>
        <div class="favorite-actions">
          <button class="copy-small" data-copy="${f.id}">Copy</button>
          <button class="delete-btn" data-delete="${f.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyFavorite(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteFavorite(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new ConversationStarters());
