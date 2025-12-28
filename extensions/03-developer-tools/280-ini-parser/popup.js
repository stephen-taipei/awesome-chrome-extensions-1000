// INI Parser - Popup Script
class INIParser {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('input'); this.output = document.getElementById('output'); this.parseBtn = document.getElementById('parse'); }
  bindEvents() { this.parseBtn.addEventListener('click', () => this.parse()); }
  parse() {
    try {
      const ini = this.input.value.trim();
      if (!ini) { this.output.value = 'Please enter INI content'; return; }
      const result = this.parseINI(ini);
      this.output.value = JSON.stringify(result, null, 2);
    } catch (e) { this.output.value = 'Error: ' + e.message; }
  }
  parseINI(ini) {
    const result = {};
    let currentSection = null;
    const lines = ini.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;
      const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        result[currentSection] = {};
        continue;
      }
      const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        let value = kvMatch[2].trim();
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value) && value !== '') value = Number(value);
        if (currentSection) result[currentSection][key] = value;
        else result[key] = value;
      }
    }
    return result;
  }
}
document.addEventListener('DOMContentLoaded', () => new INIParser());
