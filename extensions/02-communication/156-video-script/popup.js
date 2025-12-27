// Video Script - Popup Script

class VideoScript {
  constructor() {
    this.scripts = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.hookEl = document.getElementById('hook');
    this.contentEl = document.getElementById('content');
    this.ctaEl = document.getElementById('cta');
    this.copyBtn = document.getElementById('copyScript');
    this.saveBtn = document.getElementById('saveScript');
    this.listEl = document.getElementById('scriptList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyScript());
    this.saveBtn.addEventListener('click', () => this.saveScript());
  }

  async loadData() {
    const result = await chrome.storage.local.get('videoScripts');
    if (result.videoScripts) {
      this.scripts = result.videoScripts;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ videoScripts: this.scripts });
  }

  formatScript() {
    const hook = this.hookEl.value.trim();
    const content = this.contentEl.value.trim();
    const cta = this.ctaEl.value.trim();

    let output = '🎬 VIDEO SCRIPT\n';
    output += '═'.repeat(30) + '\n\n';

    output += '🎯 HOOK / INTRO\n';
    output += '─'.repeat(20) + '\n';
    output += (hook || '(No hook)') + '\n\n';

    output += '📝 MAIN CONTENT\n';
    output += '─'.repeat(20) + '\n';
    output += (content || '(No content)') + '\n\n';

    output += '📢 CALL TO ACTION\n';
    output += '─'.repeat(20) + '\n';
    output += (cta || '(No CTA)') + '\n\n';

    output += '═'.repeat(30);

    return output;
  }

  async copyScript() {
    const text = this.formatScript();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveScript() {
    const hook = this.hookEl.value.trim();
    const content = this.contentEl.value.trim();
    const cta = this.ctaEl.value.trim();

    if (!hook && !content && !cta) return;

    const script = {
      id: Date.now(),
      hook,
      content,
      cta,
      created: Date.now()
    };

    this.scripts.unshift(script);
    if (this.scripts.length > 15) {
      this.scripts.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadScript(id) {
    const script = this.scripts.find(s => s.id === id);
    if (script) {
      this.hookEl.value = script.hook || '';
      this.contentEl.value = script.content || '';
      this.ctaEl.value = script.cta || '';
    }
  }

  deleteScript(id) {
    this.scripts = this.scripts.filter(s => s.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.scripts.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved scripts</div>';
      return;
    }

    this.listEl.innerHTML = this.scripts.map(s => {
      const preview = s.hook || s.content || s.cta || 'Empty script';
      return `
        <div class="script-item">
          <div class="script-info">
            <div class="script-preview">${this.escapeHtml(preview.substring(0, 30))}...</div>
            <div class="script-date">${this.formatDate(s.created)}</div>
          </div>
          <div class="script-actions">
            <button class="load-btn" data-load="${s.id}">Load</button>
            <button class="delete-btn" data-delete="${s.id}">Del</button>
          </div>
        </div>
      `;
    }).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadScript(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteScript(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new VideoScript());
