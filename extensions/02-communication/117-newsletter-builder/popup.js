// Newsletter Builder - Popup Script

class NewsletterBuilder {
  constructor() {
    this.data = {
      title: '',
      subtitle: '',
      sections: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('title');
    this.subtitleEl = document.getElementById('subtitle');
    this.sectionTitleEl = document.getElementById('sectionTitle');
    this.sectionContentEl = document.getElementById('sectionContent');
    this.addBtn = document.getElementById('addSection');
    this.clearBtn = document.getElementById('clearAll');
    this.listEl = document.getElementById('sectionsList');
    this.previewBtn = document.getElementById('preview');
    this.copyBtn = document.getElementById('copy');
    this.modal = document.getElementById('previewModal');
    this.closeModal = document.getElementById('closeModal');
    this.previewContent = document.getElementById('previewContent');
  }

  bindEvents() {
    this.titleEl.addEventListener('input', () => this.updateHeader());
    this.subtitleEl.addEventListener('input', () => this.updateHeader());
    this.addBtn.addEventListener('click', () => this.addSection());
    this.clearBtn.addEventListener('click', () => this.clearAll());
    this.previewBtn.addEventListener('click', () => this.showPreview());
    this.copyBtn.addEventListener('click', () => this.copyNewsletter());
    this.closeModal.addEventListener('click', () => this.hidePreview());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hidePreview();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('newsletterData');
    if (result.newsletterData) {
      this.data = result.newsletterData;
      this.titleEl.value = this.data.title;
      this.subtitleEl.value = this.data.subtitle;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ newsletterData: this.data });
  }

  updateHeader() {
    this.data.title = this.titleEl.value.trim();
    this.data.subtitle = this.subtitleEl.value.trim();
    this.saveData();
  }

  addSection() {
    const title = this.sectionTitleEl.value.trim();
    const content = this.sectionContentEl.value.trim();

    if (!title || !content) return;

    this.data.sections.push({
      id: Date.now(),
      title,
      content
    });

    this.sectionTitleEl.value = '';
    this.sectionContentEl.value = '';
    this.saveData();
    this.render();
  }

  removeSection(id) {
    this.data.sections = this.data.sections.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  clearAll() {
    this.data.sections = [];
    this.saveData();
    this.render();
  }

  formatNewsletter() {
    const title = this.data.title || 'Newsletter';
    const subtitle = this.data.subtitle;
    const divider = '═'.repeat(35);
    const thinDivider = '─'.repeat(35);

    let output = `${divider}\n`;
    output += `${title.toUpperCase()}\n`;
    if (subtitle) {
      output += `${subtitle}\n`;
    }
    output += `${divider}\n\n`;

    if (this.data.sections.length === 0) {
      output += '(No sections added yet)\n';
    } else {
      this.data.sections.forEach((section, index) => {
        output += `▸ ${section.title}\n`;
        output += `${thinDivider}\n`;
        output += `${section.content}\n\n`;
      });
    }

    output += `${divider}`;
    return output;
  }

  showPreview() {
    this.previewContent.textContent = this.formatNewsletter();
    this.modal.classList.remove('hidden');
  }

  hidePreview() {
    this.modal.classList.add('hidden');
  }

  async copyNewsletter() {
    const formatted = this.formatNewsletter();
    await navigator.clipboard.writeText(formatted);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  render() {
    if (this.data.sections.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No sections added</div>';
      return;
    }

    this.listEl.innerHTML = this.data.sections.map(s => `
      <div class="section-item">
        <div class="section-info">
          <div class="section-name">${this.escapeHtml(s.title)}</div>
          <div class="section-preview">${this.escapeHtml(s.content.substring(0, 40))}...</div>
        </div>
        <button class="remove-btn" data-id="${s.id}">Remove</button>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => this.removeSection(parseInt(btn.dataset.id)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new NewsletterBuilder());
