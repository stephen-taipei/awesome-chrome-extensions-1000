// Post Scheduler - Popup Script

class PostScheduler {
  constructor() {
    this.posts = [];
    this.currentPlatform = 'twitter';
    this.platforms = {
      twitter: '𝕏',
      instagram: '📷',
      facebook: '📘',
      linkedin: '💼',
      tiktok: '🎵'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaults();
  }

  initElements() {
    this.platformBtns = document.querySelectorAll('.platform-btn');
    this.contentEl = document.getElementById('postContent');
    this.dateEl = document.getElementById('postDate');
    this.timeEl = document.getElementById('postTime');
    this.scheduleBtn = document.getElementById('scheduleBtn');
    this.listEl = document.getElementById('postList');
  }

  bindEvents() {
    this.platformBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setPlatform(btn.dataset.platform));
    });
    this.scheduleBtn.addEventListener('click', () => this.schedulePost());
  }

  setDefaults() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateEl.value = tomorrow.toISOString().split('T')[0];
    this.timeEl.value = '10:00';
  }

  async loadData() {
    const result = await chrome.storage.local.get('scheduledPosts');
    if (result.scheduledPosts) {
      this.posts = result.scheduledPosts;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ scheduledPosts: this.posts });
  }

  setPlatform(platform) {
    this.currentPlatform = platform;
    this.platformBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.platform === platform);
    });
  }

  schedulePost() {
    const content = this.contentEl.value.trim();
    const date = this.dateEl.value;
    const time = this.timeEl.value;

    if (!content) return;

    const post = {
      id: Date.now(),
      platform: this.currentPlatform,
      content,
      date,
      time,
      created: Date.now()
    };

    this.posts.unshift(post);
    if (this.posts.length > 20) {
      this.posts.pop();
    }

    this.saveData();
    this.render();

    // Clear form
    this.contentEl.value = '';
    this.setDefaults();

    const original = this.scheduleBtn.textContent;
    this.scheduleBtn.textContent = 'Scheduled!';
    setTimeout(() => {
      this.scheduleBtn.textContent = original;
    }, 1500);
  }

  async copyPost(id) {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      await navigator.clipboard.writeText(post.content);
    }
  }

  deletePost(id) {
    this.posts = this.posts.filter(p => p.id !== id);
    this.saveData();
    this.render();
  }

  formatDateTime(date, time) {
    if (!date) return 'Not scheduled';
    const d = new Date(`${date}T${time || '00:00'}`);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.posts.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No scheduled posts</div>';
      return;
    }

    this.listEl.innerHTML = this.posts.map(p => `
      <div class="post-item">
        <div class="post-header">
          <span class="post-platform">${this.platforms[p.platform]}</span>
          <span class="post-time">${this.formatDateTime(p.date, p.time)}</span>
        </div>
        <div class="post-content">${this.escapeHtml(p.content)}</div>
        <div class="post-footer">
          <div class="post-actions">
            <button class="copy-btn" data-copy="${p.id}">Copy</button>
            <button class="delete-btn" data-delete="${p.id}">Del</button>
          </div>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => this.copyPost(parseInt(btn.dataset.copy)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePost(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new PostScheduler());
