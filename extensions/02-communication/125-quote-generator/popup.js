// Quote Generator - Popup Script

class QuoteGenerator {
  constructor() {
    this.quotes = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.quoteTextEl = document.getElementById('quoteText');
    this.authorEl = document.getElementById('author');
    this.sourceEl = document.getElementById('source');
    this.addBtn = document.getElementById('addQuote');
    this.randomBtn = document.getElementById('randomQuote');
    this.listEl = document.getElementById('quotesList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addQuote());
    this.randomBtn.addEventListener('click', () => this.getRandomQuote());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedQuotes');
    if (result.savedQuotes) {
      this.quotes = result.savedQuotes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedQuotes: this.quotes });
  }

  addQuote() {
    const text = this.quoteTextEl.value.trim();
    const author = this.authorEl.value.trim();
    const source = this.sourceEl.value.trim();

    if (!text || !author) return;

    this.quotes.unshift({
      id: Date.now(),
      text,
      author,
      source
    });

    if (this.quotes.length > 50) {
      this.quotes.pop();
    }

    this.clearForm();
    this.saveData();
    this.render();
  }

  clearForm() {
    this.quoteTextEl.value = '';
    this.authorEl.value = '';
    this.sourceEl.value = '';
  }

  getRandomQuote() {
    if (this.quotes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    const quote = this.quotes[randomIndex];
    this.copyQuote(quote.id);
  }

  formatQuote(quote) {
    let formatted = `"${quote.text}"\n\n— ${quote.author}`;
    if (quote.source) {
      formatted += `, ${quote.source}`;
    }
    return formatted;
  }

  async copyQuote(id) {
    const quote = this.quotes.find(q => q.id === id);
    if (quote) {
      const formatted = this.formatQuote(quote);
      await navigator.clipboard.writeText(formatted);
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
    } else {
      // Random quote was copied
      const original = this.randomBtn.textContent;
      this.randomBtn.textContent = 'Copied!';
      setTimeout(() => {
        this.randomBtn.textContent = original;
      }, 1500);
    }
  }

  deleteQuote(id) {
    this.quotes = this.quotes.filter(q => q.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.quotes.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No quotes saved yet</div>';
      return;
    }

    this.listEl.innerHTML = this.quotes.map(q => `
      <div class="quote-item">
        <div class="quote-text">${this.escapeHtml(q.text)}</div>
        <div class="quote-author">— ${this.escapeHtml(q.author)}</div>
        ${q.source ? `<div class="quote-source">${this.escapeHtml(q.source)}</div>` : ''}
        <div class="quote-actions">
          <button class="copy-btn" data-copy="${q.id}">Copy</button>
          <button class="delete-btn" data-delete="${q.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyQuote(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteQuote(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new QuoteGenerator());
