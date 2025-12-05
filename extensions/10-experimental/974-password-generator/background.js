// Background service worker for Password Generator
chrome.runtime.onInstalled.addListener(() => {
  console.log('Password Generator installed.');

  chrome.storage.local.set({
    defaultLength: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: true,
    passwordHistory: []
  });
});

// Handle password generation
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_PASSWORD') {
    const password = generatePassword(message.options);
    const strength = calculateStrength(password);

    // Save to history
    chrome.storage.local.get(['passwordHistory'], (data) => {
      const history = data.passwordHistory || [];
      history.unshift({
        id: Date.now(),
        length: password.length,
        strength: strength.score,
        timestamp: new Date().toISOString()
      });
      if (history.length > 20) history.pop();
      chrome.storage.local.set({ passwordHistory: history });
    });

    sendResponse({ success: true, password, strength });
    return true;
  }

  if (message.type === 'GENERATE_PASSPHRASE') {
    const passphrase = generatePassphrase(message.wordCount || 4);
    sendResponse({ success: true, passphrase });
  }
});

function generatePassword(options) {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (options.includeUppercase) chars += uppercase;
  if (options.includeLowercase) chars += lowercase;
  if (options.includeNumbers) chars += numbers;
  if (options.includeSymbols) chars += symbols;

  if (!chars) chars = lowercase + numbers;

  let password = '';
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

function generatePassphrase(wordCount) {
  const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'galaxy', 'harbor',
    'island', 'jungle', 'knight', 'lemon', 'mountain', 'nebula', 'ocean', 'phoenix',
    'quantum', 'river', 'sunset', 'thunder', 'umbrella', 'volcano', 'whisper', 'zenith'];

  const array = new Uint32Array(wordCount);
  crypto.getRandomValues(array);

  return Array.from(array).map(n => words[n % words.length]).join('-');
}

function calculateStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}
