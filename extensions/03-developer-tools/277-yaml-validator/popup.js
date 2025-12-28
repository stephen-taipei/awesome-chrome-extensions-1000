// YAML Validator - Popup Script
class YAMLValidator {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() { this.input = document.getElementById('input'); this.btn = document.getElementById('validate'); this.result = document.getElementById('result'); }
  bindEvents() { this.btn.addEventListener('click', () => this.validate()); }
  validate() {
    const yaml = this.input.value.trim();
    if (!yaml) { this.result.className = 'result empty'; this.result.textContent = 'Please enter YAML to validate'; return; }
    try {
      this.parseYAML(yaml);
      this.result.className = 'result valid';
      this.result.textContent = 'Valid YAML syntax!';
    } catch (e) {
      this.result.className = 'result invalid';
      this.result.textContent = 'Invalid YAML: ' + e.message;
    }
  }
  parseYAML(yaml) {
    const lines = yaml.split('\n');
    let indentStack = [0];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const indent = line.search(/\S/);
      if (indent === -1) continue;
      if (indent % 2 !== 0 && !line.trim().startsWith('-')) throw new Error(`Line ${i+1}: Inconsistent indentation`);
      if (line.includes(':') && !line.includes(': ') && !line.trim().endsWith(':')) {
        if (!line.includes('://') && !line.includes('"') && !line.includes("'")) throw new Error(`Line ${i+1}: Missing space after colon`);
      }
      if (line.includes('\t')) throw new Error(`Line ${i+1}: Tabs not allowed, use spaces`);
    }
    return true;
  }
}
document.addEventListener('DOMContentLoaded', () => new YAMLValidator());
