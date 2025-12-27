// Hashtag Manager - Popup Script

class HashtagManager {
  constructor() {
    this.sets = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.nameEl = document.getElementById('setName');
    this.hashtagsEl = document.getElementById('hashtags');
    this.saveBtn = document.getElementById('saveSet');
    this.listEl = document.getElementById('setList');
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => this.saveSet());
  }

  async loadData() {
    const result = await chrome.storage.local.get('hashtagSets');
    if (result.hashtagSets) {
      this.sets = result.hashtagSets;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ hashtagSets: this.sets });
  }

  parseHashtags(text) {
    // Extract hashtags from text
    const matches = text.match(/#\w+/g) || [];
    // Also handle comma/space separated words without #
    const words = text.split(/[\s,]+/).filter(w => w && !w.startsWith('#'));
    const formatted = words.map(w => `#${w.replace(/^#/, '')}`);
    return [...new Set([...matches, ...formatted])].filter(h => h.length > 1);
  }

  saveSet() {
    const name = this.nameEl.value.trim();
    const hashtagText = this.hashtagsEl.value.trim();

    if (!name || !hashtagText) return;

    const hashtags = this.parseHashtags(hashtagText);
    if (hashtags.length === 0) return;

    const set = {
      id: Date.now(),
      name,
      hashtags,
      created: Date.now()
    };

    this.sets.unshift(set);
    if (this.sets.length > 15) {
      this.sets.pop();
    }

    this.saveData();
    this.render();

    // Clear form
    this.nameEl.value = '';
    this.hashtagsEl.value = '';

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  async copySet(id) {
    const set = this.sets.find(s => s.id === id);
    if (set) {
      const text = set.hashtags.join(' ');
      await navigator.clipboard.writeText(text);
    }
  }

  deleteSet(id) {
    this.sets = this.sets.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.sets.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No hashtag sets saved</div>';
      return;
    }

    this.listEl.innerHTML = this.sets.map(s => `
      <div class="set-item">
        <div class="set-header">
          <span class="set-name">${this.escapeHtml(s.name)}</span>
          <span class="set-count">${s.hashtags.length} tags</span>
        </div>
        <div class="set-hashtags">${s.hashtags.map(h => this.escapeHtml(h)).join(' ')}</div>
        <div class="set-actions">
          <button class="copy-btn" data-copy="${s.id}">Copy All</button>
          <button class="delete-btn" data-delete="${s.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copySet(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSet(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new HashtagManager());
