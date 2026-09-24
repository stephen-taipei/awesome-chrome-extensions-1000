// Password Generator — all randomness comes from Web Crypto, never Math.random.
class PasswordGenerator {
  constructor() {
    for (const id of ['password', 'length', 'lengthVal', 'upper', 'lower', 'numbers', 'symbols', 'generateBtn', 'copyBtn', 'strengthBar', 'strengthText']) {
      this[id] = document.getElementById(id);
    }
    this.generateBtn.addEventListener('click', () => this.generate());
    this.copyBtn.addEventListener('click', () => this.copy());
    this.length.addEventListener('input', () => {
      this.lengthVal.textContent = this.length.value;
      this.generate();
    });
    for (const control of [this.upper, this.lower, this.numbers, this.symbols]) {
      control.addEventListener('change', () => this.generate());
    }
    this.strengthText.setAttribute('role', 'status');
    this.generate();
  }
  generate() {
    const groups = [];
    if (this.upper.checked) groups.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (this.lower.checked) groups.push('abcdefghijklmnopqrstuvwxyz');
    if (this.numbers.checked) groups.push('0123456789');
    if (this.symbols.checked) groups.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
    try {
      this.password.value = SecureRandom.password(Number(this.length.value), groups);
      this.copyBtn.disabled = false;
      const bits = this.password.value.length * Math.log2(groups.join('').length);
      this.strengthBar.className = 'strength-bar ' + (bits >= 80 ? 'strong' : bits >= 60 ? 'good' : 'fair');
      this.strengthText.textContent = 'Randomly generated; use a unique password per account.';
    } catch (error) {
      this.password.value = '';
      this.copyBtn.disabled = true;
      this.strengthBar.className = 'strength-bar weak';
      this.strengthText.textContent = error.message;
    }
  }
  async copy() {
    if (!this.password.value) return;
    try {
      await navigator.clipboard.writeText(this.password.value);
      this.strengthText.textContent = 'Copied. Your clipboard may be readable by other applications.';
    } catch {
      this.strengthText.textContent = 'Clipboard access denied. Select and copy the password manually.';
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new PasswordGenerator());
