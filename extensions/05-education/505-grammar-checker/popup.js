document.addEventListener('DOMContentLoaded', () => {
  // Grammar rules
  const grammarRules = [
    {
      pattern: /\btheir\s+(is|are|was|were)\b/gi,
      type: 'error',
      message: 'Possible confusion with "there"',
      suggestion: 'Use "there" for location or existence'
    },
    {
      pattern: /\bthere\s+(car|house|book|dog|cat|friend|mom|dad|work)\b/gi,
      type: 'error',
      message: 'Possible confusion with "their"',
      suggestion: 'Use "their" for possession'
    },
    {
      pattern: /\byour\s+(a|an|the)\s/gi,
      type: 'error',
      message: 'Possible confusion with "you\'re"',
      suggestion: 'Check if you mean "you\'re" (you are)'
    },
    {
      pattern: /\bits\s+(a|an|the|very|really)\b/gi,
      type: 'warning',
      message: 'Check "its" vs "it\'s"',
      suggestion: '"It\'s" = "it is", "its" = possessive'
    },
    {
      pattern: /\beffect\s+(me|you|him|her|them|us)\b/gi,
      type: 'error',
      message: 'Possible confusion with "affect"',
      suggestion: 'Use "affect" as a verb (to influence)'
    },
    {
      pattern: /\balot\b/gi,
      type: 'error',
      message: '"alot" is not a word',
      suggestion: 'Use "a lot" (two words)'
    },
    {
      pattern: /\bcould of\b|\bshould of\b|\bwould of\b/gi,
      type: 'error',
      message: 'Incorrect phrase',
      suggestion: 'Use "could have", "should have", or "would have"'
    },
    {
      pattern: /\bdefinate(ly)?\b/gi,
      type: 'error',
      message: 'Spelling error',
      suggestion: 'Correct spelling is "definite" or "definitely"'
    },
    {
      pattern: /\bseperate\b/gi,
      type: 'error',
      message: 'Spelling error',
      suggestion: 'Correct spelling is "separate"'
    },
    {
      pattern: /\boccur(r)?ance\b/gi,
      type: 'error',
      message: 'Spelling error',
      suggestion: 'Correct spelling is "occurrence"'
    },
    {
      pattern: /\bvery\s+unique\b/gi,
      type: 'warning',
      message: 'Redundant modifier',
      suggestion: '"Unique" already means one of a kind - no modifier needed'
    },
    {
      pattern: /\bpast\s+history\b/gi,
      type: 'warning',
      message: 'Redundant phrase',
      suggestion: 'History is always past. Just use "history"'
    },
    {
      pattern: /\bat\s+this\s+point\s+in\s+time\b/gi,
      type: 'info',
      message: 'Wordy phrase',
      suggestion: 'Consider using "now" or "currently"'
    },
    {
      pattern: /\bin\s+order\s+to\b/gi,
      type: 'info',
      message: 'Wordy phrase',
      suggestion: 'Consider just using "to"'
    },
    {
      pattern: /\bi\s/g,
      type: 'error',
      message: '"I" should be capitalized',
      suggestion: 'Always capitalize the pronoun "I"'
    },
    {
      pattern: /\s{2,}/g,
      type: 'info',
      message: 'Multiple spaces detected',
      suggestion: 'Use single spaces between words'
    },
    {
      pattern: /[.!?]\s*[a-z]/g,
      type: 'warning',
      message: 'Lowercase letter after sentence end',
      suggestion: 'Capitalize the first letter of each sentence'
    }
  ];

  // DOM Elements
  const textInput = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const checkBtn = document.getElementById('checkBtn');
  const resultsSection = document.getElementById('resultsSection');
  const issueCount = document.getElementById('issueCount');
  const issuesList = document.getElementById('issuesList');
  const noIssues = document.getElementById('noIssues');
  const clearBtn = document.getElementById('clearBtn');
  const tipTabs = document.querySelectorAll('.tip-tab');
  const tipContents = document.querySelectorAll('.tip-content');

  // Update character count
  textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
  });

  // Check grammar
  checkBtn.addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) return;

    const issues = [];

    grammarRules.forEach(rule => {
      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          text: match[0],
          index: match.index,
          type: rule.type,
          message: rule.message,
          suggestion: rule.suggestion
        });
      }
    });

    displayResults(issues);
  });

  // Display results
  function displayResults(issues) {
    resultsSection.style.display = 'block';
    issueCount.textContent = issues.length;

    if (issues.length === 0) {
      issuesList.style.display = 'none';
      noIssues.style.display = 'block';
    } else {
      issuesList.style.display = 'block';
      noIssues.style.display = 'none';

      issuesList.innerHTML = '';
      issues.forEach(issue => {
        const div = document.createElement('div');
        div.className = `issue-item ${issue.type}`;
        div.innerHTML = `
          <div class="issue-type">${issue.type}</div>
          <div class="issue-text">Found: <mark>${escapeHtml(issue.text)}</mark></div>
          <div class="issue-message">${issue.message}</div>
          <div class="issue-suggestion"><strong>Tip:</strong> ${issue.suggestion}</div>
        `;
        issuesList.appendChild(div);
      });
    }
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Clear results
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    charCount.textContent = '0';
    resultsSection.style.display = 'none';
  });

  // Tip tabs
  tipTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tipTabs.forEach(t => t.classList.remove('active'));
      tipContents.forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
      });

      tab.classList.add('active');
      const tabId = tab.dataset.tab + 'Tab';
      document.getElementById(tabId).style.display = 'block';
      document.getElementById(tabId).classList.add('active');
    });
  });
});
