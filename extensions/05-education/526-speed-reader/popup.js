document.addEventListener('DOMContentLoaded', () => {
  const wordDisplay = document.getElementById('wordDisplay');
  const progressFill = document.getElementById('progressFill');
  const loadTextBtn = document.getElementById('loadTextBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const wpmSlider = document.getElementById('wpmSlider');
  const wpmValue = document.getElementById('wpmValue');
  const chunkSize = document.getElementById('chunkSize');
  const wordCount = document.getElementById('wordCount');
  const estTime = document.getElementById('estTime');
  const progressPct = document.getElementById('progressPct');

  let words = [];
  let currentIndex = 0;
  let isPlaying = false;
  let intervalId = null;
  let wpm = 300;

  chrome.storage.local.get(['speedReaderWpm'], (result) => {
    if (result.speedReaderWpm) {
      wpm = result.speedReaderWpm;
      wpmSlider.value = wpm;
      wpmValue.textContent = wpm;
    }
  });

  loadTextBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const text = results[0].result;
        words = text.split(/\s+/).filter(w => w.length > 0);
        currentIndex = 0;
        updateStats();
        updateDisplay();
      } else {
        wordDisplay.textContent = 'No text selected';
      }
    });
  });

  playPauseBtn.addEventListener('click', () => {
    if (words.length === 0) return;

    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
      startReading();
    } else {
      stopReading();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (words.length === 0) return;
    const chunk = parseInt(chunkSize.value);
    currentIndex = Math.max(0, currentIndex - chunk * 2);
    updateDisplay();
  });

  nextBtn.addEventListener('click', () => {
    if (words.length === 0) return;
    const chunk = parseInt(chunkSize.value);
    currentIndex = Math.min(words.length - chunk, currentIndex + chunk);
    updateDisplay();
  });

  wpmSlider.addEventListener('input', () => {
    wpm = parseInt(wpmSlider.value);
    wpmValue.textContent = wpm;
    chrome.storage.local.set({ speedReaderWpm: wpm });
    updateStats();

    if (isPlaying) {
      stopReading();
      startReading();
    }
  });

  chunkSize.addEventListener('change', () => {
    updateStats();
    if (isPlaying) {
      stopReading();
      startReading();
    }
  });

  function startReading() {
    const chunk = parseInt(chunkSize.value);
    const interval = (60 / wpm) * 1000 * chunk;

    intervalId = setInterval(() => {
      if (currentIndex >= words.length) {
        stopReading();
        isPlaying = false;
        playPauseBtn.textContent = '▶';
        return;
      }
      updateDisplay();
      currentIndex += chunk;
    }, interval);
  }

  function stopReading() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function updateDisplay() {
    if (words.length === 0) {
      wordDisplay.textContent = 'Select text to start';
      return;
    }

    const chunk = parseInt(chunkSize.value);
    const displayWords = words.slice(currentIndex, currentIndex + chunk).join(' ');
    wordDisplay.textContent = displayWords || 'Done!';

    const progress = (currentIndex / words.length) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
    progressPct.textContent = `${Math.round(progress)}%`;
  }

  function updateStats() {
    wordCount.textContent = words.length;

    const minutes = words.length / wpm;
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    estTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
});
