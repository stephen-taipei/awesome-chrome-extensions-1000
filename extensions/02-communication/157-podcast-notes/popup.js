// Podcast Notes - Popup Script

class PodcastNotes {
  constructor() {
    this.episodes = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('episodeTitle');
    this.guestEl = document.getElementById('guest');
    this.topicsEl = document.getElementById('topics');
    this.questionsEl = document.getElementById('questions');
    this.takeawaysEl = document.getElementById('takeaways');
    this.copyBtn = document.getElementById('copyNotes');
    this.saveBtn = document.getElementById('saveEpisode');
    this.listEl = document.getElementById('episodeList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyNotes());
    this.saveBtn.addEventListener('click', () => this.saveEpisode());
  }

  async loadData() {
    const result = await chrome.storage.local.get('podcastEpisodes');
    if (result.podcastEpisodes) {
      this.episodes = result.podcastEpisodes;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ podcastEpisodes: this.episodes });
  }

  formatNotes() {
    const title = this.titleEl.value.trim() || 'Untitled Episode';
    const guest = this.guestEl.value.trim();
    const topics = this.topicsEl.value.trim();
    const questions = this.questionsEl.value.trim();
    const takeaways = this.takeawaysEl.value.trim();

    let output = '🎙️ PODCAST EPISODE NOTES\n';
    output += '═'.repeat(30) + '\n\n';
    output += `📌 ${title}\n`;
    if (guest) output += `👤 Guest: ${guest}\n`;
    output += '\n';

    output += '🎯 TOPICS TO COVER\n';
    output += '─'.repeat(20) + '\n';
    output += (topics || '(No topics)') + '\n\n';

    output += '❓ QUESTIONS TO ASK\n';
    output += '─'.repeat(20) + '\n';
    output += (questions || '(No questions)') + '\n\n';

    output += '📝 KEY TAKEAWAYS\n';
    output += '─'.repeat(20) + '\n';
    output += (takeaways || '(No takeaways)') + '\n\n';

    output += '═'.repeat(30);

    return output;
  }

  async copyNotes() {
    const text = this.formatNotes();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveEpisode() {
    const title = this.titleEl.value.trim();
    if (!title) return;

    const episode = {
      id: Date.now(),
      title,
      guest: this.guestEl.value.trim(),
      topics: this.topicsEl.value.trim(),
      questions: this.questionsEl.value.trim(),
      takeaways: this.takeawaysEl.value.trim(),
      created: Date.now()
    };

    this.episodes.unshift(episode);
    if (this.episodes.length > 15) {
      this.episodes.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadEpisode(id) {
    const episode = this.episodes.find(e => e.id === id);
    if (episode) {
      this.titleEl.value = episode.title || '';
      this.guestEl.value = episode.guest || '';
      this.topicsEl.value = episode.topics || '';
      this.questionsEl.value = episode.questions || '';
      this.takeawaysEl.value = episode.takeaways || '';
    }
  }

  deleteEpisode(id) {
    this.episodes = this.episodes.filter(e => e.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.episodes.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved episodes</div>';
      return;
    }

    this.listEl.innerHTML = this.episodes.map(e => `
      <div class="episode-item">
        <div>
          <div class="episode-title">${this.escapeHtml(e.title)}</div>
          ${e.guest ? `<div class="episode-guest">with ${this.escapeHtml(e.guest)}</div>` : ''}
        </div>
        <div class="episode-actions">
          <button class="load-btn" data-load="${e.id}">Load</button>
          <button class="delete-btn" data-delete="${e.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadEpisode(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteEpisode(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new PodcastNotes());
