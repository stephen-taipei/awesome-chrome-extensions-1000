document.addEventListener('DOMContentLoaded', () => {
  // Antonym pairs
  const antonymPairs = [
    ['happy', 'sad'], ['big', 'small'], ['fast', 'slow'], ['hot', 'cold'],
    ['light', 'dark'], ['old', 'young'], ['rich', 'poor'], ['strong', 'weak'],
    ['tall', 'short'], ['good', 'bad'], ['love', 'hate'], ['win', 'lose'],
    ['push', 'pull'], ['open', 'close'], ['up', 'down'], ['in', 'out'],
    ['before', 'after'], ['hard', 'soft'], ['loud', 'quiet'], ['clean', 'dirty'],
    ['wet', 'dry'], ['full', 'empty'], ['near', 'far'], ['high', 'low'],
    ['deep', 'shallow'], ['wide', 'narrow'], ['thick', 'thin'], ['rough', 'smooth'],
    ['sweet', 'sour'], ['fresh', 'stale'], ['brave', 'cowardly'], ['beautiful', 'ugly'],
    ['ancient', 'modern'], ['simple', 'complex'], ['generous', 'selfish']
  ];

  // DOM Elements
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const highScoreEl = document.getElementById('highScore');

  const menuView = document.getElementById('menuView');
  const matchView = document.getElementById('matchView');
  const quizView = document.getElementById('quizView');
  const timedView = document.getElementById('timedView');
  const resultView = document.getElementById('resultView');

  // State
  let score = 0;
  let highScore = 0;
  let timer = 30;
  let timerInterval = null;
  let currentMode = null;
  let selectedWord = null;
  let quizQuestion = 0;
  let matchedCount = 0;

  // Load high score
  chrome.storage.local.get(['antonymHighScore'], (result) => {
    highScore = result.antonymHighScore || 0;
    highScoreEl.textContent = highScore;
  });

  // Shuffle array
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      score = 0;
      updateScore();
      menuView.style.display = 'none';

      switch (currentMode) {
        case 'match':
          startMatchGame();
          break;
        case 'quiz':
          startQuizGame();
          break;
        case 'timed':
          startTimedGame();
          break;
      }
    });
  });

  // Match Game
  function startMatchGame() {
    matchView.style.display = 'block';
    matchedCount = 0;
    selectedWord = null;
    document.getElementById('matchProgress').textContent = '0';

    const pairs = shuffle(antonymPairs).slice(0, 5);
    const words = shuffle(pairs.map(p => p[0]));
    const antonyms = shuffle(pairs.map(p => p[1]));

    const wordsColumn = document.getElementById('wordsColumn');
    const antonymsColumn = document.getElementById('antonymsColumn');

    wordsColumn.innerHTML = '';
    antonymsColumn.innerHTML = '';

    words.forEach(word => {
      const div = document.createElement('div');
      div.className = 'match-item';
      div.textContent = word;
      div.dataset.word = word;
      div.dataset.antonym = pairs.find(p => p[0] === word)[1];
      div.addEventListener('click', () => handleMatchClick(div, 'word'));
      wordsColumn.appendChild(div);
    });

    antonyms.forEach(antonym => {
      const div = document.createElement('div');
      div.className = 'match-item';
      div.textContent = antonym;
      div.dataset.antonym = antonym;
      div.addEventListener('click', () => handleMatchClick(div, 'antonym'));
      antonymsColumn.appendChild(div);
    });
  }

  function handleMatchClick(element, type) {
    if (element.classList.contains('matched')) return;

    if (!selectedWord) {
      selectedWord = { element, type };
      element.classList.add('selected');
    } else {
      if (selectedWord.type === type) {
        selectedWord.element.classList.remove('selected');
        selectedWord = { element, type };
        element.classList.add('selected');
      } else {
        const word = type === 'word' ? element : selectedWord.element;
        const antonym = type === 'antonym' ? element : selectedWord.element;

        if (word.dataset.antonym === antonym.dataset.antonym) {
          word.classList.remove('selected');
          word.classList.add('matched');
          antonym.classList.add('matched');
          matchedCount++;
          score += 20;
          updateScore();
          document.getElementById('matchProgress').textContent = matchedCount;

          if (matchedCount === 5) {
            setTimeout(() => showResults(), 500);
          }
        } else {
          element.classList.add('wrong');
          selectedWord.element.classList.add('wrong');
          setTimeout(() => {
            element.classList.remove('wrong');
            selectedWord.element.classList.remove('wrong', 'selected');
            selectedWord = null;
          }, 500);
          return;
        }
        selectedWord = null;
      }
    }
  }

  // Quiz Game
  function startQuizGame() {
    quizView.style.display = 'block';
    quizQuestion = 0;
    showQuizQuestion();
  }

  function showQuizQuestion() {
    if (quizQuestion >= 10) {
      showResults();
      return;
    }

    document.getElementById('quizNum').textContent = quizQuestion + 1;
    document.getElementById('quizFeedback').style.display = 'none';

    const pair = antonymPairs[Math.floor(Math.random() * antonymPairs.length)];
    const word = pair[0];
    const correct = pair[1];

    const wrongs = shuffle(antonymPairs.filter(p => p[1] !== correct).map(p => p[1])).slice(0, 3);
    const options = shuffle([correct, ...wrongs]);

    document.getElementById('quizWord').textContent = word;

    const optionsEl = document.getElementById('quizOptions');
    optionsEl.innerHTML = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleQuizAnswer(btn, opt === correct, correct));
      optionsEl.appendChild(btn);
    });
  }

  function handleQuizAnswer(btn, isCorrect, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.classList.add('disabled');
      opt.style.pointerEvents = 'none';
      if (opt.textContent === correct) {
        opt.classList.add('correct');
      }
    });

    const feedback = document.getElementById('quizFeedback');
    if (isCorrect) {
      score += 10;
      updateScore();
      feedback.className = 'quiz-feedback correct';
      feedback.textContent = 'Correct!';
    } else {
      btn.classList.add('wrong');
      feedback.className = 'quiz-feedback wrong';
      feedback.textContent = `Wrong! The answer is: ${correct}`;
    }
    feedback.style.display = 'block';

    quizQuestion++;
    setTimeout(showQuizQuestion, 1500);
  }

  // Timed Game
  function startTimedGame() {
    timedView.style.display = 'block';
    timer = 30;
    timerEl.textContent = timer;

    timerInterval = setInterval(() => {
      timer--;
      timerEl.textContent = timer;
      if (timer <= 0) {
        clearInterval(timerInterval);
        showResults();
      }
    }, 1000);

    showTimedQuestion();
  }

  function showTimedQuestion() {
    const pair = antonymPairs[Math.floor(Math.random() * antonymPairs.length)];
    const word = pair[0];
    const correct = pair[1];

    const wrongs = shuffle(antonymPairs.filter(p => p[1] !== correct).map(p => p[1])).slice(0, 3);
    const options = shuffle([correct, ...wrongs]);

    document.getElementById('timedWord').textContent = word;

    const optionsEl = document.getElementById('timedOptions');
    optionsEl.innerHTML = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'timed-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (opt === correct) {
          score += 10;
          updateScore();
        }
        showTimedQuestion();
      });
      optionsEl.appendChild(btn);
    });
  }

  // Show Results
  function showResults() {
    if (timerInterval) clearInterval(timerInterval);

    matchView.style.display = 'none';
    quizView.style.display = 'none';
    timedView.style.display = 'none';
    resultView.style.display = 'block';

    document.getElementById('finalScore').textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      chrome.storage.local.set({ antonymHighScore: highScore });
      document.getElementById('resultTitle').textContent = 'New High Score!';
      document.getElementById('resultIcon').textContent = '🏆';
    } else if (score >= 80) {
      document.getElementById('resultTitle').textContent = 'Excellent!';
      document.getElementById('resultIcon').textContent = '🌟';
    } else {
      document.getElementById('resultTitle').textContent = 'Good Try!';
      document.getElementById('resultIcon').textContent = '👍';
    }
  }

  // Update score
  function updateScore() {
    scoreEl.textContent = score;
  }

  // Back buttons
  document.getElementById('matchBackBtn').addEventListener('click', backToMenu);
  document.getElementById('quizBackBtn').addEventListener('click', backToMenu);
  document.getElementById('timedBackBtn').addEventListener('click', backToMenu);
  document.getElementById('menuBtn').addEventListener('click', backToMenu);

  document.getElementById('playAgainBtn').addEventListener('click', () => {
    resultView.style.display = 'none';
    score = 0;
    updateScore();
    document.querySelectorAll('.mode-btn').forEach(btn => {
      if (btn.dataset.mode === currentMode) btn.click();
    });
  });

  function backToMenu() {
    if (timerInterval) clearInterval(timerInterval);
    matchView.style.display = 'none';
    quizView.style.display = 'none';
    timedView.style.display = 'none';
    resultView.style.display = 'none';
    menuView.style.display = 'block';
    timer = 30;
    timerEl.textContent = timer;
  }
});
