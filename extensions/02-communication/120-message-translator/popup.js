// Message Translator - Popup Script

class MessageTranslator {
  constructor() {
    this.phrases = [];
    this.searchQuery = '';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.langFromEl = document.getElementById('langFrom');
    this.langToEl = document.getElementById('langTo');
    this.phraseFromEl = document.getElementById('phraseFrom');
    this.phraseToEl = document.getElementById('phraseTo');
    this.addBtn = document.getElementById('addPhrase');
    this.searchEl = document.getElementById('search');
    this.listEl = document.getElementById('phrasesList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addPhrase());
    this.searchEl.addEventListener('input', () => {
      this.searchQuery = this.searchEl.value.toLowerCase();
      this.render();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('translatorPhrases');
    if (result.translatorPhrases) {
      this.phrases = result.translatorPhrases;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ translatorPhrases: this.phrases });
  }

  addPhrase() {
    const langFrom = this.langFromEl.value.trim().toUpperCase() || 'EN';
    const langTo = this.langToEl.value.trim().toUpperCase() || 'ES';
    const phraseFrom = this.phraseFromEl.value.trim();
    const phraseTo = this.phraseToEl.value.trim();

    if (!phraseFrom || !phraseTo) return;

    this.phrases.unshift({
      id: Date.now(),
      langFrom,
      langTo,
      phraseFrom,
      phraseTo
    });

    if (this.phrases.length > 100) {
      this.phrases.pop();
    }

    this.phraseFromEl.value = '';
    this.phraseToEl.value = '';
    this.saveData();
    this.render();
  }

  async copyPhrase(id) {
    const phrase = this.phrases.find(p => p.id === id);
    if (phrase) {
      await navigator.clipboard.writeText(phrase.phraseTo);
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

  deletePhrase(id) {
    this.phrases = this.phrases.filter(p => p.id !== id);
    this.saveData();
    this.render();
  }

  getFilteredPhrases() {
    if (!this.searchQuery) return this.phrases;

    return this.phrases.filter(p =>
      p.phraseFrom.toLowerCase().includes(this.searchQuery) ||
      p.phraseTo.toLowerCase().includes(this.searchQuery)
    );
  }

  render() {
    const filtered = this.getFilteredPhrases();

    if (filtered.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No phrases found</div>';
      return;
    }

    this.listEl.innerHTML = filtered.map(p => `
      <div class="phrase-item">
        <div class="phrase-langs">
          <span class="lang-badge">${p.langFrom}</span>
          <span class="lang-badge">${p.langTo}</span>
        </div>
        <div class="phrase-content">
          <div class="phrase-from">${this.escapeHtml(p.phraseFrom)}</div>
          <div class="phrase-to">→ ${this.escapeHtml(p.phraseTo)}</div>
        </div>
        <div class="phrase-actions">
          <button class="copy-btn" data-copy="${p.id}">Copy</button>
          <button class="delete-btn" data-delete="${p.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyPhrase(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePhrase(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new MessageTranslator());
