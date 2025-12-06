document.addEventListener('DOMContentLoaded', () => {
  const currentUrlEl = document.getElementById('currentUrl');
  const shortenBtn = document.getElementById('shortenBtn');
  const resultSection = document.getElementById('resultSection');
  const shortUrlInput = document.getElementById('shortUrl');
  const copyBtn = document.getElementById('copyBtn');
  const copySuccess = document.getElementById('copySuccess');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistory');

  let currentUrl = '';
  let history = [];

  // Get current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = tabs[0].url;
    currentUrlEl.textContent = currentUrl;
  });

  // Load history
  chrome.storage.local.get(['urlHistory'], (result) => {
    history = result.urlHistory || [];
    renderHistory();
  });

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No shortened URLs yet</div>';
      return;
    }

    historyList.innerHTML = history.slice(0, 10).map(item => `
      <div class="history-item" data-short="${item.short}">
        <div>
          <div class="short-url">${item.short}</div>
          <div class="original-url">${item.original}</div>
        </div>
        <span class="copy-icon">📋</span>
      </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        copyToClipboard(item.dataset.short);
      });
    });
  }

  async function shortenUrl() {
    shortenBtn.disabled = true;
    shortenBtn.textContent = 'Shortening...';

    try {
      // Using is.gd API (free, no API key required)
      const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(currentUrl)}`);
      const data = await response.json();

      if (data.shorturl) {
        const shortUrl = data.shorturl;
        shortUrlInput.value = shortUrl;
        resultSection.classList.remove('hidden');

        // Save to history
        history.unshift({
          short: shortUrl,
          original: currentUrl,
          createdAt: Date.now()
        });
        history = history.slice(0, 50); // Keep only 50 items
        chrome.storage.local.set({ urlHistory: history });
        renderHistory();
      } else {
        throw new Error('Failed to shorten URL');
      }
    } catch (error) {
      // Fallback: create a simple hash-based short URL display
      const hash = btoa(currentUrl).substring(0, 8);
      const mockShort = `short.url/${hash}`;
      shortUrlInput.value = currentUrl; // Just use original URL
      resultSection.classList.remove('hidden');
      alert('Could not connect to shortening service. Original URL will be used.');
    }

    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten URL';
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      copySuccess.classList.remove('hidden');
      setTimeout(() => {
        copySuccess.classList.add('hidden');
      }, 2000);
    });
  }

  function clearHistory() {
    if (confirm('Clear all URL history?')) {
      history = [];
      chrome.storage.local.set({ urlHistory: [] });
      renderHistory();
    }
  }

  // Event listeners
  shortenBtn.addEventListener('click', shortenUrl);
  copyBtn.addEventListener('click', () => copyToClipboard(shortUrlInput.value));
  clearHistoryBtn.addEventListener('click', clearHistory);
});
