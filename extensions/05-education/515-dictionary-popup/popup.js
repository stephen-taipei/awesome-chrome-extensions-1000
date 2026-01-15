document.addEventListener('DOMContentLoaded', () => {
  // Local dictionary database
  const dictionary = {
    'hello': {
      phonetic: '/həˈloʊ/',
      definitions: [
        { partOfSpeech: 'exclamation', meaning: 'Used as a greeting or to begin a phone conversation', example: 'Hello there, how are you?' },
        { partOfSpeech: 'noun', meaning: 'An utterance of hello; a greeting', example: 'She gave me a warm hello.' }
      ]
    },
    'world': {
      phonetic: '/wɜːld/',
      definitions: [
        { partOfSpeech: 'noun', meaning: 'The earth, together with all of its countries and peoples', example: 'He traveled around the world.' },
        { partOfSpeech: 'noun', meaning: 'A particular region or group of countries', example: 'The Western world' }
      ]
    },
    'language': {
      phonetic: '/ˈlæŋɡwɪdʒ/',
      definitions: [
        { partOfSpeech: 'noun', meaning: 'The method of human communication using words', example: 'Learning a new language takes time.' },
        { partOfSpeech: 'noun', meaning: 'A system of symbols and rules for computer programming', example: 'JavaScript is a popular programming language.' }
      ]
    },
    'learn': {
      phonetic: '/lɜːn/',
      definitions: [
        { partOfSpeech: 'verb', meaning: 'Gain knowledge or skills through study or experience', example: 'She wants to learn French.' },
        { partOfSpeech: 'verb', meaning: 'Become aware of by information or observation', example: 'I learned about the news this morning.' }
      ]
    },
    'knowledge': {
      phonetic: '/ˈnɒlɪdʒ/',
      definitions: [
        { partOfSpeech: 'noun', meaning: 'Facts, information, and skills acquired through experience or education', example: 'He has extensive knowledge of history.' },
        { partOfSpeech: 'noun', meaning: 'Awareness or familiarity gained by experience', example: 'Knowledge of the situation was limited.' }
      ]
    },
    'study': {
      phonetic: '/ˈstʌdi/',
      definitions: [
        { partOfSpeech: 'verb', meaning: 'Devote time and attention to gaining knowledge', example: 'She studies medicine at university.' },
        { partOfSpeech: 'noun', meaning: 'The devotion of time and attention to acquiring knowledge', example: 'The study of languages is rewarding.' }
      ]
    },
    'education': {
      phonetic: '/ˌedʒuˈkeɪʃn/',
      definitions: [
        { partOfSpeech: 'noun', meaning: 'The process of receiving or giving systematic instruction', example: 'Education is important for personal growth.' },
        { partOfSpeech: 'noun', meaning: 'An enlightening experience', example: 'Traveling is an education in itself.' }
      ]
    },
    'vocabulary': {
      phonetic: '/vəˈkæbjələri/',
      definitions: [
        { partOfSpeech: 'noun', meaning: 'The body of words used in a particular language', example: 'Expand your vocabulary through reading.' },
        { partOfSpeech: 'noun', meaning: 'The words known and used by a person', example: 'Her vocabulary is quite advanced.' }
      ]
    },
    'practice': {
      phonetic: '/ˈpræktɪs/',
      definitions: [
        { partOfSpeech: 'noun', meaning: 'The actual application of an idea or method', example: 'Practice makes perfect.' },
        { partOfSpeech: 'verb', meaning: 'Perform an activity repeatedly to improve', example: 'Practice speaking every day.' }
      ]
    },
    'understand': {
      phonetic: '/ˌʌndərˈstænd/',
      definitions: [
        { partOfSpeech: 'verb', meaning: 'Perceive the intended meaning of words or a speaker', example: 'I understand what you mean.' },
        { partOfSpeech: 'verb', meaning: 'Be sympathetically aware of a situation', example: 'I understand your concerns.' }
      ]
    }
  };

  // DOM Elements
  const wordInput = document.getElementById('wordInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultSection = document.getElementById('resultSection');
  const noResult = document.getElementById('noResult');
  const wordTitle = document.getElementById('wordTitle');
  const wordPhonetic = document.getElementById('wordPhonetic');
  const definitionsList = document.getElementById('definitionsList');
  const speakBtn = document.getElementById('speakBtn');
  const saveWordBtn = document.getElementById('saveWordBtn');
  const copyBtn = document.getElementById('copyBtn');
  const savedWords = document.getElementById('savedWords');
  const historyWords = document.getElementById('historyWords');
  const clearAllBtn = document.getElementById('clearAllBtn');

  // State
  let currentWord = '';
  let saved = [];
  let history = [];

  // Load saved data
  chrome.storage.local.get(['dictionarySaved', 'dictionaryHistory'], (result) => {
    saved = result.dictionarySaved || [];
    history = result.dictionaryHistory || [];
    renderSaved();
    renderHistory();
  });

  // Save data
  function saveData() {
    chrome.storage.local.set({
      dictionarySaved: saved,
      dictionaryHistory: history
    });
  }

  // Look up word
  function lookupWord(word) {
    word = word.toLowerCase().trim();
    if (!word) return;

    currentWord = word;

    // Add to history
    history = history.filter(w => w !== word);
    history.unshift(word);
    if (history.length > 10) history.pop();
    saveData();
    renderHistory();

    const entry = dictionary[word];

    if (entry) {
      wordTitle.textContent = word;
      wordPhonetic.textContent = entry.phonetic;

      // Group by part of speech
      const grouped = {};
      entry.definitions.forEach(def => {
        if (!grouped[def.partOfSpeech]) {
          grouped[def.partOfSpeech] = [];
        }
        grouped[def.partOfSpeech].push(def);
      });

      definitionsList.innerHTML = '';
      Object.keys(grouped).forEach(pos => {
        const group = document.createElement('div');
        group.className = 'definition-group';
        group.innerHTML = `<span class="part-of-speech">${pos}</span>`;

        grouped[pos].forEach(def => {
          const item = document.createElement('div');
          item.className = 'definition-item';
          item.innerHTML = `
            <div class="definition-text">${def.meaning}</div>
            ${def.example ? `<div class="definition-example">${def.example}</div>` : ''}
          `;
          group.appendChild(item);
        });

        definitionsList.appendChild(group);
      });

      // Update save button
      const isSaved = saved.includes(word);
      saveWordBtn.querySelector('.action-icon').textContent = isSaved ? '★' : '☆';
      saveWordBtn.classList.toggle('saved', isSaved);

      resultSection.style.display = 'block';
      noResult.style.display = 'none';
    } else {
      resultSection.style.display = 'none';
      noResult.style.display = 'block';
    }
  }

  // Render saved words
  function renderSaved() {
    if (saved.length === 0) {
      savedWords.innerHTML = '<p class="empty-msg">No saved words yet</p>';
      return;
    }

    savedWords.innerHTML = '';
    saved.forEach(word => {
      const span = document.createElement('span');
      span.className = 'saved-word';
      span.innerHTML = `
        ${word}
        <button class="remove-btn" data-word="${word}">&times;</button>
      `;
      span.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-btn')) {
          wordInput.value = word;
          lookupWord(word);
        }
      });
      span.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        saved = saved.filter(w => w !== word);
        saveData();
        renderSaved();
        if (currentWord === word) {
          saveWordBtn.querySelector('.action-icon').textContent = '☆';
          saveWordBtn.classList.remove('saved');
        }
      });
      savedWords.appendChild(span);
    });
  }

  // Render history
  function renderHistory() {
    historyWords.innerHTML = '';
    history.forEach(word => {
      const span = document.createElement('span');
      span.className = 'history-word';
      span.textContent = word;
      span.addEventListener('click', () => {
        wordInput.value = word;
        lookupWord(word);
      });
      historyWords.appendChild(span);
    });
  }

  // Event listeners
  searchBtn.addEventListener('click', () => lookupWord(wordInput.value));
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') lookupWord(wordInput.value);
  });

  speakBtn.addEventListener('click', () => {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      speechSynthesis.speak(utterance);
    }
  });

  saveWordBtn.addEventListener('click', () => {
    if (!currentWord) return;
    if (saved.includes(currentWord)) {
      saved = saved.filter(w => w !== currentWord);
      saveWordBtn.querySelector('.action-icon').textContent = '☆';
      saveWordBtn.classList.remove('saved');
    } else {
      saved.push(currentWord);
      saveWordBtn.querySelector('.action-icon').textContent = '★';
      saveWordBtn.classList.add('saved');
    }
    saveData();
    renderSaved();
  });

  copyBtn.addEventListener('click', () => {
    if (!currentWord) return;
    const entry = dictionary[currentWord];
    if (entry) {
      const text = `${currentWord} ${entry.phonetic}\n${entry.definitions.map(d => `(${d.partOfSpeech}) ${d.meaning}`).join('\n')}`;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.querySelector('span:last-child').textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.querySelector('span:last-child').textContent = 'Copy';
        }, 1500);
      });
    }
  });

  clearAllBtn.addEventListener('click', () => {
    saved = [];
    saveData();
    renderSaved();
    if (currentWord) {
      saveWordBtn.querySelector('.action-icon').textContent = '☆';
      saveWordBtn.classList.remove('saved');
    }
  });
});
