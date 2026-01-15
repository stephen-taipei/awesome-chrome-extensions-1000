document.addEventListener('DOMContentLoaded', () => {
  // Sentence database
  const sentences = {
    easy: [
      { sentence: 'The cat sits on the mat.', hint: 'Subject + verb + preposition + article + noun' },
      { sentence: 'I like to eat apples.', hint: 'Start with the pronoun' },
      { sentence: 'She runs very fast.', hint: 'Subject + verb + adverb' },
      { sentence: 'The dog is happy today.', hint: 'Article + subject + verb + adjective' },
      { sentence: 'We go to school together.', hint: 'We + action verb + preposition' },
      { sentence: 'Birds fly in the sky.', hint: 'Subject + verb + preposition phrase' },
      { sentence: 'He reads a good book.', hint: 'Subject + verb + article + adjective + noun' },
      { sentence: 'The sun is very bright.', hint: 'Article + noun + linking verb + adjective' }
    ],
    medium: [
      { sentence: 'The children are playing in the garden.', hint: 'Article + subject + progressive verb + location' },
      { sentence: 'She has been studying all day.', hint: 'Subject + perfect progressive verb' },
      { sentence: 'My brother will arrive tomorrow morning.', hint: 'Possessive + noun + future verb + time' },
      { sentence: 'The movie was really interesting and exciting.', hint: 'Subject + past verb + compound adjectives' },
      { sentence: 'They have finished their homework already.', hint: 'Subject + perfect verb + object + adverb' },
      { sentence: 'The teacher explained the lesson very clearly.', hint: 'Subject + verb + object + adverb phrase' },
      { sentence: 'I would like to visit Paris someday.', hint: 'Subject + conditional + infinitive + object' }
    ],
    hard: [
      { sentence: 'Although it was raining, we decided to go outside.', hint: 'Subordinate clause + main clause' },
      { sentence: 'The book that she recommended was absolutely fascinating.', hint: 'Subject + relative clause + verb + adverb + adjective' },
      { sentence: 'Having finished the project, they celebrated their success.', hint: 'Participial phrase + subject + verb + object' },
      { sentence: 'Not only did he win, but he also broke the record.', hint: 'Correlative conjunctions with inverted structure' },
      { sentence: 'By the time we arrived, the concert had already started.', hint: 'Time clause + subject + past perfect verb' },
      { sentence: 'The scientist whose discovery changed everything received an award.', hint: 'Subject + whose clause + verb + object' }
    ]
  };

  // DOM Elements
  const sentenceZone = document.getElementById('sentenceZone');
  const wordBank = document.getElementById('wordBank');
  const feedback = document.getElementById('feedback');
  const hintText = document.getElementById('hintText');
  const currentScoreEl = document.getElementById('currentScore');
  const levelEl = document.getElementById('level');
  const streakEl = document.getElementById('streak');

  // Buttons
  const checkBtn = document.getElementById('checkBtn');
  const clearBtn = document.getElementById('clearBtn');
  const newSentenceBtn = document.getElementById('newSentenceBtn');
  const hintBtn = document.getElementById('hintBtn');
  const diffBtns = document.querySelectorAll('.diff-btn');

  // State
  let currentSentence = null;
  let selectedWords = [];
  let difficulty = 'easy';
  let score = 0;
  let level = 1;
  let streak = 0;

  // Load state
  chrome.storage.local.get(['sentenceBuilderState'], (result) => {
    if (result.sentenceBuilderState) {
      score = result.sentenceBuilderState.score || 0;
      level = result.sentenceBuilderState.level || 1;
      streak = result.sentenceBuilderState.streak || 0;
      updateScore();
    }
    loadNewSentence();
  });

  // Save state
  function saveState() {
    chrome.storage.local.set({
      sentenceBuilderState: { score, level, streak }
    });
  }

  // Shuffle array
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Load new sentence
  function loadNewSentence() {
    const sentenceList = sentences[difficulty];
    currentSentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];
    selectedWords = [];

    // Parse words (keep punctuation attached)
    const words = currentSentence.sentence.match(/[\w']+|[.,!?;]/g) || [];
    const shuffledWords = shuffle(words);

    // Render word bank
    wordBank.innerHTML = '';
    shuffledWords.forEach((word, index) => {
      const tile = document.createElement('div');
      tile.className = 'word-tile';
      tile.textContent = word;
      tile.dataset.index = index;
      tile.dataset.word = word;
      tile.addEventListener('click', () => selectWord(tile));
      wordBank.appendChild(tile);
    });

    // Reset sentence zone
    sentenceZone.innerHTML = '<span class="placeholder">Click words below to build your sentence</span>';
    feedback.style.display = 'none';
    hintText.style.display = 'none';
  }

  // Select word
  function selectWord(tile) {
    if (tile.classList.contains('disabled')) return;

    const word = tile.dataset.word;

    if (tile.classList.contains('in-sentence')) {
      // Remove from sentence
      tile.classList.remove('in-sentence');
      tile.classList.remove('disabled');
      selectedWords = selectedWords.filter(w => w !== word);
    } else {
      // Add to sentence
      tile.classList.add('in-sentence');
      tile.classList.add('disabled');
      selectedWords.push(word);
    }

    renderSentence();
  }

  // Render current sentence
  function renderSentence() {
    if (selectedWords.length === 0) {
      sentenceZone.innerHTML = '<span class="placeholder">Click words below to build your sentence</span>';
    } else {
      sentenceZone.innerHTML = '';
      selectedWords.forEach((word, index) => {
        const tile = document.createElement('div');
        tile.className = 'word-tile in-sentence';
        tile.textContent = word;
        tile.addEventListener('click', () => removeFromSentence(index));
        sentenceZone.appendChild(tile);
      });
    }
  }

  // Remove word from sentence
  function removeFromSentence(index) {
    const word = selectedWords[index];
    selectedWords.splice(index, 1);

    // Re-enable in word bank
    wordBank.querySelectorAll('.word-tile').forEach(tile => {
      if (tile.dataset.word === word && tile.classList.contains('disabled')) {
        tile.classList.remove('in-sentence');
        tile.classList.remove('disabled');
      }
    });

    renderSentence();
  }

  // Check answer
  checkBtn.addEventListener('click', () => {
    if (selectedWords.length === 0) return;

    // Build user sentence
    let userSentence = '';
    selectedWords.forEach((word, index) => {
      if (/[.,!?;]/.test(word)) {
        userSentence += word;
      } else {
        userSentence += (index > 0 && !/[.,!?;]/.test(selectedWords[index - 1]) ? ' ' : '') + word;
      }
    });

    // Compare
    const correct = currentSentence.sentence;
    const isCorrect = userSentence.trim().toLowerCase() === correct.toLowerCase();

    if (isCorrect) {
      feedback.className = 'feedback correct';
      feedback.textContent = 'Correct! Well done!';
      score += difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      streak++;
      if (streak > 0 && streak % 5 === 0) {
        level++;
      }
      setTimeout(loadNewSentence, 1500);
    } else {
      feedback.className = 'feedback incorrect';
      feedback.innerHTML = `Not quite. The correct sentence is:<br><strong>${correct}</strong>`;
      streak = 0;
    }

    feedback.style.display = 'block';
    updateScore();
    saveState();
  });

  // Clear sentence
  clearBtn.addEventListener('click', () => {
    selectedWords = [];
    wordBank.querySelectorAll('.word-tile').forEach(tile => {
      tile.classList.remove('in-sentence');
      tile.classList.remove('disabled');
    });
    renderSentence();
    feedback.style.display = 'none';
  });

  // New sentence
  newSentenceBtn.addEventListener('click', loadNewSentence);

  // Show hint
  hintBtn.addEventListener('click', () => {
    hintText.textContent = currentSentence.hint;
    hintText.style.display = hintText.style.display === 'none' ? 'block' : 'none';
  });

  // Difficulty selection
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      difficulty = btn.dataset.level;
      loadNewSentence();
    });
  });

  // Update score display
  function updateScore() {
    currentScoreEl.textContent = score;
    levelEl.textContent = level;
    streakEl.textContent = streak;
  }
});
