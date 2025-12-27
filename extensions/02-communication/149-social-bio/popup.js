// Social Bio - Popup Script

class SocialBio {
  constructor() {
    this.bios = [];
    this.currentPlatform = 'twitter';
    this.platforms = {
      twitter: { name: '𝕏 Twitter', limit: 160 },
      instagram: { name: '📷 Instagram', limit: 150 },
      linkedin: { name: '💼 LinkedIn', limit: 220 },
      tiktok: { name: '🎵 TikTok', limit: 80 }
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.platformBtns = document.querySelectorAll('.platform-btn');
    this.bioTextEl = document.getElementById('bioText');
    this.charCountEl = document.getElementById('charCount');
    this.charLimitEl = document.getElementById('charLimit');
    this.copyBtn = document.getElementById('copyBio');
    this.saveBtn = document.getElementById('saveBio');
    this.listEl = document.getElementById('bioList');
  }

  bindEvents() {
    this.platformBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setPlatform(btn.dataset.platform));
    });
    this.bioTextEl.addEventListener('input', () => this.updateCharCount());
    this.copyBtn.addEventListener('click', () => this.copyBio());
    this.saveBtn.addEventListener('click', () => this.saveBio());
  }

  async loadData() {
    const result = await chrome.storage.local.get('socialBios');
    if (result.socialBios) {
      this.bios = result.socialBios;
    }
    this.updateCharCount();
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ socialBios: this.bios });
  }

  setPlatform(platform) {
    this.currentPlatform = platform;
    this.platformBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.platform === platform);
    });
    this.updateCharCount();
  }

  updateCharCount() {
    const count = this.bioTextEl.value.length;
    const limit = this.platforms[this.currentPlatform].limit;

    this.charCountEl.textContent = count;
    this.charLimitEl.textContent = limit;

    const charCountContainer = this.charCountEl.parentElement;
    charCountContainer.classList.toggle('over', count > limit);
  }

  async copyBio() {
    const text = this.bioTextEl.value.trim();
    if (!text) return;

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveBio() {
    const text = this.bioTextEl.value.trim();
    if (!text) return;

    const bio = {
      id: Date.now(),
      platform: this.currentPlatform,
      text: text,
      created: Date.now()
    };

    this.bios.unshift(bio);
    if (this.bios.length > 15) {
      this.bios.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  useBio(id) {
    const bio = this.bios.find(b => b.id === id);
    if (bio) {
      this.bioTextEl.value = bio.text;
      this.setPlatform(bio.platform);
    }
  }

  deleteBio(id) {
    this.bios = this.bios.filter(b => b.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.bios.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved bios</div>';
      return;
    }

    this.listEl.innerHTML = this.bios.map(b => `
      <div class="bio-item">
        <div class="bio-header">
          <span class="bio-platform">${this.platforms[b.platform].name}</span>
          <div class="bio-actions">
            <button class="use-btn" data-use="${b.id}">Use</button>
            <button class="delete-btn" data-delete="${b.id}">Del</button>
          </div>
        </div>
        <div class="bio-preview">${this.escapeHtml(b.text)}</div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useBio(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteBio(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new SocialBio());
