// Keycode Finder - Popup Script
class KeycodeFinder {
  constructor() { this.initElements(); this.bindEvents(); }
  initElements() {
    this.keyDisplay = document.getElementById('keyDisplay');
    this.keyEl = document.getElementById('key');
    this.codeEl = document.getElementById('code');
    this.keyCodeEl = document.getElementById('keyCode');
    this.whichEl = document.getElementById('which');
    this.locationEl = document.getElementById('location');
    this.modifiersEl = document.getElementById('modifiers');
  }
  bindEvents() { document.addEventListener('keydown', (e) => this.handleKey(e)); }
  handleKey(e) {
    e.preventDefault();
    this.keyDisplay.textContent = e.key === ' ' ? 'Space' : e.key;
    this.keyEl.textContent = `"${e.key}"`;
    this.codeEl.textContent = e.code;
    this.keyCodeEl.textContent = e.keyCode;
    this.whichEl.textContent = e.which;
    const locations = ['Standard', 'Left', 'Right', 'Numpad'];
    this.locationEl.textContent = locations[e.location] || e.location;
    const mods = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.shiftKey) mods.push('Shift');
    if (e.altKey) mods.push('Alt');
    if (e.metaKey) mods.push('Meta');
    this.modifiersEl.textContent = mods.length ? mods.join('+') : 'None';
  }
}
document.addEventListener('DOMContentLoaded', () => new KeycodeFinder());
