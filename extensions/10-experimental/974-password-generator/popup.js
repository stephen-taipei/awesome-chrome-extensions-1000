document.addEventListener('DOMContentLoaded', () => {
  const passwordOutput = document.getElementById('password-output');
  const strengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');
  const lengthSlider = document.getElementById('length-slider');
  const lengthValue = document.getElementById('length-value');

  // Length slider
  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
  });

  // Generate password
  document.getElementById('generate-btn').addEventListener('click', () => {
    const options = {
      length: parseInt(lengthSlider.value),
      includeUppercase: document.getElementById('uppercase').checked,
      includeLowercase: document.getElementById('lowercase').checked,
      includeNumbers: document.getElementById('numbers').checked,
      includeSymbols: document.getElementById('symbols').checked
    };

    chrome.runtime.sendMessage({ type: 'GENERATE_PASSWORD', options }, (response) => {
      if (response.success) {
        passwordOutput.value = response.password;
        updateStrengthMeter(response.strength);
      }
    });
  });

  // Generate passphrase
  document.getElementById('passphrase-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GENERATE_PASSPHRASE', wordCount: 4 }, (response) => {
      if (response.success) {
        passwordOutput.value = response.passphrase;
        updateStrengthMeter({ score: 5, label: 'Strong' });
      }
    });
  });

  // Copy to clipboard
  document.getElementById('copy-btn').addEventListener('click', async () => {
    const password = passwordOutput.value;
    if (password && password !== 'Click Generate') {
      await navigator.clipboard.writeText(password);
      document.getElementById('copy-btn').textContent = '✓';
      setTimeout(() => {
        document.getElementById('copy-btn').textContent = '📋';
      }, 1500);
    }
  });

  function updateStrengthMeter(strength) {
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60', '#1abc9c', '#16a085'];
    const percentage = (strength.score / 7) * 100;

    strengthBar.style.width = `${percentage}%`;
    strengthBar.style.background = colors[strength.score] || colors[0];
    strengthLabel.textContent = strength.label;
    strengthLabel.style.color = colors[strength.score] || colors[0];
  }

  // Load settings
  chrome.storage.local.get([
    'defaultLength', 'includeUppercase', 'includeLowercase',
    'includeNumbers', 'includeSymbols'
  ], (data) => {
    if (data.defaultLength) {
      lengthSlider.value = data.defaultLength;
      lengthValue.textContent = data.defaultLength;
    }
    if (data.includeUppercase !== undefined) document.getElementById('uppercase').checked = data.includeUppercase;
    if (data.includeLowercase !== undefined) document.getElementById('lowercase').checked = data.includeLowercase;
    if (data.includeNumbers !== undefined) document.getElementById('numbers').checked = data.includeNumbers;
    if (data.includeSymbols !== undefined) document.getElementById('symbols').checked = data.includeSymbols;
  });

  // Auto-generate on load
  document.getElementById('generate-btn').click();
});
