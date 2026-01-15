document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mainView = document.getElementById('mainView');
  const addView = document.getElementById('addView');
  const listView = document.getElementById('listView');
  const flashcard = document.getElementById('flashcard');
  const cardFront = document.getElementById('cardFront');
  const cardBack = document.getElementById('cardBack');
  const cardActions = document.getElementById('cardActions');
  const totalCards = document.getElementById('totalCards');
  const masteredCards = document.getElementById('masteredCards');
  const dueCards = document.getElementById('dueCards');
  const cardsList = document.getElementById('cardsList');

  // Buttons
  const studyBtn = document.getElementById('studyBtn');
  const addBtn = document.getElementById('addBtn');
  const cancelAddBtn = document.getElementById('cancelAddBtn');
  const saveCardBtn = document.getElementById('saveCardBtn');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const backToMain = document.getElementById('backToMain');
  const wrongBtn = document.getElementById('wrongBtn');
  const hardBtn = document.getElementById('hardBtn');
  const correctBtn = document.getElementById('correctBtn');
  const easyBtn = document.getElementById('easyBtn');

  // Inputs
  const wordInput = document.getElementById('wordInput');
  const definitionInput = document.getElementById('definitionInput');
  const exampleInput = document.getElementById('exampleInput');

  // State
  let cards = [];
  let currentCard = null;
  let studyQueue = [];
  let isStudying = false;
  let isFlipped = false;

  // Load cards from storage
  function loadCards() {
    chrome.storage.local.get(['vocabularyCards'], (result) => {
      cards = result.vocabularyCards || getSampleCards();
      updateStats();
    });
  }

  // Save cards to storage
  function saveCards() {
    chrome.storage.local.set({ vocabularyCards: cards });
  }

  // Sample cards for first-time users
  function getSampleCards() {
    return [
      { id: 1, word: 'Ephemeral', definition: 'Lasting for a very short time', example: 'The ephemeral beauty of cherry blossoms', level: 0, nextReview: Date.now() },
      { id: 2, word: 'Ubiquitous', definition: 'Present, appearing, or found everywhere', example: 'Smartphones have become ubiquitous', level: 0, nextReview: Date.now() },
      { id: 3, word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically', example: 'A pragmatic approach to problem-solving', level: 0, nextReview: Date.now() }
    ];
  }

  // Update statistics display
  function updateStats() {
    const now = Date.now();
    const total = cards.length;
    const mastered = cards.filter(c => c.level >= 5).length;
    const due = cards.filter(c => c.nextReview <= now).length;

    totalCards.textContent = total;
    masteredCards.textContent = mastered;
    dueCards.textContent = due;
  }

  // Get cards due for review
  function getDueCards() {
    const now = Date.now();
    return cards.filter(c => c.nextReview <= now).sort((a, b) => a.nextReview - b.nextReview);
  }

  // Start study session
  function startStudy() {
    studyQueue = getDueCards();
    if (studyQueue.length === 0) {
      cardFront.querySelector('.card-text').textContent = 'No cards due for review!';
      return;
    }
    isStudying = true;
    showNextCard();
  }

  // Show next card in queue
  function showNextCard() {
    if (studyQueue.length === 0) {
      isStudying = false;
      cardActions.style.display = 'none';
      flashcard.classList.remove('flipped');
      isFlipped = false;
      cardFront.querySelector('.card-text').textContent = 'Session complete!';
      cardBack.querySelector('.card-text').textContent = '';
      updateStats();
      return;
    }

    currentCard = studyQueue.shift();
    flashcard.classList.remove('flipped');
    isFlipped = false;
    cardActions.style.display = 'none';
    cardFront.querySelector('.card-text').textContent = currentCard.word;

    let backText = currentCard.definition;
    if (currentCard.example) {
      backText += `\n\n"${currentCard.example}"`;
    }
    cardBack.querySelector('.card-text').textContent = backText;
  }

  // Flip card
  flashcard.addEventListener('click', () => {
    if (!isStudying || !currentCard) return;

    isFlipped = !isFlipped;
    flashcard.classList.toggle('flipped', isFlipped);

    if (isFlipped) {
      cardActions.style.display = 'flex';
    }
  });

  // Calculate next review time based on response
  function getNextReview(level, quality) {
    const intervals = [1, 6, 24, 72, 168, 336, 672]; // hours
    let newLevel = level;

    switch (quality) {
      case 'wrong':
        newLevel = 0;
        break;
      case 'hard':
        newLevel = Math.max(0, level - 1);
        break;
      case 'good':
        newLevel = Math.min(6, level + 1);
        break;
      case 'easy':
        newLevel = Math.min(6, level + 2);
        break;
    }

    const hours = intervals[newLevel];
    return {
      level: newLevel,
      nextReview: Date.now() + (hours * 60 * 60 * 1000)
    };
  }

  // Handle review response
  function handleResponse(quality) {
    if (!currentCard) return;

    const { level, nextReview } = getNextReview(currentCard.level, quality);

    const cardIndex = cards.findIndex(c => c.id === currentCard.id);
    if (cardIndex !== -1) {
      cards[cardIndex].level = level;
      cards[cardIndex].nextReview = nextReview;
      saveCards();
    }

    showNextCard();
  }

  // Event listeners for response buttons
  wrongBtn.addEventListener('click', () => handleResponse('wrong'));
  hardBtn.addEventListener('click', () => handleResponse('hard'));
  correctBtn.addEventListener('click', () => handleResponse('good'));
  easyBtn.addEventListener('click', () => handleResponse('easy'));

  // Study button
  studyBtn.addEventListener('click', startStudy);

  // Add card button
  addBtn.addEventListener('click', () => {
    mainView.style.display = 'none';
    addView.style.display = 'block';
    wordInput.focus();
  });

  // Cancel add
  cancelAddBtn.addEventListener('click', () => {
    addView.style.display = 'none';
    mainView.style.display = 'block';
    clearInputs();
  });

  // Save card
  saveCardBtn.addEventListener('click', () => {
    const word = wordInput.value.trim();
    const definition = definitionInput.value.trim();
    const example = exampleInput.value.trim();

    if (!word || !definition) {
      alert('Please enter both word and definition');
      return;
    }

    const newCard = {
      id: Date.now(),
      word,
      definition,
      example,
      level: 0,
      nextReview: Date.now()
    };

    cards.push(newCard);
    saveCards();
    updateStats();
    clearInputs();
    addView.style.display = 'none';
    mainView.style.display = 'block';
  });

  // Clear inputs
  function clearInputs() {
    wordInput.value = '';
    definitionInput.value = '';
    exampleInput.value = '';
  }

  // View all cards
  viewAllBtn.addEventListener('click', () => {
    mainView.style.display = 'none';
    listView.style.display = 'block';
    renderCardsList();
  });

  // Back to main
  backToMain.addEventListener('click', () => {
    listView.style.display = 'none';
    mainView.style.display = 'block';
  });

  // Render cards list
  function renderCardsList() {
    cardsList.innerHTML = '';
    cards.forEach(card => {
      const item = document.createElement('div');
      item.className = 'card-item';
      item.innerHTML = `
        <div class="card-item-text">
          <div class="card-item-word">${card.word}</div>
          <div class="card-item-def">${card.definition}</div>
        </div>
        <button class="card-item-delete" data-id="${card.id}">&times;</button>
      `;
      cardsList.appendChild(item);
    });

    // Delete handlers
    cardsList.querySelectorAll('.card-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        cards = cards.filter(c => c.id !== id);
        saveCards();
        updateStats();
        renderCardsList();
      });
    });
  }

  // Initialize
  loadCards();
});
