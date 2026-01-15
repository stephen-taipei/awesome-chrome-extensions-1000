document.addEventListener('DOMContentLoaded', () => {
  // Synonym database
  const synonymDB = {
    'happy': {
      type: 'adjective',
      definition: 'Feeling or showing pleasure or contentment',
      synonyms: ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'elated', 'ecstatic', 'merry'],
      related: ['glad', 'satisfied', 'blissful', 'jovial'],
      example: 'She felt <strong>happy</strong> after receiving the good news.'
    },
    'sad': {
      type: 'adjective',
      definition: 'Feeling or showing sorrow; unhappy',
      synonyms: ['unhappy', 'sorrowful', 'dejected', 'depressed', 'melancholy', 'gloomy', 'mournful'],
      related: ['miserable', 'downcast', 'blue', 'heartbroken'],
      example: 'He looked <strong>sad</strong> after hearing about the loss.'
    },
    'big': {
      type: 'adjective',
      definition: 'Of considerable size or extent',
      synonyms: ['large', 'huge', 'enormous', 'massive', 'immense', 'vast', 'gigantic', 'substantial'],
      related: ['great', 'sizable', 'colossal', 'tremendous'],
      example: 'The house had a <strong>big</strong> garden in the back.'
    },
    'small': {
      type: 'adjective',
      definition: 'Of limited size; not great in amount',
      synonyms: ['tiny', 'little', 'minute', 'miniature', 'compact', 'petite', 'modest'],
      related: ['diminutive', 'microscopic', 'slight', 'mini'],
      example: 'She lived in a <strong>small</strong> apartment downtown.'
    },
    'good': {
      type: 'adjective',
      definition: 'Of high quality or standard',
      synonyms: ['excellent', 'great', 'fine', 'superior', 'wonderful', 'outstanding', 'superb', 'fantastic'],
      related: ['quality', 'first-rate', 'exceptional', 'splendid'],
      example: 'That was a <strong>good</strong> decision to make.'
    },
    'bad': {
      type: 'adjective',
      definition: 'Of poor quality or low standard',
      synonyms: ['poor', 'terrible', 'awful', 'dreadful', 'horrible', 'inferior', 'substandard'],
      related: ['lousy', 'unacceptable', 'unsatisfactory', 'deficient'],
      example: 'The weather was <strong>bad</strong> for the outdoor event.'
    },
    'fast': {
      type: 'adjective/adverb',
      definition: 'Moving or capable of moving at high speed',
      synonyms: ['quick', 'rapid', 'swift', 'speedy', 'hasty', 'brisk', 'fleet'],
      related: ['accelerated', 'express', 'hurried', 'prompt'],
      example: 'The <strong>fast</strong> train arrived ahead of schedule.'
    },
    'slow': {
      type: 'adjective/adverb',
      definition: 'Moving or operating at a low speed',
      synonyms: ['sluggish', 'leisurely', 'unhurried', 'gradual', 'delayed', 'tardy'],
      related: ['plodding', 'measured', 'languid', 'dawdling'],
      example: 'Traffic was <strong>slow</strong> during rush hour.'
    },
    'beautiful': {
      type: 'adjective',
      definition: 'Pleasing the senses or mind aesthetically',
      synonyms: ['gorgeous', 'stunning', 'lovely', 'attractive', 'pretty', 'exquisite', 'elegant'],
      related: ['handsome', 'radiant', 'magnificent', 'breathtaking'],
      example: 'The sunset was <strong>beautiful</strong> over the ocean.'
    },
    'important': {
      type: 'adjective',
      definition: 'Of great significance or value',
      synonyms: ['significant', 'crucial', 'vital', 'essential', 'critical', 'major', 'key'],
      related: ['paramount', 'fundamental', 'pivotal', 'momentous'],
      example: 'This is an <strong>important</strong> decision for the company.'
    },
    'think': {
      type: 'verb',
      definition: 'To have a particular belief or idea',
      synonyms: ['believe', 'consider', 'suppose', 'assume', 'reckon', 'ponder', 'reflect'],
      related: ['contemplate', 'deliberate', 'reason', 'cogitate'],
      example: 'I <strong>think</strong> we should leave early tomorrow.'
    },
    'say': {
      type: 'verb',
      definition: 'To utter words in order to convey information',
      synonyms: ['state', 'declare', 'express', 'mention', 'assert', 'announce', 'proclaim'],
      related: ['articulate', 'voice', 'communicate', 'convey'],
      example: 'She didn\'t <strong>say</strong> anything about the meeting.'
    }
  };

  // DOM Elements
  const wordInput = document.getElementById('wordInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultsSection = document.getElementById('resultsSection');
  const noResults = document.getElementById('noResults');
  const mainWord = document.getElementById('mainWord');
  const wordType = document.getElementById('wordType');
  const wordDefinition = document.getElementById('wordDefinition');
  const synonymList = document.getElementById('synonymList');
  const relatedList = document.getElementById('relatedList');
  const exampleText = document.getElementById('exampleText');
  const savedList = document.getElementById('savedList');
  const historyList = document.getElementById('historyList');

  // State
  let savedWords = [];
  let history = [];

  // Load saved data
  chrome.storage.local.get(['synonymSavedWords', 'synonymHistory'], (result) => {
    savedWords = result.synonymSavedWords || [];
    history = result.synonymHistory || [];
    renderSavedWords();
    renderHistory();
  });

  // Save data
  function saveData() {
    chrome.storage.local.set({
      synonymSavedWords: savedWords,
      synonymHistory: history
    });
  }

  // Search for word
  function searchWord(word) {
    word = word.toLowerCase().trim();
    if (!word) return;

    // Add to history
    history = history.filter(w => w !== word);
    history.unshift(word);
    if (history.length > 8) history.pop();
    saveData();
    renderHistory();

    const data = synonymDB[word];

    if (data) {
      resultsSection.style.display = 'block';
      noResults.style.display = 'none';

      mainWord.textContent = word;
      wordType.textContent = data.type;
      wordDefinition.textContent = data.definition;
      exampleText.innerHTML = data.example;

      // Render synonyms
      synonymList.innerHTML = '';
      data.synonyms.forEach(syn => {
        const item = document.createElement('div');
        item.className = 'synonym-item';
        const isSaved = savedWords.includes(syn);
        item.innerHTML = `
          <span class="syn-word">${syn}</span>
          <button class="save-btn ${isSaved ? 'saved' : ''}">${isSaved ? '★' : '☆'}</button>
        `;
        item.querySelector('.syn-word').addEventListener('click', () => {
          wordInput.value = syn;
          searchWord(syn);
        });
        item.querySelector('.save-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSaveWord(syn);
        });
        synonymList.appendChild(item);
      });

      // Render related words
      relatedList.innerHTML = '';
      data.related.forEach(rel => {
        const item = document.createElement('div');
        item.className = 'related-item';
        item.textContent = rel;
        item.addEventListener('click', () => {
          wordInput.value = rel;
          searchWord(rel);
        });
        relatedList.appendChild(item);
      });
    } else {
      resultsSection.style.display = 'none';
      noResults.style.display = 'block';
    }
  }

  // Toggle save word
  function toggleSaveWord(word) {
    if (savedWords.includes(word)) {
      savedWords = savedWords.filter(w => w !== word);
    } else {
      savedWords.push(word);
    }
    saveData();
    renderSavedWords();
    // Re-render current results to update save buttons
    const currentWord = mainWord.textContent;
    if (currentWord) searchWord(currentWord);
  }

  // Render saved words
  function renderSavedWords() {
    if (savedWords.length === 0) {
      savedList.innerHTML = '<p class="empty-message">No saved words yet</p>';
      return;
    }

    savedList.innerHTML = '';
    savedWords.forEach(word => {
      const item = document.createElement('div');
      item.className = 'saved-item';
      item.innerHTML = `
        <span>${word}</span>
        <button class="remove-btn">&times;</button>
      `;
      item.querySelector('span').addEventListener('click', () => {
        wordInput.value = word;
        searchWord(word);
      });
      item.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSaveWord(word);
      });
      savedList.appendChild(item);
    });
  }

  // Render history
  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(word => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.textContent = word;
      item.addEventListener('click', () => {
        wordInput.value = word;
        searchWord(word);
      });
      historyList.appendChild(item);
    });
  }

  // Event listeners
  searchBtn.addEventListener('click', () => searchWord(wordInput.value));
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWord(wordInput.value);
  });
});
