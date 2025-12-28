// SQL Formatter - Popup Script
class SqlFormatter {
  constructor() { this.keywords = ['SELECT','FROM','WHERE','AND','OR','JOIN','LEFT','RIGHT','INNER','OUTER','ON','ORDER','BY','GROUP','HAVING','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','INDEX','DISTINCT','AS','IN','NOT','NULL','IS','LIKE','BETWEEN','UNION','ALL','LIMIT','OFFSET','ASC','DESC']; this.initElements(); this.bindEvents(); }
  initElements() { this.inputEl = document.getElementById('sqlInput'); this.outputEl = document.getElementById('sqlOutput'); this.formatBtn = document.getElementById('formatBtn'); this.minifyBtn = document.getElementById('minifyBtn'); this.copyBtn = document.getElementById('copyBtn'); }
  bindEvents() { this.formatBtn.addEventListener('click', () => this.format()); this.minifyBtn.addEventListener('click', () => this.minify()); this.copyBtn.addEventListener('click', () => this.copy()); }
  format() { let sql = this.inputEl.value.trim(); if (!sql) return; const newlineKeywords = ['SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','ORDER BY','GROUP BY','HAVING','UNION','INSERT','UPDATE','DELETE','SET','VALUES']; newlineKeywords.forEach(kw => { const regex = new RegExp(`\\b${kw}\\b`, 'gi'); sql = sql.replace(regex, '\n' + kw.toUpperCase()); }); sql = sql.replace(/,/g, ',\n  '); sql = sql.replace(/\bAND\b/gi, '\n  AND'); sql = sql.replace(/\bOR\b/gi, '\n  OR'); sql = sql.replace(/\n\s*\n/g, '\n'); sql = sql.trim(); this.outputEl.value = sql; }
  minify() { let sql = this.inputEl.value.trim(); if (!sql) return; sql = sql.replace(/\s+/g, ' ').replace(/\s*([,()])\s*/g, '$1').trim(); this.outputEl.value = sql; }
  async copy() { if (!this.outputEl.value) return; await navigator.clipboard.writeText(this.outputEl.value); this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = 'Copy'; }, 1500); }
}
document.addEventListener('DOMContentLoaded', () => new SqlFormatter());
