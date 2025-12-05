document.addEventListener('DOMContentLoaded', () => {
  const captureVisible = document.getElementById('capture-visible');
  const captureFull = document.getElementById('capture-full');
  const captureArea = document.getElementById('capture-area');
  const previewSection = document.getElementById('preview-section');
  const previewImage = document.getElementById('preview-image');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityValue = document.getElementById('quality-value');

  let currentScreenshot = null;

  // Capture visible area
  captureVisible.addEventListener('click', () => {
    captureVisible.textContent = 'Capturing...';
    chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE' }, (response) => {
      captureVisible.innerHTML = '<span class="btn-icon">🖼️</span><span>Visible Area</span>';
      if (response.success) {
        currentScreenshot = response.dataUrl;
        showPreview(response.dataUrl);
      }
    });
  });

  // Full page capture (simulated)
  captureFull.addEventListener('click', () => {
    captureFull.textContent = 'Capturing...';
    chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE' }, (response) => {
      captureFull.innerHTML = '<span class="btn-icon">📜</span><span>Full Page</span>';
      if (response.success) {
        currentScreenshot = response.dataUrl;
        showPreview(response.dataUrl);
      }
    });
  });

  // Area selection (simulated)
  captureArea.addEventListener('click', () => {
    alert('Area selection mode - click and drag on the page');
    window.close();
  });

  function showPreview(dataUrl) {
    previewImage.src = dataUrl;
    previewSection.style.display = 'block';
  }

  // Download
  document.getElementById('download-btn').addEventListener('click', () => {
    if (currentScreenshot) {
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_SCREENSHOT',
        dataUrl: currentScreenshot,
        saveAs: true
      });
    }
  });

  // Copy to clipboard
  document.getElementById('copy-btn').addEventListener('click', async () => {
    if (currentScreenshot) {
      try {
        const response = await fetch(currentScreenshot);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        document.getElementById('copy-btn').textContent = '✓ Copied';
        setTimeout(() => {
          document.getElementById('copy-btn').textContent = '📋 Copy';
        }, 1500);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  });

  // Quality slider
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
    chrome.storage.local.set({ quality: parseInt(qualitySlider.value) });
  });

  // Load settings
  chrome.storage.local.get(['format', 'quality'], (data) => {
    document.getElementById('format-select').value = data.format || 'png';
    qualitySlider.value = data.quality || 90;
    qualityValue.textContent = `${qualitySlider.value}%`;
  });

  // Save format
  document.getElementById('format-select').addEventListener('change', (e) => {
    chrome.storage.local.set({ format: e.target.value });
  });
});
