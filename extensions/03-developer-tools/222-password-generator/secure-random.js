/* Canonical source; copied into each extension package by repair_legacy.py. */
(() => {
  'use strict';
  function index(limit) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 0x100000000) {
      throw new RangeError('Invalid random range.');
    }
    const cutoff = 0x100000000 - (0x100000000 % limit);
    const buffer = new Uint32Array(1);
    do {
      crypto.getRandomValues(buffer);
    } while (buffer[0] >= cutoff);
    return buffer[0] % limit;
  }
  function password(length, groups) {
    if (!Number.isInteger(length) || length < 8 || length > 128) {
      throw new RangeError('Choose a password length between 8 and 128.');
    }
    if (!Array.isArray(groups) || !groups.length || groups.some(group => typeof group !== 'string' || !group.length)) {
      throw new TypeError('Select at least one character type.');
    }
    const alphabet = [...new Set(groups.join(''))];
    // Rejection sampling: every accepted string is drawn from the same distribution.
    for (let attempt = 0; attempt < 1000; attempt++) {
      let value = '';
      for (let i = 0; i < length; i++) value += alphabet[index(alphabet.length)];
      if (groups.every(group => [...value].some(char => group.includes(char)))) return value;
    }
    throw new Error('Unable to satisfy the selected character types. Please retry.');
  }
  globalThis.SecureRandom = Object.freeze({ index, password });
})();
