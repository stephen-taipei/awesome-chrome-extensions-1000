document.addEventListener('DOMContentLoaded', () => {
  // Vocabulary database
  const vocabulary = {
    spanish: {
      greetings: [
        { en: 'Hello', tr: 'Hola', hint: 'OH-lah' },
        { en: 'Goodbye', tr: 'Adiós', hint: 'ah-dee-OHS' },
        { en: 'Good morning', tr: 'Buenos días', hint: 'BWEH-nohs DEE-ahs' },
        { en: 'Good night', tr: 'Buenas noches', hint: 'BWEH-nahs NOH-chehs' },
        { en: 'Please', tr: 'Por favor', hint: 'por fah-VOR' },
        { en: 'Thank you', tr: 'Gracias', hint: 'GRAH-see-ahs' }
      ],
      numbers: [
        { en: 'One', tr: 'Uno', hint: 'OO-noh' },
        { en: 'Two', tr: 'Dos', hint: 'dohs' },
        { en: 'Three', tr: 'Tres', hint: 'trehs' },
        { en: 'Four', tr: 'Cuatro', hint: 'KWAH-troh' },
        { en: 'Five', tr: 'Cinco', hint: 'SEEN-koh' }
      ],
      colors: [
        { en: 'Red', tr: 'Rojo', hint: 'ROH-hoh' },
        { en: 'Blue', tr: 'Azul', hint: 'ah-SOOL' },
        { en: 'Green', tr: 'Verde', hint: 'VEHR-deh' },
        { en: 'Yellow', tr: 'Amarillo', hint: 'ah-mah-REE-yoh' }
      ],
      food: [
        { en: 'Water', tr: 'Agua', hint: 'AH-gwah' },
        { en: 'Bread', tr: 'Pan', hint: 'pahn' },
        { en: 'Apple', tr: 'Manzana', hint: 'mahn-SAH-nah' },
        { en: 'Coffee', tr: 'Café', hint: 'kah-FEH' }
      ]
    },
    french: {
      greetings: [
        { en: 'Hello', tr: 'Bonjour', hint: 'bohn-ZHOOR' },
        { en: 'Goodbye', tr: 'Au revoir', hint: 'oh ruh-VWAHR' },
        { en: 'Good evening', tr: 'Bonsoir', hint: 'bohn-SWAHR' },
        { en: 'Please', tr: "S'il vous plaît", hint: 'seel voo PLEH' },
        { en: 'Thank you', tr: 'Merci', hint: 'mehr-SEE' }
      ],
      numbers: [
        { en: 'One', tr: 'Un', hint: 'uhn' },
        { en: 'Two', tr: 'Deux', hint: 'duh' },
        { en: 'Three', tr: 'Trois', hint: 'twah' },
        { en: 'Four', tr: 'Quatre', hint: 'katr' },
        { en: 'Five', tr: 'Cinq', hint: 'sank' }
      ],
      colors: [
        { en: 'Red', tr: 'Rouge', hint: 'roozh' },
        { en: 'Blue', tr: 'Bleu', hint: 'bluh' },
        { en: 'Green', tr: 'Vert', hint: 'vehr' },
        { en: 'Yellow', tr: 'Jaune', hint: 'zhohn' }
      ],
      food: [
        { en: 'Water', tr: 'Eau', hint: 'oh' },
        { en: 'Bread', tr: 'Pain', hint: 'pahn' },
        { en: 'Apple', tr: 'Pomme', hint: 'pum' },
        { en: 'Coffee', tr: 'Café', hint: 'kah-FEH' }
      ]
    },
    german: {
      greetings: [
        { en: 'Hello', tr: 'Hallo', hint: 'HAH-loh' },
        { en: 'Goodbye', tr: 'Auf Wiedersehen', hint: 'owf VEE-der-zay-en' },
        { en: 'Good morning', tr: 'Guten Morgen', hint: 'GOO-ten MOR-gen' },
        { en: 'Please', tr: 'Bitte', hint: 'BIT-teh' },
        { en: 'Thank you', tr: 'Danke', hint: 'DAHN-keh' }
      ],
      numbers: [
        { en: 'One', tr: 'Eins', hint: 'ayns' },
        { en: 'Two', tr: 'Zwei', hint: 'tsvy' },
        { en: 'Three', tr: 'Drei', hint: 'dry' },
        { en: 'Four', tr: 'Vier', hint: 'feer' },
        { en: 'Five', tr: 'Fünf', hint: 'fuenf' }
      ],
      colors: [
        { en: 'Red', tr: 'Rot', hint: 'roht' },
        { en: 'Blue', tr: 'Blau', hint: 'blau' },
        { en: 'Green', tr: 'Grün', hint: 'gruen' },
        { en: 'Yellow', tr: 'Gelb', hint: 'gelp' }
      ],
      food: [
        { en: 'Water', tr: 'Wasser', hint: 'VAH-ser' },
        { en: 'Bread', tr: 'Brot', hint: 'broht' },
        { en: 'Apple', tr: 'Apfel', hint: 'AHP-fel' },
        { en: 'Coffee', tr: 'Kaffee', hint: 'KAH-feh' }
      ]
    },
    italian: {
      greetings: [
        { en: 'Hello', tr: 'Ciao', hint: 'CHOW' },
        { en: 'Goodbye', tr: 'Arrivederci', hint: 'ah-ree-veh-DEHR-chee' },
        { en: 'Good morning', tr: 'Buongiorno', hint: 'bwon-JOR-noh' },
        { en: 'Please', tr: 'Per favore', hint: 'pehr fah-VOH-reh' },
        { en: 'Thank you', tr: 'Grazie', hint: 'GRAH-tsee-eh' }
      ],
      numbers: [
        { en: 'One', tr: 'Uno', hint: 'OO-noh' },
        { en: 'Two', tr: 'Due', hint: 'DOO-eh' },
        { en: 'Three', tr: 'Tre', hint: 'treh' },
        { en: 'Four', tr: 'Quattro', hint: 'KWAH-troh' },
        { en: 'Five', tr: 'Cinque', hint: 'CHEEN-kweh' }
      ],
      colors: [
        { en: 'Red', tr: 'Rosso', hint: 'ROH-soh' },
        { en: 'Blue', tr: 'Blu', hint: 'bloo' },
        { en: 'Green', tr: 'Verde', hint: 'VEHR-deh' },
        { en: 'Yellow', tr: 'Giallo', hint: 'JAH-loh' }
      ],
      food: [
        { en: 'Water', tr: 'Acqua', hint: 'AH-kwah' },
        { en: 'Bread', tr: 'Pane', hint: 'PAH-neh' },
        { en: 'Apple', tr: 'Mela', hint: 'MEH-lah' },
        { en: 'Coffee', tr: 'Caffè', hint: 'kah-FEH' }
      ]
    },
    japanese: {
      greetings: [
        { en: 'Hello', tr: 'こんにちは', hint: 'kon-nee-chee-wah' },
        { en: 'Goodbye', tr: 'さようなら', hint: 'sah-yoh-nah-rah' },
        { en: 'Good morning', tr: 'おはよう', hint: 'oh-hah-yoh' },
        { en: 'Please', tr: 'お願いします', hint: 'oh-neh-gai-shee-mas' },
        { en: 'Thank you', tr: 'ありがとう', hint: 'ah-ree-gah-toh' }
      ],
      numbers: [
        { en: 'One', tr: '一 (いち)', hint: 'ee-chee' },
        { en: 'Two', tr: '二 (に)', hint: 'nee' },
        { en: 'Three', tr: '三 (さん)', hint: 'sahn' },
        { en: 'Four', tr: '四 (よん)', hint: 'yohn' },
        { en: 'Five', tr: '五 (ご)', hint: 'goh' }
      ],
      colors: [
        { en: 'Red', tr: '赤 (あか)', hint: 'ah-kah' },
        { en: 'Blue', tr: '青 (あお)', hint: 'ah-oh' },
        { en: 'Green', tr: '緑 (みどり)', hint: 'mee-doh-ree' },
        { en: 'Yellow', tr: '黄色 (きいろ)', hint: 'kee-ee-roh' }
      ],
      food: [
        { en: 'Water', tr: '水 (みず)', hint: 'mee-zoo' },
        { en: 'Bread', tr: 'パン', hint: 'pahn' },
        { en: 'Apple', tr: 'りんご', hint: 'reen-goh' },
        { en: 'Coffee', tr: 'コーヒー', hint: 'koh-hee' }
      ]
    }
  };

  // DOM Elements
  const languageSelect = document.getElementById('languageSelect');
  const flashcard = document.getElementById('flashcard');
  const cardFront = document.getElementById('cardFront');
  const cardHint = document.getElementById('cardHint');
  const cardBack = document.getElementById('cardBack');
  const speakBack = document.getElementById('speakBack');
  const currentIndex = document.getElementById('currentIndex');
  const totalCards = document.getElementById('totalCards');
  const ratingButtons = document.getElementById('ratingButtons');
  const prevBtn = document.getElementById('prevBtn');
  const flipBtn = document.getElementById('flipBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const resetBtn = document.getElementById('resetBtn');
  const catBtns = document.querySelectorAll('.cat-btn');
  const learnedEl = document.getElementById('learned');
  const studyingEl = document.getElementById('studying');
  const masteredEl = document.getElementById('mastered');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  // State
  let currentLanguage = 'spanish';
  let currentCategory = 'greetings';
  let cards = [];
  let index = 0;
  let isFlipped = false;
  let progress = {};

  // Load progress
  function loadProgress() {
    chrome.storage.local.get(['languageFlashcardProgress'], (result) => {
      progress = result.languageFlashcardProgress || {};
      updateStats();
    });
  }

  // Save progress
  function saveProgress() {
    chrome.storage.local.set({ languageFlashcardProgress: progress });
  }

  // Get cards for current selection
  function getCards() {
    return vocabulary[currentLanguage][currentCategory] || [];
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

  // Load cards
  function loadCards() {
    cards = getCards();
    index = 0;
    showCard();
    updateStats();
  }

  // Show current card
  function showCard() {
    if (cards.length === 0) return;

    const card = cards[index];
    cardFront.textContent = card.en;
    cardHint.textContent = `Pronunciation: ${card.hint}`;
    cardBack.textContent = card.tr;

    currentIndex.textContent = index + 1;
    totalCards.textContent = cards.length;

    // Reset flip state
    isFlipped = false;
    flashcard.classList.remove('flipped');
    ratingButtons.style.display = 'none';
  }

  // Flip card
  function flipCard() {
    isFlipped = !isFlipped;
    flashcard.classList.toggle('flipped', isFlipped);
    if (isFlipped) {
      ratingButtons.style.display = 'flex';
    }
  }

  // Navigate cards
  function prevCard() {
    if (index > 0) {
      index--;
      showCard();
    }
  }

  function nextCard() {
    if (index < cards.length - 1) {
      index++;
      showCard();
    }
  }

  // Rate card
  function rateCard(rating) {
    const card = cards[index];
    const key = `${currentLanguage}_${card.en}`;
    progress[key] = (progress[key] || 0) + rating;
    saveProgress();
    updateStats();
    nextCard();
  }

  // Update statistics
  function updateStats() {
    const allCards = Object.keys(vocabulary[currentLanguage]).reduce((acc, cat) => {
      return acc.concat(vocabulary[currentLanguage][cat]);
    }, []);

    let learned = 0, studying = 0, mastered = 0;

    allCards.forEach(card => {
      const key = `${currentLanguage}_${card.en}`;
      const score = progress[key] || 0;
      if (score >= 6) mastered++;
      else if (score >= 1) studying++;
    });

    learned = studying + mastered;

    learnedEl.textContent = learned;
    studyingEl.textContent = studying;
    masteredEl.textContent = mastered;

    const percent = allCards.length > 0 ? Math.round((mastered / allCards.length) * 100) : 0;
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}% Mastered`;
  }

  // Event listeners
  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    loadCards();
  });

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      loadCards();
    });
  });

  flashcard.addEventListener('click', flipCard);
  flipBtn.addEventListener('click', flipCard);
  prevBtn.addEventListener('click', prevCard);
  nextBtn.addEventListener('click', nextCard);

  shuffleBtn.addEventListener('click', () => {
    cards = shuffle(cards);
    index = 0;
    showCard();
  });

  resetBtn.addEventListener('click', () => {
    index = 0;
    showCard();
  });

  document.querySelectorAll('.rate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rateCard(parseInt(btn.dataset.rating));
    });
  });

  speakBack.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = cards[index];
    const utterance = new SpeechSynthesisUtterance(card.tr);
    const langCodes = {
      spanish: 'es-ES',
      french: 'fr-FR',
      german: 'de-DE',
      italian: 'it-IT',
      japanese: 'ja-JP'
    };
    utterance.lang = langCodes[currentLanguage];
    speechSynthesis.speak(utterance);
  });

  // Initialize
  loadProgress();
  loadCards();
});
