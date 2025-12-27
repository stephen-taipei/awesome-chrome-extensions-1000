// Signature Generator - Popup Script

class SignatureGenerator {
  constructor() {
    this.signatures = [];
    this.currentStyle = 'professional';
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.nameEl = document.getElementById('name');
    this.titleEl = document.getElementById('title');
    this.companyEl = document.getElementById('company');
    this.phoneEl = document.getElementById('phone');
    this.emailEl = document.getElementById('email');
    this.websiteEl = document.getElementById('website');
    this.styleBtns = document.querySelectorAll('.style-btn');
    this.copyBtn = document.getElementById('copySignature');
    this.saveBtn = document.getElementById('saveSignature');
    this.listEl = document.getElementById('signatureList');
  }

  bindEvents() {
    this.styleBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setStyle(btn.dataset.style));
    });
    this.copyBtn.addEventListener('click', () => this.copySignature());
    this.saveBtn.addEventListener('click', () => this.saveSignature());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedSignatures');
    if (result.savedSignatures) {
      this.signatures = result.savedSignatures;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedSignatures: this.signatures });
  }

  setStyle(style) {
    this.currentStyle = style;
    this.styleBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === style);
    });
  }

  getSignatureData() {
    return {
      name: this.nameEl.value.trim(),
      title: this.titleEl.value.trim(),
      company: this.companyEl.value.trim(),
      phone: this.phoneEl.value.trim(),
      email: this.emailEl.value.trim(),
      website: this.websiteEl.value.trim(),
      style: this.currentStyle
    };
  }

  formatSignature(data) {
    const { name, title, company, phone, email, website, style } = data;

    if (!name) return '';

    let sig = '';

    switch (style) {
      case 'professional':
        sig += `${name}\n`;
        if (title) sig += `${title}`;
        if (title && company) sig += ' | ';
        if (company) sig += `${company}`;
        sig += '\n';
        sig += '─'.repeat(30) + '\n';
        if (phone) sig += `📞 ${phone}\n`;
        if (email) sig += `✉️ ${email}\n`;
        if (website) sig += `🌐 ${website}\n`;
        break;

      case 'minimal':
        sig += `${name}`;
        if (title) sig += ` · ${title}`;
        if (company) sig += ` · ${company}`;
        sig += '\n';
        const contacts = [];
        if (phone) contacts.push(phone);
        if (email) contacts.push(email);
        if (website) contacts.push(website);
        if (contacts.length) sig += contacts.join(' | ') + '\n';
        break;

      case 'creative':
        sig += `✨ ${name} ✨\n`;
        if (title || company) {
          sig += `🎯 ${title || ''}${title && company ? ' @ ' : ''}${company || ''}\n`;
        }
        sig += '\n';
        if (phone) sig += `📱 ${phone}\n`;
        if (email) sig += `📧 ${email}\n`;
        if (website) sig += `🔗 ${website}\n`;
        sig += '\n— Let\'s connect! —';
        break;
    }

    return sig.trim();
  }

  async copySignature() {
    const data = this.getSignatureData();
    const signature = this.formatSignature(data);

    if (!signature) return;

    await navigator.clipboard.writeText(signature);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveSignature() {
    const data = this.getSignatureData();
    if (!data.name) return;

    const sig = {
      id: Date.now(),
      ...data
    };

    this.signatures.unshift(sig);
    if (this.signatures.length > 10) {
      this.signatures.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  useSignature(id) {
    const sig = this.signatures.find(s => s.id === id);
    if (sig) {
      this.nameEl.value = sig.name || '';
      this.titleEl.value = sig.title || '';
      this.companyEl.value = sig.company || '';
      this.phoneEl.value = sig.phone || '';
      this.emailEl.value = sig.email || '';
      this.websiteEl.value = sig.website || '';
      this.setStyle(sig.style || 'professional');
    }
  }

  deleteSignature(id) {
    this.signatures = this.signatures.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.signatures.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved signatures</div>';
      return;
    }

    this.listEl.innerHTML = this.signatures.map(s => `
      <div class="signature-item">
        <div class="signature-info">
          <div class="signature-name">${this.escapeHtml(s.name)}</div>
          <div class="signature-preview">${this.escapeHtml(s.title || '')} ${s.company ? '@ ' + this.escapeHtml(s.company) : ''}</div>
        </div>
        <div class="signature-actions">
          <button class="use-btn" data-use="${s.id}">Use</button>
          <button class="delete-btn" data-delete="${s.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useSignature(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSignature(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new SignatureGenerator());
