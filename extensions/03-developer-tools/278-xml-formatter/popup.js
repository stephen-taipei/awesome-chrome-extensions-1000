// XML Formatter - Popup Script
class XMLFormatter {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('input'); this.output = document.getElementById('output'); this.formatBtn = document.getElementById('format'); this.minifyBtn = document.getElementById('minify'); this.copyBtn = document.getElementById('copy'); }
  bindEvents() { this.formatBtn.addEventListener('click', () => this.format()); this.minifyBtn.addEventListener('click', () => this.minify()); this.copyBtn.addEventListener('click', () => this.copy()); }
  format() {
    try {
      const xml = this.input.value;
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const err = doc.querySelector('parsererror');
      if (err) throw new Error('Invalid XML');
      this.output.value = this.prettify(xml);
    } catch (e) { this.output.value = 'Error: ' + e.message; }
  }
  prettify(xml) {
    let formatted = '';
    let indent = '';
    const tab = '  ';
    xml.split(/>\s*</).forEach((node, i) => {
      if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
      formatted += (i > 0 ? indent + '<' : '') + node + (i < xml.split(/>\s*</).length - 1 ? '>\n' : '');
      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) indent += tab;
    });
    return formatted;
  }
  minify() {
    try {
      const xml = this.input.value;
      this.output.value = xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
    } catch (e) { this.output.value = 'Error: ' + e.message; }
  }
  copy() { navigator.clipboard.writeText(this.output.value); }
}
document.addEventListener('DOMContentLoaded', () => new XMLFormatter());
