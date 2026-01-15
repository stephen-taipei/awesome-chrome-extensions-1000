document.addEventListener('DOMContentLoaded', () => {
  // Translation database
  const translations = {
    greetings: [
      { en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo' },
      { en: 'Good morning', es: 'Buenos días', fr: 'Bonjour', de: 'Guten Morgen' },
      { en: 'Good night', es: 'Buenas noches', fr: 'Bonne nuit', de: 'Gute Nacht' },
      { en: 'How are you?', es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es dir?' },
      { en: 'Nice to meet you', es: 'Mucho gusto', fr: 'Enchanté', de: 'Freut mich' },
      { en: 'Goodbye', es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen' }
    ],
    travel: [
      { en: 'Where is...?', es: '¿Dónde está...?', fr: 'Où est...?', de: 'Wo ist...?' },
      { en: 'How much does it cost?', es: '¿Cuánto cuesta?', fr: 'Combien ça coûte?', de: 'Wie viel kostet das?' },
      { en: 'I need help', es: 'Necesito ayuda', fr: "J'ai besoin d'aide", de: 'Ich brauche Hilfe' },
      { en: 'Train station', es: 'Estación de tren', fr: 'Gare', de: 'Bahnhof' },
      { en: 'Airport', es: 'Aeropuerto', fr: 'Aéroport', de: 'Flughafen' },
      { en: 'Hotel', es: 'Hotel', fr: 'Hôtel', de: 'Hotel' }
    ],
    dining: [
      { en: 'Menu, please', es: 'El menú, por favor', fr: 'Le menu, s\'il vous plaît', de: 'Die Speisekarte, bitte' },
      { en: 'Water, please', es: 'Agua, por favor', fr: "De l'eau, s'il vous plaît", de: 'Wasser, bitte' },
      { en: 'The check, please', es: 'La cuenta, por favor', fr: "L'addition, s'il vous plaît", de: 'Die Rechnung, bitte' },
      { en: 'Delicious!', es: '¡Delicioso!', fr: 'Délicieux!', de: 'Lecker!' },
      { en: 'I am vegetarian', es: 'Soy vegetariano', fr: 'Je suis végétarien', de: 'Ich bin Vegetarier' },
      { en: 'Thank you', es: 'Gracias', fr: 'Merci', de: 'Danke' }
    ],
    emergency: [
      { en: 'Help!', es: '¡Ayuda!', fr: 'Aidez-moi!', de: 'Hilfe!' },
      { en: 'Call the police', es: 'Llame a la policía', fr: 'Appelez la police', de: 'Rufen Sie die Polizei' },
      { en: 'I need a doctor', es: 'Necesito un médico', fr: "J'ai besoin d'un médecin", de: 'Ich brauche einen Arzt' },
      { en: 'Hospital', es: 'Hospital', fr: 'Hôpital', de: 'Krankenhaus' },
      { en: 'Emergency', es: 'Emergencia', fr: 'Urgence', de: 'Notfall' },
      { en: 'I am lost', es: 'Estoy perdido', fr: 'Je suis perdu', de: 'Ich habe mich verlaufen' }
    ]
  };

  // DOM Elements
  const fromLang = document.getElementById('fromLang');
  const toLang = document.getElementById('toLang');
  const swapBtn = document.getElementById('swapBtn');
  const inputText = document.getElementById('inputText');
  const translateBtn = document.getElementById('translateBtn');
  const outputSection = document.getElementById('outputSection');
  const outputText = document.getElementById('outputText');
  const speakBtn = document.getElementById('speakBtn');
  const copyBtn = document.getElementById('copyBtn');
  const phraseList = document.getElementById('phraseList');
  const historyList = document.getElementById('historyList');
  const catBtns = document.querySelectorAll('.cat-btn');

  // State
  let currentCategory = 'greetings';
  let history = [];

  // Load history
  chrome.storage.local.get(['translationHistory'], (result) => {
    history = result.translationHistory || [];
    renderHistory();
  });

  // Save history
  function saveHistory() {
    chrome.storage.local.set({ translationHistory: history });
  }

  // Find translation
  function findTranslation(text, from, to) {
    text = text.toLowerCase().trim();

    for (const category in translations) {
      for (const phrase of translations[category]) {
        if (phrase[from] && phrase[from].toLowerCase() === text) {
          return phrase[to] || 'Translation not available';
        }
      }
    }

    return null;
  }

  // Translate
  function translate() {
    const text = inputText.value.trim();
    if (!text) return;

    const from = fromLang.value;
    const to = toLang.value;

    let result = findTranslation(text, from, to);

    if (!result) {
      result = `[Translation for "${text}" not found in database]`;
    }

    outputText.textContent = result;
    outputSection.style.display = 'block';

    // Add to history
    if (!result.includes('[Translation')) {
      history = history.filter(h => h.source !== text);
      history.unshift({ source: text, target: result, from, to });
      if (history.length > 10) history.pop();
      saveHistory();
      renderHistory();
    }
  }

  // Render phrases
  function renderPhrases() {
    const phrases = translations[currentCategory];
    const from = fromLang.value;
    const to = toLang.value;

    phraseList.innerHTML = '';
    phrases.forEach(phrase => {
      const div = document.createElement('div');
      div.className = 'phrase-item';
      div.innerHTML = `
        <span class="phrase-source">${phrase[from] || phrase.en}</span>
        <span class="phrase-target">${phrase[to] || phrase.es}</span>
      `;
      div.addEventListener('click', () => {
        inputText.value = phrase[from] || phrase.en;
        outputText.textContent = phrase[to] || phrase.es;
        outputSection.style.display = 'block';
      });
      phraseList.appendChild(div);
    });
  }

  // Render history
  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="history-source">${item.source}</span>
        <span class="history-target">${item.target}</span>
      `;
      div.addEventListener('click', () => {
        inputText.value = item.source;
        outputText.textContent = item.target;
        outputSection.style.display = 'block';
      });
      historyList.appendChild(div);
    });
  }

  // Event listeners
  translateBtn.addEventListener('click', translate);
  inputText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      translate();
    }
  });

  swapBtn.addEventListener('click', () => {
    const temp = fromLang.value;
    fromLang.value = toLang.value;
    toLang.value = temp;
    renderPhrases();
  });

  fromLang.addEventListener('change', renderPhrases);
  toLang.addEventListener('change', renderPhrases);

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderPhrases();
    });
  });

  speakBtn.addEventListener('click', () => {
    const text = outputText.textContent;
    if (text && !text.includes('[Translation')) {
      const langCodes = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE' };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCodes[toLang.value] || 'en-US';
      speechSynthesis.speak(utterance);
    }
  });

  copyBtn.addEventListener('click', () => {
    const text = outputText.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓';
        setTimeout(() => {
          copyBtn.textContent = '📋';
        }, 1500);
      });
    }
  });

  // Initialize
  renderPhrases();
});
