// Announcement Creator - Popup Script

const TEMPLATES = {
  news: {
    emoji: '📢',
    header: '━━━━━━━━━━━━━━━━━━━━',
    format: (title, content, details, cta) => `
📢 ${title.toUpperCase()}
${TEMPLATES.news.header}

${content}

${details ? `📅 ${details}` : ''}
${cta ? `\n👉 ${cta}` : ''}

${TEMPLATES.news.header}`.trim()
  },
  event: {
    emoji: '🎉',
    format: (title, content, details, cta) => `
🎉✨ ${title} ✨🎉
━━━━━━━━━━━━━━━

${content}

${details ? `📅 When: ${details}` : ''}
${cta ? `\n🎯 ${cta}` : ''}

See you there! 🙌`.trim()
  },
  update: {
    emoji: '🔄',
    format: (title, content, details, cta) => `
🔄 UPDATE: ${title}
╔═══════════════════╗

${content}

${details ? `⏰ ${details}` : ''}
${cta ? `\n💡 ${cta}` : ''}

╚═══════════════════╝`.trim()
  },
  alert: {
    emoji: '⚠️',
    format: (title, content, details, cta) => `
⚠️ IMPORTANT: ${title} ⚠️
━━━━━━━━━━━━━━━━━━━━

${content}

${details ? `📌 ${details}` : ''}
${cta ? `\n❗ ${cta}` : ''}

━━━━━━━━━━━━━━━━━━━━`.trim()
  }
};

class AnnouncementCreator {
  constructor() {
    this.currentTemplate = 'news';
    this.initElements();
    this.bindEvents();
    this.updatePreview();
  }

  initElements() {
    this.templateBtns = document.querySelectorAll('.template-btn');
    this.titleEl = document.getElementById('title');
    this.contentEl = document.getElementById('content');
    this.detailsEl = document.getElementById('details');
    this.ctaEl = document.getElementById('cta');
    this.previewEl = document.getElementById('preview');
    this.copyBtn = document.getElementById('copyBtn');
  }

  bindEvents() {
    this.templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.templateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTemplate = btn.dataset.template;
        this.updatePreview();
      });
    });

    [this.titleEl, this.contentEl, this.detailsEl, this.ctaEl].forEach(el => {
      el.addEventListener('input', () => this.updatePreview());
    });

    this.copyBtn.addEventListener('click', () => this.copy());
  }

  updatePreview() {
    const title = this.titleEl.value || 'Your Title Here';
    const content = this.contentEl.value || 'Your announcement content goes here...';
    const details = this.detailsEl.value;
    const cta = this.ctaEl.value;

    const template = TEMPLATES[this.currentTemplate];
    this.previewEl.textContent = template.format(title, content, details, cta);
  }

  async copy() {
    const text = this.previewEl.textContent;
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new AnnouncementCreator());
