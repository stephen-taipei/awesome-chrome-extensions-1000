// Markdown Preview - Popup Script
class MarkdownPreview {
  constructor() { this.initElements(); this.bindEvents(); this.loadSaved(); }
  initElements() { this.writeTab = document.getElementById('writeTab'); this.previewTab = document.getElementById('previewTab'); this.writePane = document.getElementById('writePane'); this.previewPane = document.getElementById('previewPane'); this.mdEl = document.getElementById('markdown'); this.previewEl = document.getElementById('preview'); this.copyBtn = document.getElementById('copyBtn'); this.copyHtmlBtn = document.getElementById('copyHtmlBtn'); }
  bindEvents() { this.writeTab.addEventListener('click', () => this.showWrite()); this.previewTab.addEventListener('click', () => this.showPreview()); this.mdEl.addEventListener('input', () => this.save()); this.copyBtn.addEventListener('click', () => this.copyMd()); this.copyHtmlBtn.addEventListener('click', () => this.copyHtml()); }
  async loadSaved() { const r = await chrome.storage.local.get('markdownContent'); if (r.markdownContent) this.mdEl.value = r.markdownContent; }
  async save() { await chrome.storage.local.set({ markdownContent: this.mdEl.value }); }
  showWrite() { this.writeTab.classList.add('active'); this.previewTab.classList.remove('active'); this.writePane.classList.add('active'); this.previewPane.classList.remove('active'); }
  showPreview() { this.previewTab.classList.add('active'); this.writeTab.classList.remove('active'); this.previewPane.classList.add('active'); this.writePane.classList.remove('active'); this.previewEl.innerHTML = this.parseMarkdown(this.mdEl.value); }
  escapeHtml(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  parseMarkdown(md) { let html = this.escapeHtml(md); html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>'); html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>'); html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>'); html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); html = html.replace(/\*(.+?)\*/g, '<em>$1</em>'); html = html.replace(/`([^`]+)`/g, '<code>$1</code>'); html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>'); html = html.replace(/^- (.+)$/gm, '<li>$1</li>'); html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>'); html = html.replace(/\n\n/g, '</p><p>'); return '<p>' + html + '</p>'; }
  async copyMd() { await navigator.clipboard.writeText(this.mdEl.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy Markdown'; }, 1500); }
  async copyHtml() { await navigator.clipboard.writeText(this.parseMarkdown(this.mdEl.value)); this.copyHtmlBtn.textContent = 'Copied!'; setTimeout(() => { this.copyHtmlBtn.textContent = 'Copy HTML'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new MarkdownPreview());
