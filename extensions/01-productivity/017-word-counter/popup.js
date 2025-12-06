document.addEventListener('DOMContentLoaded', () => {
  const sourceBtns = document.querySelectorAll('.source-btn');
  const wordCountEl = document.getElementById('wordCount');
  const charCountEl = document.getElementById('charCount');
  const charNoSpaceCountEl = document.getElementById('charNoSpaceCount');
  const sentenceCountEl = document.getElementById('sentenceCount');
  const paragraphCountEl = document.getElementById('paragraphCount');
  const readingTimeEl = document.getElementById('readingTime');
  const textPreviewEl = document.getElementById('textPreview');
  const refreshBtn = document.getElementById('refreshBtn');

  let currentSource = 'selection';

  // Initial count
  countText();

  function countText() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getTextFromPage,
        args: [currentSource]
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const text = results[0].result;
          updateStats(text);
        } else {
          updateStats('');
        }
      });
    });
  }

  function updateStats(text) {
    if (!text || text.trim().length === 0) {
      wordCountEl.textContent = '0';
      charCountEl.textContent = '0';
      charNoSpaceCountEl.textContent = '0';
      sentenceCountEl.textContent = '0';
      paragraphCountEl.textContent = '0';
      readingTimeEl.textContent = '0';
      textPreviewEl.textContent = currentSource === 'selection'
        ? 'Select text on the page first'
        : 'No text found on page';
      textPreviewEl.classList.add('empty');
      return;
    }

    textPreviewEl.classList.remove('empty');

    // Word count
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    wordCountEl.textContent = formatNumber(words.length);

    // Character count
    charCountEl.textContent = formatNumber(text.length);

    // Characters without spaces
    charNoSpaceCountEl.textContent = formatNumber(text.replace(/\s/g, '').length);

    // Sentence count
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentenceCountEl.textContent = formatNumber(sentences.length);

    // Paragraph count
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    paragraphCountEl.textContent = formatNumber(paragraphs.length || 1);

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words.length / 200);
    readingTimeEl.textContent = readingTime;

    // Preview
    const preview = text.length > 150 ? text.substring(0, 150) + '...' : text;
    textPreviewEl.textContent = preview;
  }

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Event listeners
  sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSource = btn.dataset.source;
      countText();
    });
  });

  refreshBtn.addEventListener('click', countText);
});

// Function to inject into page
function getTextFromPage(source) {
  if (source === 'selection') {
    return window.getSelection().toString();
  } else {
    // Get page text content
    const body = document.body;
    const clone = body.cloneNode(true);

    // Remove script and style elements
    const scripts = clone.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());

    return clone.textContent || clone.innerText;
  }
}
