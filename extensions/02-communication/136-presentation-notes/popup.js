// Presentation Notes - Popup Script

class PresentationNotes {
  constructor() {
    this.presentation = {
      title: '',
      slides: []
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.presTitleEl = document.getElementById('presTitle');
    this.slideTitleEl = document.getElementById('slideTitle');
    this.slideNotesEl = document.getElementById('slideNotes');
    this.addBtn = document.getElementById('addSlide');
    this.exportBtn = document.getElementById('exportNotes');
    this.listEl = document.getElementById('slidesList');
  }

  bindEvents() {
    this.presTitleEl.addEventListener('input', () => this.updateTitle());
    this.addBtn.addEventListener('click', () => this.addSlide());
    this.exportBtn.addEventListener('click', () => this.exportNotes());
  }

  async loadData() {
    const result = await chrome.storage.local.get('presentationNotes');
    if (result.presentationNotes) {
      this.presentation = result.presentationNotes;
      this.presTitleEl.value = this.presentation.title;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ presentationNotes: this.presentation });
  }

  updateTitle() {
    this.presentation.title = this.presTitleEl.value.trim();
    this.saveData();
  }

  addSlide() {
    const title = this.slideTitleEl.value.trim();
    const notes = this.slideNotesEl.value.trim();

    if (!title) return;

    this.presentation.slides.push({
      id: Date.now(),
      title,
      notes
    });

    this.slideTitleEl.value = '';
    this.slideNotesEl.value = '';
    this.saveData();
    this.render();
  }

  moveSlide(id, direction) {
    const index = this.presentation.slides.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.presentation.slides.length) return;

    const slide = this.presentation.slides.splice(index, 1)[0];
    this.presentation.slides.splice(newIndex, 0, slide);
    this.saveData();
    this.render();
  }

  deleteSlide(id) {
    this.presentation.slides = this.presentation.slides.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  async exportNotes() {
    const title = this.presentation.title || 'Presentation Notes';
    let text = `${title.toUpperCase()}\n${'═'.repeat(40)}\n\n`;

    if (this.presentation.slides.length === 0) {
      text += '(No slides added)\n';
    } else {
      this.presentation.slides.forEach((slide, i) => {
        text += `SLIDE ${i + 1}: ${slide.title}\n`;
        text += `${'─'.repeat(40)}\n`;
        text += `${slide.notes || '(No notes)'}\n\n`;
      });
    }

    text += `${'═'.repeat(40)}`;

    await navigator.clipboard.writeText(text);

    const original = this.exportBtn.textContent;
    this.exportBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.exportBtn.textContent = original;
    }, 1500);
  }

  render() {
    if (this.presentation.slides.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No slides added</div>';
      return;
    }

    this.listEl.innerHTML = this.presentation.slides.map((s, i) => `
      <div class="slide-item">
        <div class="slide-header">
          <span class="slide-num">${i + 1}</span>
          <span class="slide-title">${this.escapeHtml(s.title)}</span>
        </div>
        ${s.notes ? `<div class="slide-notes">${this.escapeHtml(s.notes)}</div>` : ''}
        <div class="slide-actions">
          <button class="move-btn" data-up="${s.id}">↑</button>
          <button class="move-btn" data-down="${s.id}">↓</button>
          <button class="delete-btn" data-delete="${s.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-up]').forEach(btn => {
      btn.addEventListener('click', () => this.moveSlide(parseInt(btn.dataset.up), 'up'));
    });

    this.listEl.querySelectorAll('[data-down]').forEach(btn => {
      btn.addEventListener('click', () => this.moveSlide(parseInt(btn.dataset.down), 'down'));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSlide(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new PresentationNotes());
