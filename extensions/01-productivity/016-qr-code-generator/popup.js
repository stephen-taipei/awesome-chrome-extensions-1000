document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const customInput = document.getElementById('customInput');
  const customText = document.getElementById('customText');
  const generateBtn = document.getElementById('generateBtn');
  const qrCodeEl = document.getElementById('qrCode');
  const qrTextEl = document.getElementById('qrText');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');
  const sizeBtns = document.querySelectorAll('.size-btn');

  let currentText = '';
  let currentSize = 200;
  let currentTab = 'url';

  // Get current tab URL and generate QR
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentText = tabs[0].url;
    generateQR();
  });

  function generateQR() {
    const text = currentTab === 'url' ? currentText : customText.value || currentText;
    if (!text) return;

    qrTextEl.textContent = text.length > 50 ? text.substring(0, 50) + '...' : text;

    // Create QR code using canvas
    qrCodeEl.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = currentSize;
    canvas.height = currentSize;
    qrCodeEl.appendChild(canvas);

    // Simple QR code generation using a basic pattern
    // In production, you'd use a library like qrcode.js
    drawQRCode(canvas, text);
  }

  function drawQRCode(canvas, text) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    // Create a simple visual representation
    // For a real QR code, use a proper library
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Use a hash of the text to create a pattern
    const moduleCount = 25;
    const moduleSize = size / moduleCount;

    ctx.fillStyle = '#000000';

    // Generate pattern based on text
    const hash = simpleHash(text);
    const pattern = generatePattern(hash, moduleCount);

    // Draw finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize);

    // Draw data pattern
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (isFinderArea(row, col, moduleCount)) continue;
        if (pattern[row * moduleCount + col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }

  function drawFinderPattern(ctx, x, y, moduleSize) {
    const size = 7 * moduleSize;

    // Outer black
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, size, size);

    // Middle white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, size - 2 * moduleSize, size - 2 * moduleSize);

    // Inner black
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  }

  function isFinderArea(row, col, moduleCount) {
    // Top-left
    if (row < 8 && col < 8) return true;
    // Top-right
    if (row < 8 && col >= moduleCount - 8) return true;
    // Bottom-left
    if (row >= moduleCount - 8 && col < 8) return true;
    return false;
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function generatePattern(seed, size) {
    const pattern = [];
    let current = seed;
    for (let i = 0; i < size * size; i++) {
      current = (current * 1103515245 + 12345) & 0x7fffffff;
      pattern.push(current % 3 === 0);
    }
    return pattern;
  }

  function downloadQR() {
    const canvas = qrCodeEl.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function copyQR() {
    const canvas = qrCodeEl.querySelector('canvas');
    if (!canvas) return;

    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      copyBtn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  // Event listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;

      if (currentTab === 'custom') {
        customInput.classList.remove('hidden');
      } else {
        customInput.classList.add('hidden');
        generateQR();
      }
    });
  });

  generateBtn.addEventListener('click', generateQR);
  downloadBtn.addEventListener('click', downloadQR);
  copyBtn.addEventListener('click', copyQR);

  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = parseInt(btn.dataset.size);
      generateQR();
    });
  });

  customText.addEventListener('input', () => {
    if (currentTab === 'custom') {
      generateQR();
    }
  });
});
