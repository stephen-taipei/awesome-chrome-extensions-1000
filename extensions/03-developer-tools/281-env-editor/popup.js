// ENV Editor - Popup Script
class ENVEditor {
  constructor() { this.vars = []; this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('input'); this.varsEl = document.getElementById('vars'); this.parseBtn = document.getElementById('parse'); this.jsonBtn = document.getElementById('toJson'); this.copyBtn = document.getElementById('copy'); }
  bindEvents() { this.parseBtn.addEventListener('click', () => this.parse()); this.jsonBtn.addEventListener('click', () => this.toJson()); this.copyBtn.addEventListener('click', () => this.copy()); }
  parse() {
    const env = this.input.value.trim();
    this.vars = [];
    env.split('\n').forEach(line => {
      if (!line.trim() || line.startsWith('#')) return;
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) this.vars.push({ key: match[1].trim(), value: match[2].trim() });
    });
    this.render();
  }
  render() {
    this.varsEl.innerHTML = this.vars.map((v, i) => `<div class="var-item"><input class="var-key" value="${v.key}" data-idx="${i}" data-field="key"><input value="${v.value}" data-idx="${i}" data-field="value"></div>`).join('');
    this.varsEl.querySelectorAll('input').forEach(inp => inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      this.vars[idx][field] = e.target.value;
    }));
  }
  toJson() { const obj = {}; this.vars.forEach(v => obj[v.key] = v.value); this.input.value = JSON.stringify(obj, null, 2); }
  copy() { const env = this.vars.map(v => `${v.key}=${v.value}`).join('\n'); navigator.clipboard.writeText(env); }
}
document.addEventListener('DOMContentLoaded', () => new ENVEditor());
