// Standalone extension package: no remote scripts or dependencies outside this directory.
importScripts('secure-random.js');
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') return;
  chrome.storage.local.set({
    defaultLength: 16, includeUppercase: true, includeLowercase: true,
    includeNumbers: true, includeSymbols: true, excludeAmbiguous: true
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return false;
  if (!message || !['GENERATE_PASSWORD', 'GENERATE_PASSPHRASE'].includes(message.type)) return false;
  try {
    if (message.type === 'GENERATE_PASSWORD') {
      const password = generatePassword(message.options);
      sendResponse({ success: true, password, strength: calculateStrength(password) });
    } else {
      const count = message.wordCount ?? 16;
      const passphrase = generatePassphrase(count);
      const bits = Math.floor(count * Math.log2(PASSPHRASE_WORDS.length));
      sendResponse({ success: true, passphrase, strength: {
        score: Math.min(7, Math.floor(bits / 16)),
        label: `Estimated ${bits} bits (${PASSPHRASE_WORDS.length}-word list)`
      } });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
  return false; // Every supported request above responds synchronously.
});

function generatePassword(options) {
  if (!options || typeof options !== 'object') throw new TypeError('Password options are required.');
  const groups = [];
  if (options.includeUppercase === true) groups.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
  if (options.includeLowercase === true) groups.push('abcdefghjkmnpqrstuvwxyz');
  if (options.includeNumbers === true) groups.push('23456789');
  if (options.includeSymbols === true) groups.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
  return SecureRandom.password(options.length, groups);
}

// Small, explicit word list. Never label four words from it as a strong password.
const PASSPHRASE_WORDS = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'galaxy', 'harbor',
  'island', 'jungle', 'knight', 'lemon', 'mountain', 'nebula', 'ocean', 'phoenix',
  'quantum', 'river', 'sunset', 'thunder', 'umbrella', 'volcano', 'whisper', 'zenith'];
function generatePassphrase(wordCount = 16) {
  if (!Number.isInteger(wordCount) || wordCount < 4 || wordCount > 32) {
    throw new RangeError('Passphrases require 4 to 32 words; 16 or more is recommended for this small list.');
  }
  return Array.from({ length: wordCount }, () => PASSPHRASE_WORDS[SecureRandom.index(PASSPHRASE_WORDS.length)]).join('-');
}
function calculateStrength(password) {
  let alphabet = 0;
  if (/[a-z]/.test(password)) alphabet += 23;
  if (/[A-Z]/.test(password)) alphabet += 24;
  if (/[0-9]/.test(password)) alphabet += 8;
  if (/[^a-zA-Z0-9]/.test(password)) alphabet += 24;
  const bits = Math.floor(password.length * Math.log2(Math.max(1, alphabet)));
  return { score: Math.min(7, Math.floor(bits / 16)), label: 'Random password — length/variety estimate only' };
}
