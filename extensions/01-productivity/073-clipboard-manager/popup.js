// Clipboard Manager - Popup Script

class ClipboardManager {
  constructor() {
    this.data = {
      clips: []
    };
    this.currentFilter = 'all';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.newClipInput = document.getElementById('newClipInput');
    this.pasteBtn = document.getElementById('pasteBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.searchInput = document.getElementById('searchInput');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.clipsList = document.getElementById('clipsList');
    this.clipCountEl = document.getElementById('clipCount');
  }

  bindEvents() {
    this.clearAllBtn.addEventListener('click', () => this.clearAll());

    this.pasteBtn.addEventListener('click', () => this.pasteFromClipboard());

    this.saveBtn.addEventListener('click', () => this.saveNewClip());

    this.searchInput.addEventListener('input', () => this.renderClips());

    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.renderClips();
      });
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('clipboardManagerData');
    if (result.clipboardManagerData) {
      this.data = result.clipboardManagerData;
    }
    this.renderClips();
  }

  async saveData() {
    await chrome.storage.local.set({ clipboardManagerData: this.data });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.newClipInput.value = text;
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }

  async saveNewClip() {
    const content = this.newClipInput.value.trim();
    if (!content) return;

    // Check for duplicates
    const exists = this.data.clips.some(c => c.content === content);
    if (exists) {
      this.saveBtn.textContent = '已存在';
      setTimeout(() => {
        this.saveBtn.textContent = '💾 儲存';
      }, 1500);
      return;
    }

    const clip = {
      id: this.generateId(),
      content,
      pinned: false,
      createdAt: Date.now()
    };

    this.data.clips.unshift(clip);

    // Keep max 50 clips
    if (this.data.clips.length > 50) {
      // Remove unpinned clips first
      const unpinned = this.data.clips.filter(c => !c.pinned);
      if (unpinned.length > 0) {
        const toRemove = unpinned[unpinned.length - 1];
        this.data.clips = this.data.clips.filter(c => c.id !== toRemove.id);
      }
    }

    await this.saveData();

    this.newClipInput.value = '';
    this.saveBtn.textContent = '已儲存 ✓';
    setTimeout(() => {
      this.saveBtn.textContent = '💾 儲存';
    }, 1500);

    this.renderClips();
  }

  async copyClip(clip) {
    try {
      await navigator.clipboard.writeText(clip.content);

      const btn = document.querySelector(`[data-id="${clip.id}"] .clip-copy`);
      if (btn) {
        btn.textContent = '已複製!';
        setTimeout(() => {
          btn.textContent = '複製';
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async togglePin(id) {
    const clip = this.data.clips.find(c => c.id === id);
    if (clip) {
      clip.pinned = !clip.pinned;
      await this.saveData();
      this.renderClips();
    }
  }

  async deleteClip(id) {
    this.data.clips = this.data.clips.filter(c => c.id !== id);
    await this.saveData();
    this.renderClips();
  }

  async clearAll() {
    // Keep pinned clips
    this.data.clips = this.data.clips.filter(c => c.pinned);
    await this.saveData();
    this.renderClips();
  }

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  }

  renderClips() {
    const searchTerm = this.searchInput.value.toLowerCase();

    let clips = this.data.clips;

    if (this.currentFilter === 'pinned') {
      clips = clips.filter(c => c.pinned);
    }

    if (searchTerm) {
      clips = clips.filter(c => c.content.toLowerCase().includes(searchTerm));
    }

    // Sort: pinned first, then by time
    clips.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

    this.clipsList.innerHTML = clips.map(clip => `
      <div class="clip-card ${clip.pinned ? 'pinned' : ''}" data-id="${clip.id}">
        <div class="clip-header">
          <span class="clip-time">${this.formatTime(clip.createdAt)}</span>
          <div class="clip-actions">
            <button class="clip-btn pin-btn ${clip.pinned ? 'pinned' : ''}" title="${clip.pinned ? '取消釘選' : '釘選'}">📌</button>
            <button class="clip-btn delete-btn" title="刪除">🗑️</button>
          </div>
        </div>
        <div class="clip-content">${this.escapeHtml(clip.content)}</div>
        <button class="clip-copy">複製</button>
      </div>
    `).join('');

    // Bind events
    this.clipsList.querySelectorAll('.clip-card').forEach(card => {
      const id = card.dataset.id;
      const clip = this.data.clips.find(c => c.id === id);

      card.querySelector('.clip-copy').addEventListener('click', () => this.copyClip(clip));
      card.querySelector('.pin-btn').addEventListener('click', () => this.togglePin(id));
      card.querySelector('.delete-btn').addEventListener('click', () => this.deleteClip(id));
    });

    // Update count
    this.clipCountEl.textContent = `${this.data.clips.length} 個項目`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new ClipboardManager();
});
