// Caption Writer - Popup Script

class CaptionWriter {
  constructor() {
    this.captions = [];
    this.categories = {
      general: '📱 General',
      travel: '✈️ Travel',
      food: '🍕 Food',
      fitness: '💪 Fitness',
      business: '💼 Business',
      lifestyle: '🌟 Lifestyle'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.categoryEl = document.getElementById('category');
    this.captionEl = document.getElementById('caption');
    this.hashtagsEl = document.getElementById('hashtags');
    this.copyBtn = document.getElementById('copyCaption');
    this.saveBtn = document.getElementById('saveCaption');
    this.listEl = document.getElementById('captionList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyCaption());
    this.saveBtn.addEventListener('click', () => this.saveCaption());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedCaptions');
    if (result.savedCaptions) {
      this.captions = result.savedCaptions;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedCaptions: this.captions });
  }

  formatCaption() {
    let text = this.captionEl.value.trim();
    const hashtags = this.hashtagsEl.value.trim();

    if (hashtags) {
      text += '\n\n' + hashtags;
    }

    return text;
  }

  async copyCaption() {
    const text = this.formatCaption();
    if (!text) return;

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveCaption() {
    const caption = this.captionEl.value.trim();
    if (!caption) return;

    const item = {
      id: Date.now(),
      category: this.categoryEl.value,
      caption: caption,
      hashtags: this.hashtagsEl.value.trim(),
      created: Date.now()
    };

    this.captions.unshift(item);
    if (this.captions.length > 20) {
      this.captions.pop();
    }

    this.saveData();
    this.render();

    // Clear form
    this.captionEl.value = '';
    this.hashtagsEl.value = '';

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  useCaption(id) {
    const item = this.captions.find(c => c.id === id);
    if (item) {
      this.categoryEl.value = item.category;
      this.captionEl.value = item.caption;
      this.hashtagsEl.value = item.hashtags || '';
    }
  }

  deleteCaption(id) {
    this.captions = this.captions.filter(c => c.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.captions.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved captions</div>';
      return;
    }

    this.listEl.innerHTML = this.captions.map(c => `
      <div class="caption-item">
        <div class="caption-header">
          <span class="caption-category">${this.categories[c.category]}</span>
          <div class="caption-actions">
            <button class="use-btn" data-use="${c.id}">Use</button>
            <button class="delete-btn" data-delete="${c.id}">Del</button>
          </div>
        </div>
        <div class="caption-preview">${this.escapeHtml(c.caption)}</div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useCaption(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCaption(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new CaptionWriter());
