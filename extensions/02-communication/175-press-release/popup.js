// Press Release - Popup Script

class PressRelease {
  constructor() {
    this.releases = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.headlineEl = document.getElementById('headline');
    this.subheadEl = document.getElementById('subhead');
    this.locationEl = document.getElementById('location');
    this.dateEl = document.getElementById('releaseDate');
    this.leadEl = document.getElementById('lead');
    this.bodyEl = document.getElementById('body');
    this.contactEl = document.getElementById('contact');
    this.copyBtn = document.getElementById('copyRelease');
    this.saveBtn = document.getElementById('saveRelease');
    this.listEl = document.getElementById('releaseList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyRelease());
    this.saveBtn.addEventListener('click', () => this.saveRelease());
  }

  async loadData() {
    const result = await chrome.storage.local.get('pressReleases');
    if (result.pressReleases) {
      this.releases = result.pressReleases;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ pressReleases: this.releases });
  }

  formatDate(dateStr) {
    if (!dateStr) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  formatRelease() {
    const headline = this.headlineEl.value.trim();
    const subhead = this.subheadEl.value.trim();
    const location = this.locationEl.value.trim();
    const date = this.dateEl.value;
    const lead = this.leadEl.value.trim();
    const body = this.bodyEl.value.trim();
    const contact = this.contactEl.value.trim();

    let release = 'FOR IMMEDIATE RELEASE\n\n';
    release += headline ? headline.toUpperCase() : 'HEADLINE HERE';
    release += '\n';

    if (subhead) {
      release += subhead + '\n';
    }

    release += '\n';

    const dateline = location ? `${location} - ${this.formatDate(date)}` : this.formatDate(date);
    release += dateline + ' - ';

    if (lead) {
      release += lead + '\n\n';
    }

    if (body) {
      release += body + '\n\n';
    }

    release += '###\n\n';

    if (contact) {
      release += 'Media Contact:\n' + contact;
    }

    return release;
  }

  async copyRelease() {
    const text = this.formatRelease();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveRelease() {
    const headline = this.headlineEl.value.trim();
    if (!headline) return;

    const release = {
      id: Date.now(),
      headline,
      subhead: this.subheadEl.value.trim(),
      location: this.locationEl.value.trim(),
      date: this.dateEl.value,
      lead: this.leadEl.value.trim(),
      body: this.bodyEl.value.trim(),
      contact: this.contactEl.value.trim(),
      created: Date.now()
    };

    this.releases.unshift(release);
    if (this.releases.length > 15) {
      this.releases.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadRelease(id) {
    const release = this.releases.find(r => r.id === id);
    if (release) {
      this.headlineEl.value = release.headline || '';
      this.subheadEl.value = release.subhead || '';
      this.locationEl.value = release.location || '';
      this.dateEl.value = release.date || '';
      this.leadEl.value = release.lead || '';
      this.bodyEl.value = release.body || '';
      this.contactEl.value = release.contact || '';
    }
  }

  deleteRelease(id) {
    this.releases = this.releases.filter(r => r.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncate(text, len = 25) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  formatShortDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  render() {
    if (this.releases.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved releases</div>';
      return;
    }

    this.listEl.innerHTML = this.releases.map(r => `
      <div class="release-item">
        <div class="release-info">
          <div class="release-headline">${this.escapeHtml(this.truncate(r.headline))}</div>
          <div class="release-date">${this.formatShortDate(r.date)}</div>
        </div>
        <div class="release-actions">
          <button class="load-btn" data-load="${r.id}">Load</button>
          <button class="delete-btn" data-delete="${r.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadRelease(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteRelease(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new PressRelease());
