document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const deckSelect = document.getElementById('deckSelect');
  const deckList = document.getElementById('deckList');
  const frontText = document.getElementById('frontText');
  const backText = document.getElementById('backText');
  const useSelectionBtn = document.getElementById('useSelectionBtn');
  const createCardBtn = document.getElementById('createCardBtn');

  const studyDeck = document.getElementById('studyDeck');
  const cardInner = document.getElementById('cardInner');
  const cardFront = document.getElementById('cardFront');
  const cardBack = document.getElementById('cardBack');
  const flipBtn = document.getElementById('flipBtn');
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  const cardProgress = document.getElementById('cardProgress');
  const shuffleBtn = document.getElementById('shuffleBtn');

  const manageDeck = document.getElementById('manageDeck');
  const cardsList = document.getElementById('cardsList');
  const deleteDeckBtn = document.getElementById('deleteDeckBtn');

  let currentStudyCards = [];
  let currentCardIndex = 0;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
    });
  });

  loadDecks();

  useSelectionBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    }, (results) => {
      if (results && results[0] && results[0].result) {
        backText.value = results[0].result;
      }
    });
  });

  createCardBtn.addEventListener('click', () => {
    const deck = deckSelect.value.trim();
    const front = frontText.value.trim();
    const back = backText.value.trim();

    if (!deck || !front || !back) {
      alert('Please fill in all fields');
      return;
    }

    chrome.storage.local.get(['flashcardDecks'], (result) => {
      const decks = result.flashcardDecks || {};
      if (!decks[deck]) decks[deck] = [];

      decks[deck].push({
        id: Date.now(),
        front: front,
        back: back
      });

      chrome.storage.local.set({ flashcardDecks: decks }, () => {
        frontText.value = '';
        backText.value = '';
        loadDecks();
      });
    });
  });

  studyDeck.addEventListener('change', () => {
    loadStudyDeck(studyDeck.value);
  });

  flipBtn.addEventListener('click', () => {
    cardInner.classList.toggle('flipped');
  });

  prevCardBtn.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      showCard();
    }
  });

  nextCardBtn.addEventListener('click', () => {
    if (currentCardIndex < currentStudyCards.length - 1) {
      currentCardIndex++;
      showCard();
    }
  });

  shuffleBtn.addEventListener('click', () => {
    currentStudyCards = shuffleArray([...currentStudyCards]);
    currentCardIndex = 0;
    showCard();
  });

  manageDeck.addEventListener('change', () => {
    loadManagedDeck(manageDeck.value);
  });

  deleteDeckBtn.addEventListener('click', () => {
    const deck = manageDeck.value;
    if (!deck) return;

    if (confirm(`Delete deck "${deck}" and all its cards?`)) {
      chrome.storage.local.get(['flashcardDecks'], (result) => {
        const decks = result.flashcardDecks || {};
        delete decks[deck];
        chrome.storage.local.set({ flashcardDecks: decks }, loadDecks);
      });
    }
  });

  function loadDecks() {
    chrome.storage.local.get(['flashcardDecks'], (result) => {
      const decks = result.flashcardDecks || {};
      const deckNames = Object.keys(decks);

      deckList.innerHTML = deckNames.map(d => `<option value="${d}">`).join('');

      studyDeck.innerHTML = '<option value="">Select a deck to study</option>' +
        deckNames.map(d => `<option value="${d}">${d} (${decks[d].length} cards)</option>`).join('');

      manageDeck.innerHTML = '<option value="">Select a deck</option>' +
        deckNames.map(d => `<option value="${d}">${d}</option>`).join('');
    });
  }

  function loadStudyDeck(deckName) {
    if (!deckName) {
      currentStudyCards = [];
      cardFront.textContent = 'Select a deck to start';
      cardBack.textContent = '';
      cardProgress.textContent = '0/0';
      return;
    }

    chrome.storage.local.get(['flashcardDecks'], (result) => {
      const decks = result.flashcardDecks || {};
      currentStudyCards = decks[deckName] || [];
      currentCardIndex = 0;
      cardInner.classList.remove('flipped');
      showCard();
    });
  }

  function showCard() {
    if (currentStudyCards.length === 0) {
      cardFront.textContent = 'No cards in this deck';
      cardBack.textContent = '';
      cardProgress.textContent = '0/0';
      return;
    }

    cardInner.classList.remove('flipped');
    const card = currentStudyCards[currentCardIndex];
    cardFront.textContent = card.front;
    cardBack.textContent = card.back;
    cardProgress.textContent = `${currentCardIndex + 1}/${currentStudyCards.length}`;
  }

  function loadManagedDeck(deckName) {
    if (!deckName) {
      cardsList.innerHTML = '<p class="empty-message">Select a deck to view cards</p>';
      return;
    }

    chrome.storage.local.get(['flashcardDecks'], (result) => {
      const decks = result.flashcardDecks || {};
      const cards = decks[deckName] || [];

      if (cards.length === 0) {
        cardsList.innerHTML = '<p class="empty-message">No cards in this deck</p>';
        return;
      }

      cardsList.innerHTML = cards.map(c => `
        <div class="card-item">
          <button class="delete-btn" data-id="${c.id}">&times;</button>
          <div class="front">${escapeHtml(c.front)}</div>
          <div class="back">${escapeHtml(c.back)}</div>
        </div>
      `).join('');

      cardsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCard(deckName, parseInt(btn.dataset.id)));
      });
    });
  }

  function deleteCard(deckName, cardId) {
    chrome.storage.local.get(['flashcardDecks'], (result) => {
      const decks = result.flashcardDecks || {};
      decks[deckName] = (decks[deckName] || []).filter(c => c.id !== cardId);
      chrome.storage.local.set({ flashcardDecks: decks }, () => {
        loadManagedDeck(deckName);
        loadDecks();
      });
    });
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
