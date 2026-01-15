document.addEventListener('DOMContentLoaded', () => {
  const regexPattern = document.getElementById('regexPattern');
  const regexFlags = document.getElementById('regexFlags');
  const regexError = document.getElementById('regexError');
  const testString = document.getElementById('testString');
  const matchCount = document.getElementById('matchCount');
  const highlightedResult = document.getElementById('highlightedResult');
  const matchesList = document.getElementById('matchesList');
  const historyList = document.getElementById('historyList');

  let history = [];

  // Load history
  function loadHistory() {
    chrome.storage.local.get(['regexHistory'], (result) => {
      history = result.regexHistory || [];
      renderHistory();
    });
  }

  // Save to history
  function saveToHistory(pattern, flags) {
    if (!pattern) return;

    const entry = `/${pattern}/${flags}`;
    history = history.filter(h => h !== entry);
    history.unshift(entry);
    history = history.slice(0, 10);

    chrome.storage.local.set({ regexHistory: history }, renderHistory);
  }

  // Render history
  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No recent patterns</div>';
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="history-item" data-pattern="${escapeHtml(item)}">${escapeHtml(item)}</div>
    `).join('');

    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const pattern = item.dataset.pattern;
        const match = pattern.match(/^\/(.*)\/([gimsuy]*)$/);
        if (match) {
          regexPattern.value = match[1];
          regexFlags.value = match[2];
          testRegex();
        }
      });
    });
  }

  // Test regex
  function testRegex() {
    const pattern = regexPattern.value;
    const flags = regexFlags.value;
    const text = testString.value;

    regexError.textContent = '';
    highlightedResult.innerHTML = '';
    matchesList.innerHTML = '';

    if (!pattern) {
      matchCount.textContent = '0 matches';
      highlightedResult.textContent = text;
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;
      let highlighted = text;
      let offset = 0;

      if (flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });

          // Prevent infinite loop for empty matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(text);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      // Update match count
      matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

      // Highlight matches
      if (matches.length > 0) {
        let result = '';
        let lastIndex = 0;

        matches.forEach(m => {
          result += escapeHtml(text.slice(lastIndex, m.index));
          result += `<span class="match">${escapeHtml(m.value)}</span>`;
          lastIndex = m.index + m.value.length;
        });
        result += escapeHtml(text.slice(lastIndex));
        highlightedResult.innerHTML = result;

        // Show matches list
        matchesList.innerHTML = matches.map((m, i) => `
          <div class="match-item">
            <span class="match-value">${escapeHtml(m.value)}</span>
            <span class="match-index">index: ${m.index}</span>
          </div>
        `).join('');
      } else {
        highlightedResult.textContent = text;
      }

    } catch (e) {
      regexError.textContent = e.message;
      matchCount.textContent = '0 matches';
      highlightedResult.textContent = text;
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Event listeners
  regexPattern.addEventListener('input', testRegex);
  regexFlags.addEventListener('input', testRegex);
  testString.addEventListener('input', testRegex);

  regexPattern.addEventListener('blur', () => {
    saveToHistory(regexPattern.value, regexFlags.value);
  });

  // Quick patterns
  document.querySelectorAll('.patterns-grid button').forEach(btn => {
    btn.addEventListener('click', () => {
      regexPattern.value = btn.dataset.pattern;
      regexFlags.value = btn.dataset.flags;
      testRegex();
    });
  });

  // Initialize
  loadHistory();
});
