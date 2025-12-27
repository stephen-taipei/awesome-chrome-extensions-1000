// Contact Card - Popup Script

class ContactCard {
  constructor() {
    this.data = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      linkedin: '',
      color: '#8b5cf6'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.tabs = document.querySelectorAll('.tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.nameEl = document.getElementById('name');
    this.titleEl = document.getElementById('title');
    this.companyEl = document.getElementById('company');
    this.emailEl = document.getElementById('email');
    this.phoneEl = document.getElementById('phone');
    this.websiteEl = document.getElementById('website');
    this.linkedinEl = document.getElementById('linkedin');
    this.colorBtns = document.querySelectorAll('.color-btn');
    this.cardPreviewEl = document.getElementById('cardPreview');
    this.copyBtn = document.getElementById('copyCard');
  }

  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    const inputs = [this.nameEl, this.titleEl, this.companyEl, this.emailEl, this.phoneEl, this.websiteEl, this.linkedinEl];
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.updateData();
        this.saveData();
      });
    });

    this.colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.data.color = btn.dataset.color;
        this.saveData();
        this.updatePreview();
      });
    });

    this.copyBtn.addEventListener('click', () => this.copyAsText());
  }

  switchTab(tabName) {
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    this.tabContents.forEach(c => c.classList.toggle('active', c.id === tabName + 'Section'));

    if (tabName === 'preview') {
      this.updatePreview();
    }
  }

  async loadData() {
    const result = await chrome.storage.local.get('contactCard');
    if (result.contactCard) {
      this.data = result.contactCard;
      this.nameEl.value = this.data.name || '';
      this.titleEl.value = this.data.title || '';
      this.companyEl.value = this.data.company || '';
      this.emailEl.value = this.data.email || '';
      this.phoneEl.value = this.data.phone || '';
      this.websiteEl.value = this.data.website || '';
      this.linkedinEl.value = this.data.linkedin || '';

      this.colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === this.data.color);
      });
    }
  }

  async saveData() {
    await chrome.storage.local.set({ contactCard: this.data });
  }

  updateData() {
    this.data.name = this.nameEl.value;
    this.data.title = this.titleEl.value;
    this.data.company = this.companyEl.value;
    this.data.email = this.emailEl.value;
    this.data.phone = this.phoneEl.value;
    this.data.website = this.websiteEl.value;
    this.data.linkedin = this.linkedinEl.value;
  }

  updatePreview() {
    const color = this.data.color;
    const darkerColor = this.adjustColor(color, -20);

    if (!this.data.name) {
      this.cardPreviewEl.style.background = `linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%)`;
      this.cardPreviewEl.innerHTML = '<div class="empty">Fill in your details to see preview</div>';
      return;
    }

    let contactHtml = '';
    if (this.data.email) contactHtml += `<div>📧 ${this.data.email}</div>`;
    if (this.data.phone) contactHtml += `<div>📱 ${this.data.phone}</div>`;
    if (this.data.website) contactHtml += `<div>🌐 ${this.data.website}</div>`;
    if (this.data.linkedin) contactHtml += `<div>💼 linkedin.com/in/${this.data.linkedin}</div>`;

    this.cardPreviewEl.style.background = `linear-gradient(135deg, ${color} 0%, ${darkerColor} 100%)`;
    this.cardPreviewEl.innerHTML = `
      <div class="card-name">${this.data.name}</div>
      ${this.data.title ? `<div class="card-title">${this.data.title}</div>` : ''}
      ${this.data.company ? `<div class="card-company">${this.data.company}</div>` : ''}
      ${contactHtml ? `<div class="card-contact">${contactHtml}</div>` : ''}
    `;
  }

  adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  async copyAsText() {
    let lines = [];
    if (this.data.name) lines.push(this.data.name);
    if (this.data.title) lines.push(this.data.title);
    if (this.data.company) lines.push(this.data.company);
    if (lines.length) lines.push('---');
    if (this.data.email) lines.push(`Email: ${this.data.email}`);
    if (this.data.phone) lines.push(`Phone: ${this.data.phone}`);
    if (this.data.website) lines.push(`Web: ${this.data.website}`);
    if (this.data.linkedin) lines.push(`LinkedIn: linkedin.com/in/${this.data.linkedin}`);

    await navigator.clipboard.writeText(lines.join('\n'));
    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => this.copyBtn.textContent = original, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new ContactCard());
