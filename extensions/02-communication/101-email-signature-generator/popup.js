// Email Signature Generator - Popup Script

class EmailSignatureGenerator {
  constructor() {
    this.data = {
      fullName: '',
      jobTitle: '',
      company: '',
      email: '',
      phone: '',
      website: ''
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.fullNameEl = document.getElementById('fullName');
    this.jobTitleEl = document.getElementById('jobTitle');
    this.companyEl = document.getElementById('company');
    this.emailEl = document.getElementById('email');
    this.phoneEl = document.getElementById('phone');
    this.websiteEl = document.getElementById('website');
    this.previewEl = document.getElementById('preview');
    this.copyHtmlBtn = document.getElementById('copyHtml');
    this.copyTextBtn = document.getElementById('copyText');
  }

  bindEvents() {
    const inputs = [this.fullNameEl, this.jobTitleEl, this.companyEl, this.emailEl, this.phoneEl, this.websiteEl];
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.updateData();
        this.updatePreview();
        this.saveData();
      });
    });

    this.copyHtmlBtn.addEventListener('click', () => this.copyHtml());
    this.copyTextBtn.addEventListener('click', () => this.copyText());
  }

  async loadData() {
    const result = await chrome.storage.local.get('emailSignature');
    if (result.emailSignature) {
      this.data = result.emailSignature;
      this.fullNameEl.value = this.data.fullName || '';
      this.jobTitleEl.value = this.data.jobTitle || '';
      this.companyEl.value = this.data.company || '';
      this.emailEl.value = this.data.email || '';
      this.phoneEl.value = this.data.phone || '';
      this.websiteEl.value = this.data.website || '';
    }
    this.updatePreview();
  }

  async saveData() {
    await chrome.storage.local.set({ emailSignature: this.data });
  }

  updateData() {
    this.data = {
      fullName: this.fullNameEl.value,
      jobTitle: this.jobTitleEl.value,
      company: this.companyEl.value,
      email: this.emailEl.value,
      phone: this.phoneEl.value,
      website: this.websiteEl.value
    };
  }

  updatePreview() {
    if (!this.data.fullName && !this.data.email) {
      this.previewEl.innerHTML = '<div class="empty-preview">Fill in the form to see your signature</div>';
      return;
    }

    let contactLines = [];
    if (this.data.email) {
      contactLines.push(`<a href="mailto:${this.data.email}">${this.data.email}</a>`);
    }
    if (this.data.phone) {
      contactLines.push(this.data.phone);
    }
    if (this.data.website) {
      const url = this.data.website.startsWith('http') ? this.data.website : `https://${this.data.website}`;
      contactLines.push(`<a href="${url}" target="_blank">${this.data.website.replace(/^https?:\/\//, '')}</a>`);
    }

    this.previewEl.innerHTML = `
      ${this.data.fullName ? `<div class="sig-name">${this.data.fullName}</div>` : ''}
      ${this.data.jobTitle ? `<div class="sig-title">${this.data.jobTitle}</div>` : ''}
      ${this.data.company ? `<div class="sig-company">${this.data.company}</div>` : ''}
      ${contactLines.length ? `<div class="sig-contact">${contactLines.join(' | ')}</div>` : ''}
    `;
  }

  generateHtml() {
    let contactLines = [];
    if (this.data.email) {
      contactLines.push(`<a href="mailto:${this.data.email}" style="color:#3b82f6;text-decoration:none">${this.data.email}</a>`);
    }
    if (this.data.phone) {
      contactLines.push(this.data.phone);
    }
    if (this.data.website) {
      const url = this.data.website.startsWith('http') ? this.data.website : `https://${this.data.website}`;
      contactLines.push(`<a href="${url}" style="color:#3b82f6;text-decoration:none">${this.data.website.replace(/^https?:\/\//, '')}</a>`);
    }

    return `<table cellpadding="0" cellspacing="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <tr>
    <td>
      ${this.data.fullName ? `<div style="font-size:16px;font-weight:700;color:#1e3a8a;margin-bottom:2px">${this.data.fullName}</div>` : ''}
      ${this.data.jobTitle ? `<div style="font-size:13px;color:#3b82f6;margin-bottom:8px">${this.data.jobTitle}</div>` : ''}
      ${this.data.company ? `<div style="font-size:12px;font-weight:600;color:#1e3a8a;margin-bottom:8px;padding-bottom:8px;border-bottom:2px solid #3b82f6">${this.data.company}</div>` : ''}
      ${contactLines.length ? `<div style="font-size:11px;color:#64748b">${contactLines.join(' | ')}</div>` : ''}
    </td>
  </tr>
</table>`;
  }

  generateText() {
    let lines = [];
    if (this.data.fullName) lines.push(this.data.fullName);
    if (this.data.jobTitle) lines.push(this.data.jobTitle);
    if (this.data.company) lines.push(this.data.company);
    lines.push('---');
    if (this.data.email) lines.push(this.data.email);
    if (this.data.phone) lines.push(this.data.phone);
    if (this.data.website) lines.push(this.data.website);
    return lines.join('\n');
  }

  async copyHtml() {
    const html = this.generateHtml();
    await navigator.clipboard.writeText(html);
    this.showCopied(this.copyHtmlBtn);
  }

  async copyText() {
    const text = this.generateText();
    await navigator.clipboard.writeText(text);
    this.showCopied(this.copyTextBtn);
  }

  showCopied(btn) {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new EmailSignatureGenerator());
