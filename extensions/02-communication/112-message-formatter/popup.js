// Message Formatter - Popup Script

const CHAR_MAPS = {
  bold: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D5D4 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D5EE + i);
      return acc;
    }, {})
  },
  italic: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D608 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D622 + i);
      return acc;
    }, {})
  },
  bolditalic: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D63C + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D656 + i);
      return acc;
    }, {})
  },
  script: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D4D0 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D4EA + i);
      return acc;
    }, {})
  },
  fraktur: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D504 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D51E + i);
      return acc;
    }, {})
  },
  double: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D538 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D552 + i);
      return acc;
    }, {})
  },
  mono: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D670 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1D68A + i);
      return acc;
    }, {})
  },
  circled: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x24B6 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x24D0 + i);
      return acc;
    }, {})
  },
  squared: {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1F130 + i);
      return acc;
    }, {}),
    lower: 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, c, i) => {
      acc[c] = String.fromCodePoint(0x1F130 + i);
      return acc;
    }, {})
  }
};

const FLIP_MAP = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
  'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
  'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
  'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': 'q', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ',
  'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
  'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ɹ', 'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ',
  'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '?': '¿', '!': '¡'
};

class MessageFormatter {
  constructor() {
    this.currentStyle = null;
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.inputEl = document.getElementById('inputText');
    this.outputEl = document.getElementById('outputText');
    this.copyBtn = document.getElementById('copyBtn');
    this.styleBtns = document.querySelectorAll('.style-btn');
  }

  bindEvents() {
    this.styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.styleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentStyle = btn.dataset.style;
        this.format();
      });
    });

    this.inputEl.addEventListener('input', () => {
      if (this.currentStyle) {
        this.format();
      }
    });

    this.copyBtn.addEventListener('click', () => this.copy());
  }

  format() {
    const text = this.inputEl.value;
    let result = '';

    switch (this.currentStyle) {
      case 'flip':
        result = this.flipText(text);
        break;
      case 'mirror':
        result = text.split('').reverse().join('');
        break;
      case 'strikethrough':
        result = text.split('').map(c => c + '\u0336').join('');
        break;
      default:
        result = this.applyCharMap(text, this.currentStyle);
    }

    this.outputEl.textContent = result;
  }

  applyCharMap(text, style) {
    const map = CHAR_MAPS[style];
    if (!map) return text;

    return text.split('').map(c => {
      if (map.upper[c]) return map.upper[c];
      if (map.lower[c]) return map.lower[c];
      return c;
    }).join('');
  }

  flipText(text) {
    return text.split('').map(c => FLIP_MAP[c] || c).reverse().join('');
  }

  async copy() {
    const text = this.outputEl.textContent;
    if (!text) return;

    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new MessageFormatter());
