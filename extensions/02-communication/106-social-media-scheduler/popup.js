// Social Media Scheduler - Popup Script

class SocialMediaScheduler {
  constructor() {
    this.posts = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.setDefaultDateTime();
  }

  initElements() {
    this.contentEl = document.getElementById('postContent');
    this.dateEl = document.getElementById('postDate');
    this.timeEl = document.getElementById('postTime');
    this.platformChecks = document.querySelectorAll('.platform-check input');
    this.scheduleBtn = document.getElementById('schedulePost');
    this.listEl = document.getElementById('postsList');
    this.countEl = document.getElementById('postCount');
  }

  bindEvents() {
    this.scheduleBtn.addEventListener('click', () => this.schedulePost());
  }

  setDefaultDateTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    this.dateEl.value = now.toISOString().split('T')[0];
    this.timeEl.value = now.toTimeString().slice(0, 5);
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

  schedulePost() {
    const content = this.contentEl.value.trim();
    const date = this.dateEl.value;
    const time = this.timeEl.value;
    const platforms = Array.from(this.platformChecks)
      .filter(c => c.checked)
      .map(c => c.value);

    if (!content || !date || !time || platforms.length === 0) {
      return;
    }

    this.posts.unshift({
      id: Date.now(),
      content,
      scheduledFor: new Date(`${date}T${time}`).getTime(),
      platforms,
      done: false,
      createdAt: Date.now()
    });

    this.saveData();
    this.render();

    // Reset form
    this.contentEl.value = '';
    this.platformChecks.forEach(c => c.checked = false);
    this.setDefaultDateTime();
  }

  markDone(id) {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.done = true;
      this.saveData();
      this.render();
    }
  }

  deletePost(id) {
    this.posts = this.posts.filter(p => p.id !== id);
    this.saveData();
    this.render();
  }

  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  render() {
    const pendingPosts = this.posts.filter(p => !p.done);
    this.countEl.textContent = pendingPosts.length;

    if (this.posts.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No scheduled posts yet</div>';
      return;
    }

    // Sort by scheduled time
    const sortedPosts = [...this.posts].sort((a, b) => a.scheduledFor - b.scheduledFor);

    this.listEl.innerHTML = sortedPosts.map(post => `
      <div class="post-item" style="${post.done ? 'opacity: 0.5' : ''}">
        <div class="post-content">${this.escapeHtml(post.content)}</div>
        <div class="post-meta">
          <span class="post-datetime">${this.formatDateTime(post.scheduledFor)}</span>
          <div class="post-platforms">
            ${post.platforms.map(p => `<span class="platform-tag">${p}</span>`).join('')}
          </div>
        </div>
        <div class="post-actions">
          ${!post.done ? `<button class="mark-done-btn" data-done="${post.id}">Mark Done</button>` : ''}
          <button class="delete-btn" data-delete="${post.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-done]').forEach(btn => {
      btn.addEventListener('click', () => this.markDone(parseInt(btn.dataset.done)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePost(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new SocialMediaScheduler());
