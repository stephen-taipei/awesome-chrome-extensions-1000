// Intro Script - Popup Script

class IntroScript {
  constructor() {
    this.intros = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.occasionEl = document.getElementById('occasion');
    this.nameEl = document.getElementById('name');
    this.roleEl = document.getElementById('role');
    this.companyEl = document.getElementById('company');
    this.expertiseEl = document.getElementById('expertise');
    this.interestEl = document.getElementById('interest');
    this.copyBtn = document.getElementById('copyIntro');
    this.saveBtn = document.getElementById('saveIntro');
    this.listEl = document.getElementById('introList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyIntro());
    this.saveBtn.addEventListener('click', () => this.saveIntro());
  }

  async loadData() {
    const result = await chrome.storage.local.get('introScripts');
    if (result.introScripts) {
      this.intros = result.introScripts;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ introScripts: this.intros });
  }

  getOccasionLabel(occasion) {
    const labels = {
      networking: 'Networking',
      interview: 'Interview',
      meeting: 'Meeting',
      pitch: 'Pitch',
      social: 'Social',
      conference: 'Conference'
    };
    return labels[occasion] || occasion;
  }

  formatIntro() {
    const name = this.nameEl.value.trim();
    const role = this.roleEl.value.trim();
    const company = this.companyEl.value.trim();
    const expertise = this.expertiseEl.value.trim();
    const interest = this.interestEl.value.trim();

    let script = '';

    if (name) {
      script += `Hi, I'm ${name}`;
      if (role && company) {
        script += `, ${role} at ${company}`;
      } else if (role) {
        script += `, and I work as a ${role}`;
      } else if (company) {
        script += ` from ${company}`;
      }
      script += '.\n\n';
    }

    if (expertise) {
      script += `${expertise}\n\n`;
    }

    if (interest) {
      script += `${interest}\n\n`;
    }

    script += "It's great to meet you!";

    return script;
  }

  async copyIntro() {
    const text = this.formatIntro();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveIntro() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    const intro = {
      id: Date.now(),
      occasion: this.occasionEl.value,
      name,
      role: this.roleEl.value.trim(),
      company: this.companyEl.value.trim(),
      expertise: this.expertiseEl.value.trim(),
      interest: this.interestEl.value.trim(),
      created: Date.now()
    };

    this.intros.unshift(intro);
    if (this.intros.length > 15) {
      this.intros.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadIntro(id) {
    const intro = this.intros.find(i => i.id === id);
    if (intro) {
      this.occasionEl.value = intro.occasion || 'networking';
      this.nameEl.value = intro.name || '';
      this.roleEl.value = intro.role || '';
      this.companyEl.value = intro.company || '';
      this.expertiseEl.value = intro.expertise || '';
      this.interestEl.value = intro.interest || '';
    }
  }

  deleteIntro(id) {
    this.intros = this.intros.filter(i => i.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.intros.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved intros</div>';
      return;
    }

    this.listEl.innerHTML = this.intros.map(i => `
      <div class="intro-item">
        <div class="intro-info">
          <div class="intro-name">${this.escapeHtml(i.name)}</div>
          <div class="intro-occasion">${this.getOccasionLabel(i.occasion)}</div>
        </div>
        <div class="intro-actions">
          <button class="load-btn" data-load="${i.id}">Load</button>
          <button class="delete-btn" data-delete="${i.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadIntro(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteIntro(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new IntroScript());
