// Cron Parser - Popup Script
class CronParser {
  constructor() {
    this.presets = [
      { cron: '* * * * *', desc: 'Every minute' },
      { cron: '0 * * * *', desc: 'Every hour' },
      { cron: '0 0 * * *', desc: 'Every day at midnight' },
      { cron: '0 0 * * 0', desc: 'Every Sunday' },
      { cron: '0 0 1 * *', desc: 'First of every month' },
      { cron: '0 9 * * 1-5', desc: 'Weekdays at 9am' }
    ];
    this.initElements(); this.bindEvents(); this.renderPresets();
  }
  initElements() { this.cronInput = document.getElementById('cron'); this.parseBtn = document.getElementById('parse'); this.result = document.getElementById('result'); this.presetsEl = document.getElementById('presets'); }
  bindEvents() { this.parseBtn.addEventListener('click', () => this.parse()); this.cronInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.parse(); }); }
  renderPresets() {
    this.presetsEl.innerHTML = this.presets.map(p => `<div class="preset-item" data-cron="${p.cron}"><span class="preset-cron">${p.cron}</span><span>${p.desc}</span></div>`).join('');
    this.presetsEl.querySelectorAll('.preset-item').forEach(el => el.addEventListener('click', () => { this.cronInput.value = el.dataset.cron; this.parse(); }));
  }
  parse() {
    const parts = this.cronInput.value.trim().split(/\s+/);
    if (parts.length !== 5) { this.result.textContent = 'Invalid: need 5 parts (min hour day month weekday)'; return; }
    const [min, hour, day, month, weekday] = parts;
    const desc = [];
    desc.push(this.parseField(min, 'minute', 0, 59));
    desc.push(this.parseField(hour, 'hour', 0, 23));
    desc.push(this.parseField(day, 'day', 1, 31));
    desc.push(this.parseField(month, 'month', 1, 12));
    desc.push(this.parseField(weekday, 'weekday', 0, 6));
    this.result.innerHTML = desc.map(d => `<div>${d}</div>`).join('');
  }
  parseField(val, name, min, max) {
    if (val === '*') return `${name}: every ${name}`;
    if (val.includes('/')) { const [,step] = val.split('/'); return `${name}: every ${step} ${name}s`; }
    if (val.includes('-')) { const [s,e] = val.split('-'); return `${name}: ${s} to ${e}`; }
    if (val.includes(',')) return `${name}: at ${val}`;
    return `${name}: at ${val}`;
  }
}
document.addEventListener('DOMContentLoaded', () => new CronParser());
