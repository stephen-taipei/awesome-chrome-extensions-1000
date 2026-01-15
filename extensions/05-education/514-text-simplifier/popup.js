document.addEventListener('DOMContentLoaded', () => {
  // Word simplification dictionary
  const simplifications = {
    light: {
      'utilize': 'use',
      'implement': 'do',
      'facilitate': 'help',
      'subsequently': 'then',
      'approximately': 'about',
      'sufficient': 'enough',
      'numerous': 'many'
    },
    medium: {
      'utilize': 'use',
      'implement': 'do',
      'facilitate': 'help',
      'subsequently': 'then',
      'approximately': 'about',
      'sufficient': 'enough',
      'numerous': 'many',
      'commence': 'start',
      'terminate': 'end',
      'endeavor': 'try',
      'ascertain': 'find out',
      'cognizant': 'aware',
      'elucidate': 'explain',
      'peruse': 'read',
      'procure': 'get',
      'remuneration': 'pay',
      'aforementioned': 'mentioned',
      'notwithstanding': 'despite',
      'nevertheless': 'but',
      'henceforth': 'from now on',
      'heretofore': 'until now'
    },
    heavy: {
      'utilize': 'use',
      'implement': 'do',
      'facilitate': 'help',
      'subsequently': 'then',
      'approximately': 'about',
      'sufficient': 'enough',
      'numerous': 'many',
      'commence': 'start',
      'terminate': 'end',
      'endeavor': 'try',
      'ascertain': 'find out',
      'cognizant': 'aware',
      'elucidate': 'explain',
      'peruse': 'read',
      'procure': 'get',
      'remuneration': 'pay',
      'aforementioned': 'mentioned',
      'notwithstanding': 'despite',
      'nevertheless': 'but',
      'henceforth': 'from now on',
      'heretofore': 'until now',
      'ameliorate': 'improve',
      'disseminate': 'spread',
      'promulgate': 'announce',
      'obviate': 'prevent',
      'predicated': 'based',
      'paradigm': 'model',
      'synergy': 'teamwork',
      'leverage': 'use',
      'robust': 'strong',
      'optimize': 'improve',
      'streamline': 'simplify',
      'incentivize': 'encourage',
      'prioritize': 'rank',
      'conceptualize': 'imagine',
      'operationalize': 'make work',
      'methodology': 'method',
      'functionality': 'features'
    }
  };

  // DOM Elements
  const inputText = document.getElementById('inputText');
  const charCount = document.getElementById('charCount');
  const wordCount = document.getElementById('wordCount');
  const levelBtns = document.querySelectorAll('.level-btn');
  const simplifyBtn = document.getElementById('simplifyBtn');
  const outputSection = document.getElementById('outputSection');
  const outputText = document.getElementById('outputText');
  const copyBtn = document.getElementById('copyBtn');
  const originalGrade = document.getElementById('originalGrade');
  const simplifiedGrade = document.getElementById('simplifiedGrade');
  const wordsSimplified = document.getElementById('wordsSimplified');
  const reduction = document.getElementById('reduction');
  const changesList = document.getElementById('changesList');

  // State
  let level = 'medium';

  // Update counts
  inputText.addEventListener('input', () => {
    const text = inputText.value;
    charCount.textContent = text.length;
    wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
  });

  // Level selection
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      level = btn.dataset.level;
    });
  });

  // Calculate reading grade level (simplified Flesch-Kincaid)
  function calculateGradeLevel(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
    const words = text.trim().split(/\s+/).length;
    const syllables = countSyllables(text);

    const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return Math.max(1, Math.min(16, Math.round(grade)));
  }

  // Count syllables (approximation)
  function countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length <= 3) {
        count += 1;
      } else {
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        count += matches ? matches.length : 1;
      }
    });

    return count;
  }

  // Simplify text
  function simplifyText(text) {
    const dict = simplifications[level];
    const changes = [];
    let simplified = text;

    Object.keys(dict).forEach(complex => {
      const simple = dict[complex];
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');

      if (regex.test(simplified)) {
        changes.push({ original: complex, replacement: simple });
        simplified = simplified.replace(regex, (match) => {
          // Preserve capitalization
          if (match[0] === match[0].toUpperCase()) {
            return simple.charAt(0).toUpperCase() + simple.slice(1);
          }
          return simple;
        });
      }
    });

    // Break long sentences (for medium and heavy)
    if (level !== 'light') {
      simplified = simplified.replace(/,\s*(and|but|or|so)\s+/gi, '. $1 ');
    }

    return { simplified, changes };
  }

  // Simplify button handler
  simplifyBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) {
      alert('Please enter some text to simplify');
      return;
    }

    const origGrade = calculateGradeLevel(text);
    const { simplified, changes } = simplifyText(text);
    const simpGrade = calculateGradeLevel(simplified);

    outputText.textContent = simplified;
    originalGrade.textContent = `Grade ${origGrade}`;
    simplifiedGrade.textContent = `Grade ${simpGrade}`;
    wordsSimplified.textContent = changes.length;

    const origWords = text.split(/\s+/).length;
    const simpWords = simplified.split(/\s+/).length;
    const reductionPct = Math.round(((origWords - simpWords) / origWords) * 100);
    reduction.textContent = reductionPct >= 0 ? `${reductionPct}%` : `+${Math.abs(reductionPct)}%`;

    // Display changes
    changesList.innerHTML = '';
    changes.forEach(change => {
      const div = document.createElement('div');
      div.className = 'change-item';
      div.innerHTML = `
        <span class="change-original">${change.original}</span>
        <span class="change-arrow">→</span>
        <span class="change-new">${change.replacement}</span>
      `;
      changesList.appendChild(div);
    });

    if (changes.length === 0) {
      changesList.innerHTML = '<span style="color:#888;font-size:12px;">No complex words found to simplify</span>';
    }

    outputSection.style.display = 'block';
  });

  // Copy button
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(outputText.textContent).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1500);
    });
  });
});
