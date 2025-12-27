// Speed Reader - Popup Script

class SpeedReader {
  constructor() {
    this.words = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.wpm = 300;
    this.intervalId = null;
    this.initElements();
    this.bindEvents();
    this.loadSettings();
  }

  initElements() {
    this.wordBefore = document.getElementById('wordBefore');
    this.wordFocus = document.getElementById('wordFocus');
    this.wordAfter = document.getElementById('wordAfter');
    this.progressBar = document.getElementById('progressBar');
    this.prevBtn = document.getElementById('prevBtn');
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.speedSlider = document.getElementById('speedSlider');
    this.wpmDisplay = document.getElementById('wpmDisplay');
    this.textInput = document.getElementById('textInput');
    this.loadBtn = document.getElementById('loadBtn');
    this.wordCountEl = document.getElementById('wordCount');
    this.timeEstimateEl = document.getElementById('timeEstimate');
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    this.nextBtn.addEventListener('click', () => this.next());
    this.speedSlider.addEventListener('input', () => this.updateSpeed());
    this.loadBtn.addEventListener('click', () => this.loadText());
    this.textInput.addEventListener('input', () => this.updateStats());
  }

  async loadSettings() {
    const result = await chrome.storage.local.get('speedReaderSettings');
    if (result.speedReaderSettings) {
      this.wpm = result.speedReaderSettings.wpm || 300;
      this.speedSlider.value = this.wpm;
      this.wpmDisplay.textContent = `${this.wpm} WPM`;
    }
  }

  async saveSettings() {
    await chrome.storage.local.set({
      speedReaderSettings: { wpm: this.wpm }
    });
  }

  updateSpeed() {
    this.wpm = parseInt(this.speedSlider.value);
    this.wpmDisplay.textContent = `${this.wpm} WPM`;
    this.saveSettings();
    this.updateStats();

    // Restart interval if playing
    if (this.isPlaying) {
      this.stopInterval();
      this.startInterval();
    }
  }

  loadText() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.loadBtn.textContent = '請輸入文字';
      setTimeout(() => {
        this.loadBtn.textContent = '載入文字';
      }, 1500);
      return;
    }

    // Split into words
    this.words = text.split(/\s+/).filter(word => word.length > 0);
    this.currentIndex = 0;

    this.loadBtn.textContent = '已載入 ✓';
    setTimeout(() => {
      this.loadBtn.textContent = '載入文字';
    }, 1500);

    this.displayWord();
    this.updateProgress();
    this.updateStats();
  }

  displayWord() {
    if (this.words.length === 0) {
      this.wordBefore.textContent = '';
      this.wordFocus.textContent = '準備開始';
      this.wordAfter.textContent = '';
      return;
    }

    const word = this.words[this.currentIndex] || '';

    // Find optimal recognition point (ORP)
    // Usually around 1/3 into the word
    const orpIndex = Math.floor(word.length / 3);

    this.wordBefore.textContent = word.substring(0, orpIndex);
    this.wordFocus.textContent = word.charAt(orpIndex) || '';
    this.wordAfter.textContent = word.substring(orpIndex + 1);
  }

  updateProgress() {
    if (this.words.length === 0) {
      this.progressBar.style.width = '0%';
      return;
    }
    const progress = ((this.currentIndex + 1) / this.words.length) * 100;
    this.progressBar.style.width = `${progress}%`;
  }

  updateStats() {
    const text = this.textInput.value.trim();
    const wordCount = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    const minutes = Math.ceil(wordCount / this.wpm);

    this.wordCountEl.textContent = `${wordCount} 字`;
    this.timeEstimateEl.textContent = `約 ${minutes} 分鐘`;
  }

  togglePlay() {
    if (this.words.length === 0) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.words.length === 0) return;

    // Reset if at end
    if (this.currentIndex >= this.words.length - 1) {
      this.currentIndex = 0;
    }

    this.isPlaying = true;
    this.playPauseBtn.textContent = '⏸';
    this.startInterval();
  }

  pause() {
    this.isPlaying = false;
    this.playPauseBtn.textContent = '▶';
    this.stopInterval();
  }

  startInterval() {
    const interval = 60000 / this.wpm; // ms per word
    this.intervalId = setInterval(() => {
      this.next();
      if (this.currentIndex >= this.words.length - 1) {
        this.pause();
      }
    }, interval);
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.displayWord();
      this.updateProgress();
    }
  }

  next() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.displayWord();
      this.updateProgress();
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new SpeedReader();
});
