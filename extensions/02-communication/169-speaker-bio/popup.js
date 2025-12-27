// Speaker Bio - Popup Script

class SpeakerBio {
  constructor() {
    this.bios = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.lengthEl = document.getElementById('bioLength');
    this.nameEl = document.getElementById('name');
    this.titleEl = document.getElementById('title');
    this.companyEl = document.getElementById('company');
    this.expertiseEl = document.getElementById('expertise');
    this.achievementsEl = document.getElementById('achievements');
    this.personalEl = document.getElementById('personal');
    this.copyBtn = document.getElementById('copyBio');
    this.saveBtn = document.getElementById('saveBio');
    this.listEl = document.getElementById('bioList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyBio());
    this.saveBtn.addEventListener('click', () => this.saveBio());
  }

  async loadData() {
    const result = await chrome.storage.local.get('speakerBios');
    if (result.speakerBios) {
      this.bios = result.speakerBios;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ speakerBios: this.bios });
  }

  getLengthLabel(length) {
    const labels = {
      short: 'Short',
      medium: 'Medium',
      long: 'Long'
    };
    return labels[length] || length;
  }

  formatBio() {
    const name = this.nameEl.value.trim();
    const title = this.titleEl.value.trim();
    const company = this.companyEl.value.trim();
    const expertise = this.expertiseEl.value.trim();
    const achievements = this.achievementsEl.value.trim();
    const personal = this.personalEl.value.trim();
    const length = this.lengthEl.value;

    let bio = '';

    // Name and title
    if (name) {
      bio += name;
      if (title && company) {
        bio += ` is ${title} at ${company}`;
      } else if (title) {
        bio += ` is ${title}`;
      } else if (company) {
        bio += ` works at ${company}`;
      }
      bio += '. ';
    }

    // Expertise
    if (expertise) {
      if (length === 'short') {
        bio += expertise.split('.')[0] + '. ';
      } else {
        bio += expertise + ' ';
      }
    }

    // Achievements
    if (achievements && length !== 'short') {
      bio += achievements + ' ';
    }

    // Personal touch
    if (personal && length === 'long') {
      bio += personal;
    }

    return bio.trim();
  }

  async copyBio() {
    const text = this.formatBio();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveBio() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    const bio = {
      id: Date.now(),
      length: this.lengthEl.value,
      name,
      title: this.titleEl.value.trim(),
      company: this.companyEl.value.trim(),
      expertise: this.expertiseEl.value.trim(),
      achievements: this.achievementsEl.value.trim(),
      personal: this.personalEl.value.trim(),
      created: Date.now()
    };

    this.bios.unshift(bio);
    if (this.bios.length > 10) {
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

  loadBio(id) {
    const bio = this.bios.find(b => b.id === id);
    if (bio) {
      this.lengthEl.value = bio.length || 'medium';
      this.nameEl.value = bio.name || '';
      this.titleEl.value = bio.title || '';
      this.companyEl.value = bio.company || '';
      this.expertiseEl.value = bio.expertise || '';
      this.achievementsEl.value = bio.achievements || '';
      this.personalEl.value = bio.personal || '';
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
        <div class="bio-info">
          <div class="bio-name">${this.escapeHtml(b.name)}</div>
          <div class="bio-length">${this.getLengthLabel(b.length)}</div>
        </div>
        <div class="bio-actions">
          <button class="load-btn" data-load="${b.id}">Load</button>
          <button class="delete-btn" data-delete="${b.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadBio(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteBio(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new SpeakerBio());
