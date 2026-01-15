document.addEventListener('DOMContentLoaded', () => {
  // Default word list
  const defaultWords = [
    { word: 'accommodate', definition: 'To provide space or lodging for' },
    { word: 'occurrence', definition: 'An incident or event' },
    { word: 'separate', definition: 'To divide or keep apart' },
    { word: 'necessary', definition: 'Required or essential' },
    { word: 'recommend', definition: 'To suggest as worthy of acceptance' },
    { word: 'conscience', definition: 'Inner sense of right and wrong' },
    { word: 'definitely', definition: 'Without any doubt' },
    { word: 'embarrass', definition: 'To cause discomfort or self-consciousness' },
    { word: 'maintenance', definition: 'The process of maintaining something' },
    { word: 'privilege', definition: 'A special right or advantage' },
    { word: 'rhythm', definition: 'A strong regular repeated pattern' },
    { word: 'schedule', definition: 'A plan for carrying out activities' }
  ];

  // DOM Elements
  const practiceView = document.getElementById('practiceView');
  const wordListView = document.getElementById('wordListView');
  const addWordView = document.getElementById('addWordView');
  const wordHint = document.getElementById('wordHint');
  const definitionHint = document.getElementById('definitionHint');
  const spellingInput = document.getElementById('spellingInput');
  const feedbackArea = document.getElementById('feedbackArea');
  const correctCount = document.getElementById('correctCount');
  const totalAttempts = document.getElementById('totalAttempts');
  const accuracy = document.getElementById('accuracy');
  const wordList = document.getElementById('wordList');

  // Buttons
  const speakBtn = document.getElementById('speakBtn');
  const checkBtn = document.getElementById('checkBtn');
  const newWordBtn = document.getElementById('newWordBtn');
  const skipBtn = document.getElementById('skipBtn');
  const showFirstLetter = document.getElementById('showFirstLetter');
  const showLength = document.getElementById('showLength');
  const showVowels = document.getElementById('showVowels');
  const manageWordsBtn = document.getElementById('manageWordsBtn');
  const backBtn = document.getElementById('backBtn');
  const addWordBtn = document.getElementById('addWordBtn');
  const cancelAddBtn = document.getElementById('cancelAddBtn');
  const saveWordBtn = document.getElementById('saveWordBtn');

  // State
  let words = [];
  let currentWord = null;
  let stats = { correct: 0, total: 0 };
  let hintsUsed = { firstLetter: false, length: false, vowels: false };

  // Load data
  function loadData() {
    chrome.storage.local.get(['spellingWords', 'spellingStats'], (result) => {
      words = result.spellingWords || defaultWords;
      stats = result.spellingStats || { correct: 0, total: 0 };
      updateStats();
    });
  }

  // Save words
  function saveWords() {
    chrome.storage.local.set({ spellingWords: words });
  }

  // Save stats
  function saveStats() {
    chrome.storage.local.set({ spellingStats: stats });
  }

  // Update stats display
  function updateStats() {
    correctCount.textContent = stats.correct;
    totalAttempts.textContent = stats.total;
    const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    accuracy.textContent = `${acc}%`;
  }

  // Get random word
  function getRandomWord() {
    if (words.length === 0) return null;
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }

  // Start new word
  function newWord() {
    currentWord = getRandomWord();
    if (!currentWord) {
      wordHint.textContent = 'Add some words first!';
      definitionHint.textContent = '';
      return;
    }

    hintsUsed = { firstLetter: false, length: false, vowels: false };
    wordHint.textContent = '_ '.repeat(currentWord.word.length).trim();
    definitionHint.textContent = `Hint: ${currentWord.definition}`;
    spellingInput.value = '';
    feedbackArea.textContent = '';
    feedbackArea.className = 'feedback-area';
    spellingInput.focus();
  }

  // Speak word
  function speakWord() {
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }

  // Check spelling
  function checkSpelling() {
    if (!currentWord) return;

    const input = spellingInput.value.trim().toLowerCase();
    const correct = currentWord.word.toLowerCase();

    stats.total++;

    if (input === correct) {
      stats.correct++;
      feedbackArea.className = 'feedback-area correct';
      feedbackArea.innerHTML = '✓ Correct! Well done!';
      setTimeout(newWord, 1500);
    } else {
      feedbackArea.className = 'feedback-area incorrect';
      feedbackArea.innerHTML = `✗ Incorrect. The correct spelling is: <span class="correct-spelling">${currentWord.word}</span>`;
    }

    updateStats();
    saveStats();
  }

  // Show first letter hint
  showFirstLetter.addEventListener('click', () => {
    if (!currentWord || hintsUsed.firstLetter) return;
    hintsUsed.firstLetter = true;
    const hint = currentWord.word[0].toUpperCase() + ' ' + '_ '.repeat(currentWord.word.length - 1).trim();
    wordHint.textContent = hint;
  });

  // Show word length hint
  showLength.addEventListener('click', () => {
    if (!currentWord || hintsUsed.length) return;
    hintsUsed.length = true;
    wordHint.textContent = `${currentWord.word.length} letters: ${wordHint.textContent}`;
  });

  // Show vowels hint
  showVowels.addEventListener('click', () => {
    if (!currentWord || hintsUsed.vowels) return;
    hintsUsed.vowels = true;
    const vowels = 'aeiouAEIOU';
    const hint = currentWord.word.split('').map(c =>
      vowels.includes(c) ? c : '_'
    ).join(' ');
    wordHint.textContent = hint;
  });

  // Event listeners
  speakBtn.addEventListener('click', speakWord);
  checkBtn.addEventListener('click', checkSpelling);
  newWordBtn.addEventListener('click', newWord);
  skipBtn.addEventListener('click', newWord);

  spellingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkSpelling();
  });

  // Manage words
  manageWordsBtn.addEventListener('click', () => {
    practiceView.style.display = 'none';
    wordListView.style.display = 'block';
    renderWordList();
  });

  backBtn.addEventListener('click', () => {
    wordListView.style.display = 'none';
    practiceView.style.display = 'block';
  });

  addWordBtn.addEventListener('click', () => {
    wordListView.style.display = 'none';
    addWordView.style.display = 'block';
  });

  cancelAddBtn.addEventListener('click', () => {
    addWordView.style.display = 'none';
    wordListView.style.display = 'block';
    document.getElementById('newWord').value = '';
    document.getElementById('newDefinition').value = '';
  });

  saveWordBtn.addEventListener('click', () => {
    const word = document.getElementById('newWord').value.trim();
    const definition = document.getElementById('newDefinition').value.trim();

    if (!word || !definition) {
      alert('Please enter both word and definition');
      return;
    }

    words.push({ word, definition });
    saveWords();
    document.getElementById('newWord').value = '';
    document.getElementById('newDefinition').value = '';
    addWordView.style.display = 'none';
    wordListView.style.display = 'block';
    renderWordList();
  });

  // Render word list
  function renderWordList() {
    wordList.innerHTML = '';
    words.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'word-item';
      div.innerHTML = `
        <div class="word-item-text">
          <div class="word-item-word">${item.word}</div>
          <div class="word-item-def">${item.definition}</div>
        </div>
        <button class="word-item-delete" data-index="${index}">&times;</button>
      `;
      wordList.appendChild(div);
    });

    wordList.querySelectorAll('.word-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        words.splice(index, 1);
        saveWords();
        renderWordList();
      });
    });
  }

  // Initialize
  loadData();
});
