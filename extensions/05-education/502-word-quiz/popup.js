document.addEventListener('DOMContentLoaded', () => {
  // Word database
  const wordDatabase = {
    easy: [
      { word: 'Happy', definition: 'Feeling pleasure or joy', wrong: ['Feeling sad', 'Feeling angry', 'Feeling tired'] },
      { word: 'Brave', definition: 'Ready to face danger', wrong: ['Feeling scared', 'Being lazy', 'Acting silly'] },
      { word: 'Quick', definition: 'Moving fast', wrong: ['Moving slowly', 'Standing still', 'Being quiet'] },
      { word: 'Large', definition: 'Big in size', wrong: ['Small in size', 'Medium weight', 'Round shape'] },
      { word: 'Bright', definition: 'Giving out much light', wrong: ['Very dark', 'Slightly warm', 'Making noise'] },
      { word: 'Silent', definition: 'Making no sound', wrong: ['Very loud', 'Quite smelly', 'Extremely hot'] },
      { word: 'Ancient', definition: 'Very old', wrong: ['Brand new', 'Slightly used', 'Recently made'] },
      { word: 'Clever', definition: 'Quick to understand', wrong: ['Slow to learn', 'Unable to hear', 'Hard to see'] },
      { word: 'Gentle', definition: 'Mild and kind', wrong: ['Harsh and mean', 'Loud and rough', 'Fast and wild'] },
      { word: 'Honest', definition: 'Telling the truth', wrong: ['Telling lies', 'Keeping secrets', 'Making jokes'] }
    ],
    medium: [
      { word: 'Abundant', definition: 'Existing in large quantities', wrong: ['Extremely rare', 'Slightly visible', 'Partially complete'] },
      { word: 'Cautious', definition: 'Careful to avoid danger', wrong: ['Taking many risks', 'Moving quickly', 'Speaking loudly'] },
      { word: 'Diligent', definition: 'Hardworking and careful', wrong: ['Lazy and careless', 'Quick and messy', 'Loud and rude'] },
      { word: 'Eloquent', definition: 'Fluent and persuasive in speech', wrong: ['Unable to speak clearly', 'Prone to mumbling', 'Speaking very quietly'] },
      { word: 'Fragile', definition: 'Easily broken or damaged', wrong: ['Very strong', 'Extremely heavy', 'Quite flexible'] },
      { word: 'Genuine', definition: 'Truly what it is said to be', wrong: ['Completely fake', 'Partially broken', 'Recently copied'] },
      { word: 'Humble', definition: 'Having a modest view of oneself', wrong: ['Extremely proud', 'Very wealthy', 'Quite famous'] },
      { word: 'Immense', definition: 'Extremely large or great', wrong: ['Incredibly tiny', 'Slightly warm', 'Moderately priced'] },
      { word: 'Jubilant', definition: 'Feeling great happiness', wrong: ['Extremely sad', 'Very angry', 'Quite confused'] },
      { word: 'Keen', definition: 'Having sharp senses', wrong: ['Unable to see well', 'Lacking interest', 'Feeling sleepy'] }
    ],
    hard: [
      { word: 'Ephemeral', definition: 'Lasting for a very short time', wrong: ['Permanent and lasting', 'Growing slowly', 'Extremely heavy'] },
      { word: 'Ubiquitous', definition: 'Present everywhere', wrong: ['Extremely rare', 'Only in one place', 'Invisible to all'] },
      { word: 'Sycophant', definition: 'A person who flatters for gain', wrong: ['A strict critic', 'An honest friend', 'A skilled artist'] },
      { word: 'Perspicacious', definition: 'Having keen mental perception', wrong: ['Lacking understanding', 'Unable to focus', 'Easily confused'] },
      { word: 'Obfuscate', definition: 'To make unclear or confusing', wrong: ['To clarify completely', 'To illuminate brightly', 'To explain simply'] },
      { word: 'Magnanimous', definition: 'Very generous or forgiving', wrong: ['Extremely petty', 'Quite stingy', 'Very vengeful'] },
      { word: 'Languid', definition: 'Lacking energy or vitality', wrong: ['Full of energy', 'Extremely active', 'Highly motivated'] },
      { word: 'Insidious', definition: 'Proceeding harmfully but subtly', wrong: ['Openly beneficial', 'Obviously helpful', 'Clearly positive'] },
      { word: 'Fastidious', definition: 'Very attentive to detail', wrong: ['Extremely careless', 'Quite sloppy', 'Very messy'] },
      { word: 'Cacophony', definition: 'A harsh mixture of sounds', wrong: ['A pleasant melody', 'Complete silence', 'A soft whisper'] }
    ]
  };

  // DOM Elements
  const startView = document.getElementById('startView');
  const quizView = document.getElementById('quizView');
  const resultView = document.getElementById('resultView');
  const currentScoreEl = document.getElementById('currentScore');
  const streakEl = document.getElementById('streak');
  const highScoreEl = document.getElementById('highScore');
  const progressFill = document.getElementById('progressFill');
  const questionNum = document.getElementById('questionNum');
  const totalQuestions = document.getElementById('totalQuestions');
  const questionWord = document.getElementById('questionWord');
  const optionsEl = document.getElementById('options');
  const feedback = document.getElementById('feedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackText = document.getElementById('feedbackText');
  const nextQuestion = document.getElementById('nextQuestion');
  const finalScore = document.getElementById('finalScore');
  const finalTotal = document.getElementById('finalTotal');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultMessage = document.getElementById('resultMessage');

  // Buttons
  const diffBtns = document.querySelectorAll('.diff-btn');
  const startQuiz = document.getElementById('startQuiz');
  const playAgain = document.getElementById('playAgain');
  const backToMenu = document.getElementById('backToMenu');

  // State
  let difficulty = 'easy';
  let questions = [];
  let currentQuestion = 0;
  let score = 0;
  let streak = 0;
  let highScore = 0;
  const questionsPerQuiz = 10;

  // Load high score
  chrome.storage.local.get(['wordQuizHighScore'], (result) => {
    highScore = result.wordQuizHighScore || 0;
    highScoreEl.textContent = highScore;
  });

  // Difficulty selection
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      difficulty = btn.dataset.level;
    });
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

  // Generate quiz questions
  function generateQuestions() {
    const words = shuffle(wordDatabase[difficulty]);
    questions = words.slice(0, questionsPerQuiz).map(item => {
      const options = shuffle([item.definition, ...item.wrong]);
      return {
        word: item.word,
        correct: item.definition,
        options: options
      };
    });
  }

  // Start quiz
  startQuiz.addEventListener('click', () => {
    generateQuestions();
    currentQuestion = 0;
    score = 0;
    streak = 0;
    updateScore();
    startView.style.display = 'none';
    quizView.style.display = 'block';
    resultView.style.display = 'none';
    showQuestion();
  });

  // Show question
  function showQuestion() {
    const q = questions[currentQuestion];
    questionWord.textContent = q.word;
    questionNum.textContent = currentQuestion + 1;
    totalQuestions.textContent = questionsPerQuiz;
    progressFill.style.width = `${((currentQuestion) / questionsPerQuiz) * 100}%`;

    const optionBtns = optionsEl.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
      btn.textContent = q.options[index];
      btn.className = 'option-btn';
      btn.disabled = false;
    });

    feedback.style.display = 'none';
    nextQuestion.style.display = 'none';
  }

  // Handle option click
  optionsEl.addEventListener('click', (e) => {
    if (!e.target.classList.contains('option-btn') || e.target.disabled) return;

    const selected = e.target.textContent;
    const correct = questions[currentQuestion].correct;
    const isCorrect = selected === correct;

    // Disable all options
    optionsEl.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.add('disabled');
      btn.disabled = true;
      if (btn.textContent === correct) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      score++;
      streak++;
      e.target.classList.add('correct');
      feedback.className = 'feedback correct';
      feedbackIcon.textContent = '✓';
      feedbackText.textContent = 'Correct!';
    } else {
      streak = 0;
      e.target.classList.add('incorrect');
      feedback.className = 'feedback incorrect';
      feedbackIcon.textContent = '✗';
      feedbackText.textContent = `Wrong! The answer is: ${correct}`;
    }

    updateScore();
    feedback.style.display = 'flex';
    nextQuestion.style.display = 'block';
  });

  // Next question
  nextQuestion.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion >= questionsPerQuiz) {
      showResults();
    } else {
      showQuestion();
    }
  });

  // Update score display
  function updateScore() {
    currentScoreEl.textContent = score;
    streakEl.textContent = streak;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      chrome.storage.local.set({ wordQuizHighScore: highScore });
    }
  }

  // Show results
  function showResults() {
    quizView.style.display = 'none';
    resultView.style.display = 'block';

    finalScore.textContent = score;
    finalTotal.textContent = questionsPerQuiz;

    const percentage = (score / questionsPerQuiz) * 100;

    if (percentage >= 90) {
      resultIcon.textContent = '🏆';
      resultTitle.textContent = 'Excellent!';
    } else if (percentage >= 70) {
      resultIcon.textContent = '🌟';
      resultTitle.textContent = 'Great Job!';
    } else if (percentage >= 50) {
      resultIcon.textContent = '👍';
      resultTitle.textContent = 'Good Effort!';
    } else {
      resultIcon.textContent = '📚';
      resultTitle.textContent = 'Keep Learning!';
    }

    resultMessage.textContent = `You got ${percentage}% correct!`;
  }

  // Play again
  playAgain.addEventListener('click', () => {
    startQuiz.click();
  });

  // Back to menu
  backToMenu.addEventListener('click', () => {
    resultView.style.display = 'none';
    startView.style.display = 'block';
  });
});
