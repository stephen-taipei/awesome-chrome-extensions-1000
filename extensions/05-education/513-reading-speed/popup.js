document.addEventListener('DOMContentLoaded', () => {
  // Reading passages database
  const passages = {
    easy: [
      {
        text: "The sun was shining bright. Birds sang in the trees. A small dog ran across the green grass. Children played in the park. They were having a great time. The ice cream man came by. Everyone got a cold treat. It was a perfect summer day.",
        questions: [
          { q: "What was shining bright?", options: ["The moon", "The sun", "A lamp", "A star"], answer: 1 },
          { q: "Where did the children play?", options: ["At school", "At home", "In the park", "On the beach"], answer: 2 },
          { q: "What did everyone get?", options: ["Candy", "A toy", "Ice cream", "Water"], answer: 2 }
        ]
      },
      {
        text: "Tom has a pet cat named Whiskers. Whiskers is orange with white spots. She likes to sleep on the sofa. Every morning, Tom feeds her breakfast. Whiskers loves to chase toys. At night, she sleeps at the foot of Tom's bed. They are best friends.",
        questions: [
          { q: "What is the cat's name?", options: ["Fluffy", "Whiskers", "Tiger", "Spots"], answer: 1 },
          { q: "What color is the cat?", options: ["Black", "Gray", "Orange with white spots", "Brown"], answer: 2 },
          { q: "Where does Whiskers sleep at night?", options: ["On the sofa", "In a basket", "At the foot of Tom's bed", "Outside"], answer: 2 }
        ]
      }
    ],
    medium: [
      {
        text: "Climate change is one of the most pressing issues of our time. Rising global temperatures are causing ice caps to melt and sea levels to rise. Many scientists believe that human activities, particularly the burning of fossil fuels, are the primary cause. To address this challenge, countries around the world are working to reduce carbon emissions and develop renewable energy sources. Individual actions, such as reducing energy consumption and recycling, can also make a difference.",
        questions: [
          { q: "What is causing sea levels to rise?", options: ["Earthquakes", "Melting ice caps", "Volcanic activity", "Ocean currents"], answer: 1 },
          { q: "What do scientists believe is the primary cause?", options: ["Natural cycles", "Volcanic activity", "Human activities", "Solar changes"], answer: 2 },
          { q: "What are countries doing to address climate change?", options: ["Building more factories", "Reducing carbon emissions", "Increasing oil production", "Nothing"], answer: 1 }
        ]
      }
    ],
    hard: [
      {
        text: "The philosophical concept of consciousness has puzzled thinkers for millennia. From Descartes' famous declaration 'I think, therefore I am' to modern neuroscience investigations, the nature of subjective experience remains enigmatic. Contemporary theories range from materialist perspectives, which view consciousness as an emergent property of neural activity, to dualist frameworks that posit a fundamental separation between mind and body. Recent advances in brain imaging technology have provided unprecedented insights into the neural correlates of conscious experience, yet the 'hard problem' of explaining why physical processes give rise to subjective experience continues to challenge researchers across multiple disciplines.",
        questions: [
          { q: "Who made the declaration 'I think, therefore I am'?", options: ["Plato", "Aristotle", "Descartes", "Kant"], answer: 2 },
          { q: "What do materialist perspectives view consciousness as?", options: ["A spiritual phenomenon", "An emergent property of neural activity", "A separate entity from the brain", "An illusion"], answer: 1 },
          { q: "What is referred to as the 'hard problem'?", options: ["Brain imaging", "Neural correlates", "Why physical processes create subjective experience", "Understanding dualism"], answer: 2 }
        ]
      }
    ]
  };

  // DOM Elements
  const menuView = document.getElementById('menuView');
  const testView = document.getElementById('testView');
  const questionView = document.getElementById('questionView');
  const resultView = document.getElementById('resultView');

  const avgWPM = document.getElementById('avgWPM');
  const bestWPM = document.getElementById('bestWPM');
  const testsCompleted = document.getElementById('testsCompleted');

  const diffBtns = document.querySelectorAll('.diff-btn');
  const startTestBtn = document.getElementById('startTestBtn');
  const startReadingBtn = document.getElementById('startReadingBtn');
  const doneReadingBtn = document.getElementById('doneReadingBtn');
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  const backMenuBtn = document.getElementById('backMenuBtn');

  const timerDisplay = document.getElementById('timerDisplay');
  const wordCount = document.getElementById('wordCount');
  const readingText = document.getElementById('readingText');
  const testStatus = document.getElementById('testStatus');

  // State
  let difficulty = 'easy';
  let currentPassage = null;
  let startTime = null;
  let timerInterval = null;
  let elapsedSeconds = 0;
  let currentQuestion = 0;
  let correctAnswers = 0;
  let stats = { tests: 0, totalWPM: 0, bestWPM: 0 };

  // Load stats
  chrome.storage.local.get(['readingSpeedStats'], (result) => {
    stats = result.readingSpeedStats || { tests: 0, totalWPM: 0, bestWPM: 0 };
    updateStats();
  });

  // Save stats
  function saveStats() {
    chrome.storage.local.set({ readingSpeedStats: stats });
  }

  // Update stats display
  function updateStats() {
    const avg = stats.tests > 0 ? Math.round(stats.totalWPM / stats.tests) : 0;
    avgWPM.textContent = avg;
    bestWPM.textContent = stats.bestWPM;
    testsCompleted.textContent = stats.tests;
  }

  // Format time
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Count words
  function countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  // Difficulty selection
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      difficulty = btn.dataset.level;
    });
  });

  // Start test
  startTestBtn.addEventListener('click', () => {
    const passageList = passages[difficulty];
    currentPassage = passageList[Math.floor(Math.random() * passageList.length)];

    readingText.textContent = currentPassage.text;
    wordCount.textContent = countWords(currentPassage.text);
    timerDisplay.textContent = '0:00';
    elapsedSeconds = 0;

    menuView.style.display = 'none';
    testView.style.display = 'block';
    startReadingBtn.style.display = 'block';
    doneReadingBtn.style.display = 'none';
    testStatus.textContent = 'Click "Start" when ready, then "Done" when finished reading';
  });

  // Start reading
  startReadingBtn.addEventListener('click', () => {
    startTime = Date.now();
    startReadingBtn.style.display = 'none';
    doneReadingBtn.style.display = 'block';
    testStatus.textContent = 'Reading... Click "Done" when finished';

    timerInterval = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      timerDisplay.textContent = formatTime(elapsedSeconds);
    }, 1000);
  });

  // Done reading
  doneReadingBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentQuestion = 0;
    correctAnswers = 0;
    testView.style.display = 'none';
    questionView.style.display = 'block';
    showQuestion();
  });

  // Show question
  function showQuestion() {
    const q = currentPassage.questions[currentQuestion];
    document.getElementById('questionText').textContent = q.q;
    document.getElementById('questionNum').textContent = currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = currentPassage.questions.length;

    const optionsEl = document.getElementById('questionOptions');
    optionsEl.innerHTML = '';

    q.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'question-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(index, q.answer));
      optionsEl.appendChild(btn);
    });
  }

  // Handle answer
  function handleAnswer(selected, correct) {
    const options = document.querySelectorAll('.question-option');
    options.forEach((opt, index) => {
      opt.classList.add('disabled');
      opt.style.pointerEvents = 'none';
      if (index === correct) opt.classList.add('correct');
      if (index === selected && selected !== correct) opt.classList.add('wrong');
    });

    if (selected === correct) correctAnswers++;

    currentQuestion++;
    setTimeout(() => {
      if (currentQuestion < currentPassage.questions.length) {
        showQuestion();
      } else {
        showResults();
      }
    }, 1000);
  }

  // Show results
  function showResults() {
    const words = countWords(currentPassage.text);
    const minutes = elapsedSeconds / 60;
    const wpm = Math.round(words / minutes);
    const comprehension = Math.round((correctAnswers / currentPassage.questions.length) * 100);

    // Update stats
    stats.tests++;
    stats.totalWPM += wpm;
    if (wpm > stats.bestWPM) stats.bestWPM = wpm;
    saveStats();
    updateStats();

    document.getElementById('resultWPM').textContent = wpm;
    document.getElementById('resultTime').textContent = formatTime(elapsedSeconds);
    document.getElementById('resultComprehension').textContent = comprehension + '%';

    let message = '';
    if (wpm >= 300) message = 'Excellent! You read faster than average!';
    else if (wpm >= 200) message = 'Good job! You have a solid reading speed.';
    else if (wpm >= 150) message = 'Average speed. Keep practicing to improve!';
    else message = 'Take your time to build comprehension first.';

    document.getElementById('resultMessage').textContent = message;

    questionView.style.display = 'none';
    resultView.style.display = 'block';
  }

  // Try again
  tryAgainBtn.addEventListener('click', () => {
    resultView.style.display = 'none';
    startTestBtn.click();
  });

  // Back to menu
  backMenuBtn.addEventListener('click', () => {
    resultView.style.display = 'none';
    menuView.style.display = 'block';
  });
});
