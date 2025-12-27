// Thread Planner - Popup Script

class ThreadPlanner {
  constructor() {
    this.tweets = [''];
    this.saved = [];
    this.maxChars = 280;
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.render();
  }

  initElements() {
    this.titleEl = document.getElementById('threadTitle');
    this.listEl = document.getElementById('tweetList');
    this.addBtn = document.getElementById('addTweet');
    this.copyBtn = document.getElementById('copyThread');
    this.saveBtn = document.getElementById('saveThread');
    this.clearBtn = document.getElementById('clearThread');
    this.savedListEl = document.getElementById('savedList');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTweet());
    this.copyBtn.addEventListener('click', () => this.copyThread());
    this.saveBtn.addEventListener('click', () => this.saveThread());
    this.clearBtn.addEventListener('click', () => this.clearThread());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedThreads');
    if (result.savedThreads) {
      this.saved = result.savedThreads;
    }
    this.renderSaved();
  }

  async saveData() {
    await chrome.storage.local.set({ savedThreads: this.saved });
  }

  addTweet() {
    this.tweets.push('');
    this.render();
  }

  updateTweet(index, value) {
    this.tweets[index] = value;
    this.updateCharCount(index);
  }

  removeTweet(index) {
    if (this.tweets.length > 1) {
      this.tweets.splice(index, 1);
      this.render();
    }
  }

  updateCharCount(index) {
    const countEl = document.querySelector(`[data-count="${index}"]`);
    if (countEl) {
      const length = this.tweets[index].length;
      countEl.textContent = `${length}/${this.maxChars}`;
      countEl.classList.toggle('over', length > this.maxChars);
    }
  }

  formatThread() {
    const title = this.titleEl.value.trim();
    const validTweets = this.tweets.filter(t => t.trim());

    if (validTweets.length === 0) return '';

    let output = title ? `🧵 ${title}\n\n` : '🧵 Thread:\n\n';

    validTweets.forEach((tweet, i) => {
      output += `${i + 1}/${validTweets.length}\n${tweet}\n\n`;
    });

    return output.trim();
  }

  async copyThread() {
    const text = this.formatThread();
    if (!text) return;

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveThread() {
    const title = this.titleEl.value.trim() || 'Untitled Thread';
    const validTweets = this.tweets.filter(t => t.trim());

    if (validTweets.length === 0) return;

    const thread = {
      id: Date.now(),
      title,
      tweets: [...this.tweets],
      created: Date.now()
    };

    this.saved.unshift(thread);
    if (this.saved.length > 10) {
      this.saved.pop();
    }

    this.saveData();
    this.renderSaved();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadThread(id) {
    const thread = this.saved.find(t => t.id === id);
    if (thread) {
      this.titleEl.value = thread.title;
      this.tweets = [...thread.tweets];
      this.render();
    }
  }

  deleteThread(id) {
    this.saved = this.saved.filter(t => t.id !== id);
    this.saveData();
    this.renderSaved();
  }

  clearThread() {
    this.titleEl.value = '';
    this.tweets = [''];
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    this.listEl.innerHTML = this.tweets.map((tweet, i) => `
      <div class="tweet-item">
        <div class="tweet-header">
          <span class="tweet-number">Tweet ${i + 1}</span>
          <span class="tweet-char-count" data-count="${i}">${tweet.length}/${this.maxChars}</span>
        </div>
        <textarea data-index="${i}" placeholder="What's happening?">${this.escapeHtml(tweet)}</textarea>
        ${this.tweets.length > 1 ? `<button class="tweet-remove" data-remove="${i}">Remove</button>` : ''}
      </div>
    `).join('');

    this.listEl.querySelectorAll('textarea').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        this.updateTweet(parseInt(e.target.dataset.index), e.target.value);
      });
    });

    this.listEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => this.removeTweet(parseInt(btn.dataset.remove)));
    });
  }

  renderSaved() {
    if (this.saved.length === 0) {
      this.savedListEl.innerHTML = '<div class="empty-state">No saved threads</div>';
      return;
    }

    this.savedListEl.innerHTML = this.saved.map(t => `
      <div class="saved-item">
        <div class="saved-info">
          <div class="saved-title">${this.escapeHtml(t.title)}</div>
          <div class="saved-count">${t.tweets.filter(tw => tw.trim()).length} tweets</div>
        </div>
        <div class="saved-actions">
          <button class="load-btn" data-load="${t.id}">Load</button>
          <button class="delete-btn" data-delete="${t.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.savedListEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadThread(parseInt(btn.dataset.load)));
    });

    this.savedListEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteThread(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ThreadPlanner());
