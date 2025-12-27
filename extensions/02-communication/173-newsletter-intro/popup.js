// Newsletter Intro - Popup Script

class NewsletterIntro {
  constructor() {
    this.intros = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.toneEl = document.getElementById('tone');
    this.topicEl = document.getElementById('topic');
    this.hookEl = document.getElementById('hook');
    this.previewEl = document.getElementById('preview');
    this.brandEl = document.getElementById('brand');
    this.copyBtn = document.getElementById('copyIntro');
    this.saveBtn = document.getElementById('saveIntro');
    this.listEl = document.getElementById('introList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyIntro());
    this.saveBtn.addEventListener('click', () => this.saveIntro());
  }

  async loadData() {
    const result = await chrome.storage.local.get('newsletterIntros');
    if (result.newsletterIntros) {
      this.intros = result.newsletterIntros;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ newsletterIntros: this.intros });
  }

  getToneLabel(tone) {
    const labels = {
      professional: 'Professional',
      friendly: 'Friendly',
      urgent: 'Urgent',
      story: 'Story',
      question: 'Question',
      news: 'News'
    };
    return labels[tone] || tone;
  }

  getGreeting(tone) {
    const greetings = {
      professional: 'Dear readers,',
      friendly: 'Hey there! 👋',
      urgent: '⚠️ Important update:',
      story: 'Picture this...',
      question: 'Have you ever wondered...',
      news: '📰 Breaking:'
    };
    return greetings[tone] || 'Hi there,';
  }

  formatIntro() {
    const tone = this.toneEl.value;
    const topic = this.topicEl.value.trim();
    const hook = this.hookEl.value.trim();
    const preview = this.previewEl.value.trim();
    const brand = this.brandEl.value.trim();

    let intro = '';

    if (brand) {
      intro += `📧 ${brand}\n\n`;
    }

    intro += this.getGreeting(tone) + '\n\n';

    if (hook) {
      intro += `${hook}\n\n`;
    } else if (topic) {
      intro += `This week, we're diving into ${topic}.\n\n`;
    }

    if (preview) {
      intro += `In this issue:\n${preview}\n\n`;
    }

    intro += 'Let\'s get into it! 👇\n\n';
    intro += '─'.repeat(20);

    return intro;
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
    const topic = this.topicEl.value.trim();
    if (!topic) return;

    const intro = {
      id: Date.now(),
      tone: this.toneEl.value,
      topic,
      hook: this.hookEl.value.trim(),
      preview: this.previewEl.value.trim(),
      brand: this.brandEl.value.trim(),
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
      this.toneEl.value = intro.tone || 'professional';
      this.topicEl.value = intro.topic || '';
      this.hookEl.value = intro.hook || '';
      this.previewEl.value = intro.preview || '';
      this.brandEl.value = intro.brand || '';
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
          <div class="intro-topic">${this.escapeHtml(i.topic)}</div>
          <div class="intro-tone">${this.getToneLabel(i.tone)}</div>
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

document.addEventListener('DOMContentLoaded', () => new NewsletterIntro());
