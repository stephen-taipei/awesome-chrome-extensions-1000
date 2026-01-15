document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const totalWordsEl = document.getElementById('totalWords');
  const thisWeekEl = document.getElementById('thisWeek');
  const thisMonthEl = document.getElementById('thisMonth');
  const streakEl = document.getElementById('streak');
  const wordInput = document.getElementById('wordInput');
  const meaningInput = document.getElementById('meaningInput');
  const categorySelect = document.getElementById('categorySelect');
  const addBtn = document.getElementById('addBtn');
  const todayCountEl = document.getElementById('todayCount');
  const goalCountEl = document.getElementById('goalCount');
  const goalBar = document.getElementById('goalBar');
  const goalDisplay = document.getElementById('goalDisplay');
  const decreaseGoal = document.getElementById('decreaseGoal');
  const increaseGoal = document.getElementById('increaseGoal');
  const filterCategory = document.getElementById('filterCategory');
  const wordsList = document.getElementById('wordsList');

  // State
  let words = [];
  let dailyGoal = 5;
  let lastActiveDate = null;
  let streak = 0;

  // Get date string
  function getDateString(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  // Get week start
  function getWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  // Get month start
  function getMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Load data
  function loadData() {
    chrome.storage.local.get(['vocabTrackerData'], (result) => {
      const data = result.vocabTrackerData || {};
      words = data.words || [];
      dailyGoal = data.dailyGoal || 5;
      lastActiveDate = data.lastActiveDate;
      streak = data.streak || 0;

      // Check streak
      const today = getDateString();
      const yesterday = getDateString(new Date(Date.now() - 86400000));

      if (lastActiveDate !== today && lastActiveDate !== yesterday) {
        streak = 0;
      }

      updateUI();
    });
  }

  // Save data
  function saveData() {
    chrome.storage.local.set({
      vocabTrackerData: {
        words,
        dailyGoal,
        lastActiveDate,
        streak
      }
    });
  }

  // Update UI
  function updateUI() {
    const today = getDateString();
    const weekStart = getWeekStart();
    const monthStart = getMonthStart();

    // Count words
    const todayWords = words.filter(w => w.date === today).length;
    const weekWords = words.filter(w => new Date(w.date) >= weekStart).length;
    const monthWords = words.filter(w => new Date(w.date) >= monthStart).length;

    totalWordsEl.textContent = words.length;
    thisWeekEl.textContent = weekWords;
    thisMonthEl.textContent = monthWords;
    streakEl.textContent = streak;

    // Goal progress
    todayCountEl.textContent = todayWords;
    goalCountEl.textContent = dailyGoal;
    goalDisplay.textContent = dailyGoal;
    const goalPercent = Math.min(100, (todayWords / dailyGoal) * 100);
    goalBar.style.width = `${goalPercent}%`;

    // Render words list
    renderWordsList();

    // Update chart
    updateChart();
  }

  // Render words list
  function renderWordsList() {
    const filter = filterCategory.value;
    const filtered = filter === 'all' ? words : words.filter(w => w.category === filter);
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    const display = sorted.slice(0, 10);

    wordsList.innerHTML = '';
    if (display.length === 0) {
      wordsList.innerHTML = '<p style="color:#666;font-size:12px;text-align:center;padding:20px;">No words yet. Add some!</p>';
      return;
    }

    display.forEach((word, index) => {
      const div = document.createElement('div');
      div.className = 'word-item';
      div.innerHTML = `
        <div class="word-info">
          <div class="word-text">${word.word}</div>
          <div class="word-meaning">${word.meaning}</div>
        </div>
        <span class="word-category">${word.category}</span>
        <button class="word-delete" data-index="${words.indexOf(word)}">&times;</button>
      `;
      wordsList.appendChild(div);
    });

    // Delete handlers
    wordsList.querySelectorAll('.word-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        words.splice(index, 1);
        saveData();
        updateUI();
      });
    });
  }

  // Update chart
  function updateChart() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = {};

    // Initialize week data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      weekData[dayName] = words.filter(w => w.date === getDateString(date)).length;
    }

    const maxCount = Math.max(...Object.values(weekData), dailyGoal);

    document.querySelectorAll('.chart-bar').forEach(bar => {
      const day = bar.dataset.day;
      const count = weekData[day] || 0;
      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
      bar.querySelector('.bar-fill').style.height = `${Math.max(5, height)}%`;
    });
  }

  // Add word
  addBtn.addEventListener('click', () => {
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    const category = categorySelect.value;

    if (!word || !meaning) {
      alert('Please enter both word and meaning');
      return;
    }

    const today = getDateString();

    // Update streak
    if (lastActiveDate !== today) {
      const yesterday = getDateString(new Date(Date.now() - 86400000));
      if (lastActiveDate === yesterday) {
        streak++;
      } else if (lastActiveDate !== today) {
        streak = 1;
      }
      lastActiveDate = today;
    }

    words.push({
      word,
      meaning,
      category,
      date: today
    });

    saveData();
    updateUI();

    wordInput.value = '';
    meaningInput.value = '';
    wordInput.focus();
  });

  // Goal controls
  decreaseGoal.addEventListener('click', () => {
    if (dailyGoal > 1) {
      dailyGoal--;
      saveData();
      updateUI();
    }
  });

  increaseGoal.addEventListener('click', () => {
    if (dailyGoal < 20) {
      dailyGoal++;
      saveData();
      updateUI();
    }
  });

  // Filter change
  filterCategory.addEventListener('change', renderWordsList);

  // Initialize
  loadData();
});
