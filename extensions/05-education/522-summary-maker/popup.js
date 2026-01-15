document.addEventListener('DOMContentLoaded', () => {
  const summaryLength = document.getElementById('summaryLength');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summaryResult = document.getElementById('summaryResult');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const savedList = document.getElementById('savedList');

  let currentSummary = '';

  loadSavedSummaries();

  summarizeBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const text = results[0].result;
        currentSummary = generateSummary(text, summaryLength.value);
        summaryResult.innerHTML = `<p>${escapeHtml(currentSummary)}</p>`;
        copyBtn.disabled = false;
        saveBtn.disabled = false;
      } else {
        summaryResult.innerHTML = '<p class="placeholder">No text selected</p>';
      }
    });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentSummary);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Summary', 2000);
  });

  saveBtn.addEventListener('click', () => {
    if (!currentSummary) return;

    chrome.storage.local.get(['summaries'], (result) => {
      const summaries = result.summaries || [];
      summaries.unshift({
        id: Date.now(),
        text: currentSummary,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ summaries }, loadSavedSummaries);
    });
  });

  function generateSummary(text, length) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let numSentences;

    switch (length) {
      case 'short':
        numSentences = Math.min(2, sentences.length);
        break;
      case 'medium':
        numSentences = Math.min(4, sentences.length);
        break;
      case 'long':
        numSentences = Math.min(6, sentences.length);
        break;
      default:
        numSentences = Math.min(4, sentences.length);
    }

    const importantSentences = sentences
      .map((s, i) => ({ text: s.trim(), index: i, score: scoreSentence(s, i, sentences.length) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index)
      .map(s => s.text);

    return importantSentences.join(' ');
  }

  function scoreSentence(sentence, index, total) {
    let score = 0;
    if (index === 0) score += 3;
    if (index === total - 1) score += 2;
    if (sentence.length > 50 && sentence.length < 200) score += 2;
    const keyWords = ['important', 'key', 'main', 'significant', 'essential', 'critical'];
    keyWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) score += 1;
    });
    return score;
  }

  function loadSavedSummaries() {
    chrome.storage.local.get(['summaries'], (result) => {
      const summaries = result.summaries || [];

      if (summaries.length === 0) {
        savedList.innerHTML = '<p class="empty-message">No summaries saved</p>';
        return;
      }

      savedList.innerHTML = summaries.slice(0, 10).map(s => `
        <div class="saved-item">
          <button class="delete-btn" data-id="${s.id}">&times;</button>
          <div class="text">${escapeHtml(s.text.substring(0, 100))}...</div>
          <div class="meta">${new Date(s.date).toLocaleDateString()}</div>
        </div>
      `).join('');

      savedList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSummary(parseInt(btn.dataset.id)));
      });
    });
  }

  function deleteSummary(id) {
    chrome.storage.local.get(['summaries'], (result) => {
      const summaries = (result.summaries || []).filter(s => s.id !== id);
      chrome.storage.local.set({ summaries }, loadSavedSummaries);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
