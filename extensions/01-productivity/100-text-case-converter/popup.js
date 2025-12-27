// Text Case Converter - Popup Script

class TextCaseConverter {
  constructor() {
    this.currentCase = null;
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.inputEl = document.getElementById('inputText');
    this.outputEl = document.getElementById('outputText');
    this.copyBtn = document.getElementById('copyBtn');
    this.charCountEl = document.getElementById('charCount');
    this.wordCountEl = document.getElementById('wordCount');
    this.caseButtons = document.querySelectorAll('.case-btn');
  }

  bindEvents() {
    this.inputEl.addEventListener('input', () => {
      this.updateStats();
      if (this.currentCase) {
        this.convert(this.currentCase);
      }
    });

    this.caseButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.caseButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCase = btn.dataset.case;
        this.convert(this.currentCase);
      });
    });

    this.copyBtn.addEventListener('click', () => this.copyOutput());
  }

  updateStats() {
    const text = this.inputEl.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    this.charCountEl.textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
    this.wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  }

  convert(caseType) {
    const text = this.inputEl.value;
    let result = '';

    switch (caseType) {
      case 'lowercase':
        result = text.toLowerCase();
        break;

      case 'uppercase':
        result = text.toUpperCase();
        break;

      case 'title':
        result = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        break;

      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        break;

      case 'camel':
        result = this.toCamelCase(text);
        break;

      case 'pascal':
        result = this.toPascalCase(text);
        break;

      case 'snake':
        result = this.toSnakeCase(text);
        break;

      case 'kebab':
        result = this.toKebabCase(text);
        break;

      default:
        result = text;
    }

    this.outputEl.value = result;
  }

  toCamelCase(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^[A-Z]/, c => c.toLowerCase())
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  toPascalCase(text) {
    return text
      .toLowerCase()
      .replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, __, c) => c.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  toSnakeCase(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  toKebabCase(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async copyOutput() {
    const text = this.outputEl.value;
    if (!text) return;

    await navigator.clipboard.writeText(text);

    const originalText = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = originalText;
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new TextCaseConverter());
