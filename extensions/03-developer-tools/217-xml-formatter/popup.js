// XML Formatter - Popup Script
class XmlFormatter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('xmlInput'); this.outputEl = document.getElementById('xmlOutput'); this.formatBtn = document.getElementById('formatBtn'); this.minifyBtn = document.getElementById('minifyBtn'); this.copyBtn = document.getElementById('copyBtn'); this.statusEl = document.getElementById('status'); }
  bindEvents() { this.formatBtn.addEventListener('click', () => this.format()); this.minifyBtn.addEventListener('click', () => this.minify()); this.copyBtn.addEventListener('click', () => this.copy()); }
  setStatus(msg, type) { this.statusEl.textContent = msg; this.statusEl.className = 'status ' + type; }
  parseXml(xml) { const parser = new DOMParser(); const doc = parser.parseFromString(xml, 'text/xml'); const error = doc.querySelector('parsererror'); if (error) throw new Error('Invalid XML'); return doc; }
  formatXml(xml, indent = 2) { let formatted = ''; let pad = 0; xml.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).forEach(node => { if (!node.trim()) return; if (node.match(/<\/\w/)) pad -= indent; formatted += ' '.repeat(pad) + node + '\n'; if (node.match(/<\w[^>]*[^\/]>$/)) pad += indent; }); return formatted.trim(); }
  format() { const xml = this.inputEl.value; if (!xml.trim()) { this.setStatus('Please enter XML', 'error'); return; } try { this.parseXml(xml); this.outputEl.value = this.formatXml(xml); this.setStatus('XML formatted!', 'success'); } catch (e) { this.setStatus(e.message, 'error'); } }
  minify() { const xml = this.inputEl.value; if (!xml.trim()) { this.setStatus('Please enter XML', 'error'); return; } try { this.parseXml(xml); this.outputEl.value = xml.replace(/>\s+</g, '><').replace(/\n\s*/g, '').trim(); this.setStatus('XML minified!', 'success'); } catch (e) { this.setStatus(e.message, 'error'); } }
  async copy() { if (!this.outputEl.value) { this.setStatus('Nothing to copy', 'error'); return; } await navigator.clipboard.writeText(this.outputEl.value); this.setStatus('Copied!', 'success'); }
}
document.addEventListener('DOMContentLoaded', () => new XmlFormatter());
