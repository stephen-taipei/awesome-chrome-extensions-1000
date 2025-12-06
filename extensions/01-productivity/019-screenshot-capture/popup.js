document.addEventListener('DOMContentLoaded', () => {
  const captureVisibleBtn = document.getElementById('captureVisible');
  const previewSection = document.getElementById('previewSection');
  const previewImage = document.getElementById('previewImage');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');
  const formatBtns = document.querySelectorAll('.format-btn');
  const historyList = document.getElementById('historyList');

  let currentScreenshot = null;
  let format = 'png';
  let history = [];

  // Load history
  chrome.storage.local.get(['screenshotHistory'], (result) => {
    history = result.screenshotHistory || [];
    renderHistory();
  });

  function captureVisibleArea() {
    chrome.tabs.captureVisibleTab(null, { format: format }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      currentScreenshot = dataUrl;
      previewImage.src = dataUrl;
      previewSection.classList.remove('hidden');

      // Add to history
      history.unshift({
        dataUrl: dataUrl,
        timestamp: Date.now()
      });
      history = history.slice(0, 10); // Keep only 10
      chrome.storage.local.set({ screenshotHistory: history });
      renderHistory();
    });
  }

  function downloadScreenshot() {
    if (!currentScreenshot) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.${format}`;

    const link = document.createElement('a');
    link.href = currentScreenshot;
    link.download = filename;
    link.click();
  }

  async function copyScreenshot() {
    if (!currentScreenshot) return;

    try {
      const response = await fetch(currentScreenshot);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);

      copyBtn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy';
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-history">No screenshots yet</div>';
      return;
    }

    historyList.innerHTML = history.map((item, index) => `
      <div class="history-item" data-index="${index}">
        <img src="${item.dataUrl}" alt="Screenshot ${index + 1}">
      </div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        currentScreenshot = history[index].dataUrl;
        previewImage.src = currentScreenshot;
        previewSection.classList.remove('hidden');
      });
    });
  }

  // Event listeners
  captureVisibleBtn.addEventListener('click', captureVisibleArea);
  downloadBtn.addEventListener('click', downloadScreenshot);
  copyBtn.addEventListener('click', copyScreenshot);

  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      format = btn.dataset.format;
    });
  });
});
