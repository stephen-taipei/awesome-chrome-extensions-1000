document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const quizName = document.getElementById('quizName');
  const questionText = document.getElementById('questionText');
  const optionA = document.getElementById('optionA');
  const optionB = document.getElementById('optionB');
  const optionC = document.getElementById('optionC');
  const optionD = document.getElementById('optionD');
  const correctAnswer = document.getElementById('correctAnswer');
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const questionsList = document.getElementById('questionsList');
  const saveQuizBtn = document.getElementById('saveQuizBtn');

  const selectQuiz = document.getElementById('selectQuiz');
  const startQuizBtn = document.getElementById('startQuizBtn');
  const quizArea = document.getElementById('quizArea');
  const questionNumber = document.getElementById('questionNumber');
  const currentQuestion = document.getElementById('currentQuestion');
  const optionsArea = document.getElementById('optionsArea');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const resultsArea = document.getElementById('resultsArea');
  const finalScore = document.getElementById('finalScore');
  const totalQuestions = document.getElementById('totalQuestions');
  const scorePercent = document.getElementById('scorePercent');
  const retakeBtn = document.getElementById('retakeBtn');

  const historyList = document.getElementById('historyList');

  let currentQuestions = [];
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedAnswer = null;
  let currentQuizName = '';

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
      if (btn.dataset.tab === 'quiz') loadQuizList();
      if (btn.dataset.tab === 'history') loadHistory();
    });
  });

  addQuestionBtn.addEventListener('click', () => {
    const question = questionText.value.trim();
    const options = {
      A: optionA.value.trim(),
      B: optionB.value.trim(),
      C: optionC.value.trim(),
      D: optionD.value.trim()
    };
    const correct = correctAnswer.value;

    if (!question || !options.A || !options.B || !correct) {
      alert('Please fill in question, at least 2 options, and correct answer');
      return;
    }

    currentQuestions.push({
      id: Date.now(),
      question,
      options,
      correct
    });

    questionText.value = '';
    optionA.value = '';
    optionB.value = '';
    optionC.value = '';
    optionD.value = '';
    correctAnswer.value = '';

    updateQuestionsList();
  });

  saveQuizBtn.addEventListener('click', () => {
    const name = quizName.value.trim();
    if (!name) {
      alert('Please enter a quiz name');
      return;
    }

    chrome.storage.local.get(['quizzes'], (result) => {
      const quizzes = result.quizzes || {};
      quizzes[name] = currentQuestions;
      chrome.storage.local.set({ quizzes }, () => {
        currentQuestions = [];
        quizName.value = '';
        updateQuestionsList();
        alert('Quiz saved!');
      });
    });
  });

  startQuizBtn.addEventListener('click', () => {
    const selected = selectQuiz.value;
    if (!selected) return;

    chrome.storage.local.get(['quizzes'], (result) => {
      const quizzes = result.quizzes || {};
      quizQuestions = [...quizzes[selected]];
      currentQuizName = selected;
      currentQuestionIndex = 0;
      score = 0;
      selectedAnswer = null;
      quizArea.style.display = 'block';
      resultsArea.style.display = 'none';
      showQuestion();
    });
  });

  nextQuestionBtn.addEventListener('click', () => {
    if (selectedAnswer === quizQuestions[currentQuestionIndex].correct) {
      score++;
    }

    currentQuestionIndex++;
    selectedAnswer = null;
    nextQuestionBtn.disabled = true;

    if (currentQuestionIndex >= quizQuestions.length) {
      showResults();
    } else {
      showQuestion();
    }
  });

  retakeBtn.addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    quizArea.style.display = 'block';
    resultsArea.style.display = 'none';
    showQuestion();
  });

  function updateQuestionsList() {
    saveQuizBtn.disabled = currentQuestions.length === 0;

    if (currentQuestions.length === 0) {
      questionsList.innerHTML = '<p class="empty-message">No questions added</p>';
      return;
    }

    questionsList.innerHTML = currentQuestions.map((q, i) => `
      <div class="question-item">
        <button class="delete-btn" data-index="${i}">&times;</button>
        <strong>Q${i + 1}:</strong> ${escapeHtml(q.question.substring(0, 50))}...
      </div>
    `).join('');

    questionsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentQuestions.splice(parseInt(btn.dataset.index), 1);
        updateQuestionsList();
      });
    });
  }

  function loadQuizList() {
    chrome.storage.local.get(['quizzes'], (result) => {
      const quizzes = result.quizzes || {};
      const names = Object.keys(quizzes);

      selectQuiz.innerHTML = '<option value="">Select a quiz</option>' +
        names.map(n => `<option value="${n}">${n} (${quizzes[n].length} questions)</option>`).join('');
    });
  }

  function showQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    questionNumber.textContent = `Question ${currentQuestionIndex + 1}/${quizQuestions.length}`;
    currentQuestion.textContent = q.question;

    const optionLetters = ['A', 'B', 'C', 'D'].filter(l => q.options[l]);
    optionsArea.innerHTML = optionLetters.map(l => `
      <button class="option-btn" data-option="${l}">
        <strong>${l}:</strong> ${escapeHtml(q.options[l])}
      </button>
    `).join('');

    optionsArea.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAnswer = btn.dataset.option;
        optionsArea.querySelectorAll('.option-btn').forEach(b => {
          b.classList.remove('selected', 'correct', 'incorrect');
        });
        btn.classList.add('selected');

        if (selectedAnswer === q.correct) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('incorrect');
          optionsArea.querySelector(`[data-option="${q.correct}"]`).classList.add('correct');
        }

        nextQuestionBtn.disabled = false;
      });
    });
  }

  function showResults() {
    quizArea.style.display = 'none';
    resultsArea.style.display = 'block';
    finalScore.textContent = score;
    totalQuestions.textContent = quizQuestions.length;
    scorePercent.textContent = `${Math.round((score / quizQuestions.length) * 100)}%`;

    saveHistory();
  }

  function saveHistory() {
    chrome.storage.local.get(['quizHistory'], (result) => {
      const history = result.quizHistory || [];
      history.unshift({
        quizName: currentQuizName,
        score: score,
        total: quizQuestions.length,
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ quizHistory: history.slice(0, 50) });
    });
  }

  function loadHistory() {
    chrome.storage.local.get(['quizHistory'], (result) => {
      const history = result.quizHistory || [];

      if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No quiz history</p>';
        return;
      }

      historyList.innerHTML = history.map(h => `
        <div class="history-item">
          <div class="quiz-name">${escapeHtml(h.quizName)}</div>
          <div class="score">${h.score}/${h.total} (${Math.round((h.score / h.total) * 100)}%)</div>
          <div class="date">${new Date(h.date).toLocaleString()}</div>
        </div>
      `).join('');
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
