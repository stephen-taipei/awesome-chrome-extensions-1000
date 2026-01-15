document.addEventListener('DOMContentLoaded', () => {
  // Idiom database
  const idioms = [
    {
      idiom: "A piece of cake",
      meaning: "Something very easy to do",
      example: "The exam was a piece of cake for her.",
      origin: "Originated in the 1930s, comparing easy tasks to eating cake",
      category: "all"
    },
    {
      idiom: "Break the ice",
      meaning: "To initiate conversation in a social setting",
      example: "He told a joke to break the ice at the meeting.",
      origin: "From breaking ice to allow ships to pass through frozen waters",
      category: "all"
    },
    {
      idiom: "Time flies",
      meaning: "Time passes quickly",
      example: "Time flies when you're having fun.",
      origin: "From Latin 'tempus fugit'",
      category: "time"
    },
    {
      idiom: "Beat around the bush",
      meaning: "Avoid getting to the point",
      example: "Stop beating around the bush and tell me what happened.",
      origin: "From hunting, where beaters would drive birds from bushes",
      category: "all"
    },
    {
      idiom: "Cost an arm and a leg",
      meaning: "Very expensive",
      example: "That new car cost an arm and a leg.",
      origin: "Post-WWII expression about high prices",
      category: "money"
    },
    {
      idiom: "Let the cat out of the bag",
      meaning: "Reveal a secret",
      example: "She let the cat out of the bag about the surprise party.",
      origin: "From medieval markets where pigs were sold in bags",
      category: "animals"
    },
    {
      idiom: "Kill two birds with one stone",
      meaning: "Accomplish two things with one action",
      example: "By walking to work, I kill two birds with one stone - exercise and commuting.",
      origin: "Ancient proverb about efficiency",
      category: "animals"
    },
    {
      idiom: "In the nick of time",
      meaning: "Just in time, at the last moment",
      example: "The ambulance arrived in the nick of time.",
      origin: "From 'nick' meaning a precise point in time",
      category: "time"
    },
    {
      idiom: "Break a leg",
      meaning: "Good luck (theatrical)",
      example: "Break a leg on your performance tonight!",
      origin: "Theater superstition - saying 'good luck' is considered bad luck",
      category: "body"
    },
    {
      idiom: "Hit the nail on the head",
      meaning: "Be exactly right",
      example: "Your analysis hit the nail on the head.",
      origin: "From carpentry - striking a nail precisely",
      category: "all"
    },
    {
      idiom: "Once in a blue moon",
      meaning: "Very rarely",
      example: "He only visits once in a blue moon.",
      origin: "A blue moon is the second full moon in a month",
      category: "time"
    },
    {
      idiom: "Money doesn't grow on trees",
      meaning: "Money is not easily obtained",
      example: "You can't have everything - money doesn't grow on trees.",
      origin: "American expression from the 1800s",
      category: "money"
    },
    {
      idiom: "The elephant in the room",
      meaning: "An obvious problem no one wants to discuss",
      example: "His poor performance was the elephant in the room.",
      origin: "Visualizing something impossible to ignore",
      category: "animals"
    },
    {
      idiom: "Give someone the cold shoulder",
      meaning: "Ignore someone deliberately",
      example: "After the argument, she gave him the cold shoulder.",
      origin: "Medieval practice of serving cold meat to unwelcome guests",
      category: "body"
    },
    {
      idiom: "Keep your chin up",
      meaning: "Stay positive in difficult times",
      example: "Keep your chin up - things will get better.",
      origin: "Military origin - maintaining composure",
      category: "body"
    },
    {
      idiom: "Put your money where your mouth is",
      meaning: "Back up words with action or financial commitment",
      example: "If you believe in this idea, put your money where your mouth is.",
      origin: "Gambling expression",
      category: "money"
    },
    {
      idiom: "When pigs fly",
      meaning: "Something that will never happen",
      example: "He'll clean his room when pigs fly.",
      origin: "Scottish proverb from the 1600s",
      category: "animals"
    },
    {
      idiom: "Better late than never",
      meaning: "It's better to do something late than not at all",
      example: "You finally submitted the report - better late than never.",
      origin: "Greek proverb, made popular by Chaucer",
      category: "time"
    }
  ];

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const catTabs = document.querySelectorAll('.cat-tab');
  const featuredText = document.getElementById('featuredText');
  const featuredMeaning = document.getElementById('featuredMeaning');
  const featuredExample = document.getElementById('featuredExample');
  const featuredOrigin = document.getElementById('featuredOrigin');
  const randomBtn = document.getElementById('randomBtn');
  const speakBtn = document.getElementById('speakBtn');
  const favoriteBtn = document.getElementById('favoriteBtn');
  const shareBtn = document.getElementById('shareBtn');
  const idiomList = document.getElementById('idiomList');
  const favoritesList = document.getElementById('favoritesList');

  // State
  let currentIdiom = null;
  let favorites = [];
  let currentCategory = 'all';

  // Load favorites
  chrome.storage.local.get(['idiomFavorites'], (result) => {
    favorites = result.idiomFavorites || [];
    renderFavorites();
  });

  // Save favorites
  function saveFavorites() {
    chrome.storage.local.set({ idiomFavorites: favorites });
  }

  // Display idiom
  function displayIdiom(idiom) {
    currentIdiom = idiom;
    featuredText.textContent = idiom.idiom;
    featuredMeaning.textContent = idiom.meaning;
    featuredExample.textContent = `"${idiom.example}"`;
    featuredOrigin.textContent = idiom.origin;

    // Update favorite button
    const isFavorite = favorites.some(f => f.idiom === idiom.idiom);
    favoriteBtn.textContent = isFavorite ? '★' : '☆';
    favoriteBtn.classList.toggle('active', isFavorite);
  }

  // Random idiom
  function showRandomIdiom() {
    const filtered = currentCategory === 'all'
      ? idioms
      : idioms.filter(i => i.category === currentCategory || i.category === 'all');
    const randomIndex = Math.floor(Math.random() * filtered.length);
    displayIdiom(filtered[randomIndex]);
  }

  // Render idiom list
  function renderIdiomList(filter = '') {
    const filtered = idioms.filter(idiom => {
      const matchesCategory = currentCategory === 'all' || idiom.category === currentCategory || idiom.category === 'all';
      const matchesSearch = idiom.idiom.toLowerCase().includes(filter.toLowerCase()) ||
                           idiom.meaning.toLowerCase().includes(filter.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    idiomList.innerHTML = '';
    filtered.forEach(idiom => {
      const div = document.createElement('div');
      div.className = 'idiom-item';
      div.innerHTML = `
        <div class="idiom-item-text">${idiom.idiom}</div>
        <div class="idiom-item-meaning">${idiom.meaning}</div>
      `;
      div.addEventListener('click', () => displayIdiom(idiom));
      idiomList.appendChild(div);
    });
  }

  // Render favorites
  function renderFavorites() {
    if (favorites.length === 0) {
      favoritesList.innerHTML = '<span class="empty-message">No favorites yet</span>';
      return;
    }

    favoritesList.innerHTML = '';
    favorites.forEach((fav, index) => {
      const span = document.createElement('span');
      span.className = 'favorite-item';
      span.innerHTML = `
        ${fav.idiom}
        <button class="remove-btn" data-index="${index}">&times;</button>
      `;
      span.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-btn')) {
          displayIdiom(fav);
        }
      });
      span.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        favorites.splice(index, 1);
        saveFavorites();
        renderFavorites();
        if (currentIdiom && currentIdiom.idiom === fav.idiom) {
          favoriteBtn.textContent = '☆';
          favoriteBtn.classList.remove('active');
        }
      });
      favoritesList.appendChild(span);
    });
  }

  // Event listeners
  randomBtn.addEventListener('click', showRandomIdiom);

  speakBtn.addEventListener('click', () => {
    if (!currentIdiom) return;
    const text = `${currentIdiom.idiom}. ${currentIdiom.meaning}`;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  });

  favoriteBtn.addEventListener('click', () => {
    if (!currentIdiom) return;
    const index = favorites.findIndex(f => f.idiom === currentIdiom.idiom);
    if (index === -1) {
      favorites.push(currentIdiom);
      favoriteBtn.textContent = '★';
      favoriteBtn.classList.add('active');
    } else {
      favorites.splice(index, 1);
      favoriteBtn.textContent = '☆';
      favoriteBtn.classList.remove('active');
    }
    saveFavorites();
    renderFavorites();
  });

  shareBtn.addEventListener('click', () => {
    if (!currentIdiom) return;
    const text = `${currentIdiom.idiom}\nMeaning: ${currentIdiom.meaning}\nExample: ${currentIdiom.example}`;
    navigator.clipboard.writeText(text).then(() => {
      shareBtn.textContent = '✓';
      setTimeout(() => {
        shareBtn.textContent = '📋';
      }, 1500);
    });
  });

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderIdiomList(searchInput.value);
    });
  });

  searchInput.addEventListener('input', (e) => {
    renderIdiomList(e.target.value);
  });

  // Initialize
  showRandomIdiom();
  renderIdiomList();
});
