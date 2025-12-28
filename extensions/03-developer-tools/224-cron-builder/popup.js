// Cron Builder - Popup Script
class CronBuilder {
  constructor() { this.initElements(); this.bindEvents(); this.update(); }
  initElements() { this.cronEl = document.getElementById('cronExpr'); this.descEl = document.getElementById('description'); this.copyBtn = document.getElementById('copyBtn'); this.fields = { minute: document.getElementById('minute'), hour: document.getElementById('hour'), dom: document.getElementById('dom'), month: document.getElementById('month'), dow: document.getElementById('dow') }; }
  bindEvents() { Object.values(this.fields).forEach(f => f.addEventListener('change', () => this.update())); this.copyBtn.addEventListener('click', () => this.copy()); document.querySelectorAll('[data-cron]').forEach(b => b.addEventListener('click', () => this.setPreset(b.dataset.cron))); }
  update() { const expr = `${this.fields.minute.value} ${this.fields.hour.value} ${this.fields.dom.value} ${this.fields.month.value} ${this.fields.dow.value}`; this.cronEl.value = expr; this.descEl.textContent = this.describe(expr); }
  describe(cron) { const [min, hr, dom, mon, dow] = cron.split(' '); let parts = []; if (min === '*' && hr === '*') parts.push('Every minute'); else if (min === '*') parts.push(`Every minute of hour ${hr}`); else if (hr === '*') parts.push(`At minute ${min} of every hour`); else parts.push(`At ${hr}:${min.padStart(2, '0')}`); if (dom !== '*') parts.push(`on day ${dom}`); if (mon !== '*') parts.push(`in month ${mon}`); if (dow !== '*') parts.push(`on ${dow === '1-5' ? 'weekdays' : dow === '0,6' ? 'weekends' : 'day ' + dow}`); return parts.join(' '); }
  setPreset(cron) { const [min, hr, dom, mon, dow] = cron.split(' '); this.fields.minute.value = min; this.fields.hour.value = hr; this.fields.dom.value = dom; this.fields.month.value = mon; this.fields.dow.value = dow; this.update(); }
  async copy() { await navigator.clipboard.writeText(this.cronEl.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new CronBuilder());
