document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('password-output');
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');
  const length = document.getElementById('length-slider');
  const lengthValue = document.getElementById('length-value');
  const copy = document.getElementById('copy-btn');
  label.setAttribute('role', 'status');
  copy.disabled = true;
  let request = 0;

  function generate(message) {
    const current = ++request;
    output.value = '';
    copy.disabled = true;
    label.textContent = 'Generating…';
    if (!globalThis.chrome?.runtime?.sendMessage) {
      label.textContent = 'Install this folder as a Chrome extension to generate passwords.';
      return;
    }
    chrome.runtime.sendMessage(message, response => {
      const error = chrome.runtime.lastError;
      if (current !== request) return;
      if (error || !response?.success) {
        bar.style.width = '0%';
        label.textContent = error?.message || response?.error || 'Password generation failed.';
        return;
      }
      output.value = response.password || response.passphrase;
      copy.disabled = false;
      bar.style.width = `${Math.max(0, Math.min(7, response.strength.score)) / 7 * 100}%`;
      label.textContent = response.strength.label;
    });
  }
  length.addEventListener('input', () => { lengthValue.textContent = length.value; });
  document.getElementById('generate-btn').addEventListener('click', () => generate({
    type: 'GENERATE_PASSWORD', options: {
      length: Number(length.value),
      includeUppercase: document.getElementById('uppercase').checked,
      includeLowercase: document.getElementById('lowercase').checked,
      includeNumbers: document.getElementById('numbers').checked,
      includeSymbols: document.getElementById('symbols').checked
    }
  }));
  const phraseButton = document.getElementById('passphrase-btn');
  phraseButton.textContent = 'Passphrase (16 words)';
  phraseButton.addEventListener('click', () => generate({ type: 'GENERATE_PASSPHRASE', wordCount: 16 }));
  copy.addEventListener('click', async () => {
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
      label.textContent = 'Copied. Other applications may read your clipboard.';
    } catch {
      label.textContent = 'Clipboard access denied. Select and copy the password manually.';
    }
  });
  if (!globalThis.chrome?.storage?.local) {
    label.textContent = 'Install this folder as a Chrome extension to use it.';
    return;
  }
  chrome.storage.local.get(['defaultLength', 'includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols'], data => {
    const error = chrome.runtime.lastError;
    if (error) { label.textContent = error.message; return; }
    if (Number.isInteger(data.defaultLength) && data.defaultLength >= 8 && data.defaultLength <= 64) {
      length.value = data.defaultLength;
      lengthValue.textContent = String(data.defaultLength);
    }
    for (const [key, id] of [['includeUppercase', 'uppercase'], ['includeLowercase', 'lowercase'], ['includeNumbers', 'numbers'], ['includeSymbols', 'symbols']]) {
      if (typeof data[key] === 'boolean') document.getElementById(id).checked = data[key];
    }
    document.getElementById('generate-btn').click();
  });
});
