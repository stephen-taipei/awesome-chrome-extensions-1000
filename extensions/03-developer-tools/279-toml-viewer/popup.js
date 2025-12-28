// TOML Viewer - Popup Script
class TOMLViewer {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('input'); this.output = document.getElementById('output'); this.parseBtn = document.getElementById('parse'); }
  bindEvents() { this.parseBtn.addEventListener('click', () => this.parse()); }
  parse() {
    try {
      const toml = this.input.value.trim();
      if (!toml) { this.output.value = 'Please enter TOML'; return; }
      const result = this.parseTOML(toml);
      this.output.value = JSON.stringify(result, null, 2);
    } catch (e) { this.output.value = 'Error: ' + e.message; }
  }
  parseTOML(toml) {
    const result = {};
    let current = result;
    const lines = toml.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const tableMatch = trimmed.match(/^\[([^\]]+)\]$/);
      if (tableMatch) {
        const keys = tableMatch[1].split('.');
        current = result;
        for (const key of keys) {
          if (!current[key]) current[key] = {};
          current = current[key];
        }
        continue;
      }
      const kvMatch = trimmed.match(/^([^=]+)=(.+)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        let value = kvMatch[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        else if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value)) value = Number(value);
        current[key] = value;
      }
    }
    return result;
  }
}
document.addEventListener('DOMContentLoaded', () => new TOMLViewer());
