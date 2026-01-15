document.addEventListener('DOMContentLoaded', () => {
  // Accent database
  const accents = {
    english: [
      {
        name: 'American (General)',
        region: 'United States',
        description: 'The standard American accent, often heard in national media. Characterized by rhotic pronunciation and specific vowel sounds.',
        features: [
          'Rhotic - "r" is pronounced in all positions',
          'Flapped "t" - "butter" sounds like "budder"',
          'Cot-caught merger in many regions',
          'Flat "a" in words like "bath" and "dance"'
        ],
        examples: [
          { word: 'water', pron: 'WAH-ter' },
          { word: 'better', pron: 'BEH-der' },
          { word: 'car', pron: 'kar' },
          { word: 'dance', pron: 'dans' }
        ],
        tips: [
          'Practice the rhotic "r" by curling your tongue back slightly',
          'The "t" between vowels often sounds like a soft "d"',
          'Vowels tend to be more relaxed than in British English'
        ]
      },
      {
        name: 'British (RP)',
        region: 'United Kingdom',
        description: 'Received Pronunciation, the traditional accent of educated southern England. Often considered the "standard" British accent.',
        features: [
          'Non-rhotic - "r" is dropped at end of syllables',
          'Long "a" in words like "bath" (bahth)',
          'Distinct vowel in "lot" vs "thought"',
          'Clear "t" pronunciation'
        ],
        examples: [
          { word: 'water', pron: 'WAW-tuh' },
          { word: 'bath', pron: 'bahth' },
          { word: 'car', pron: 'cah' },
          { word: 'better', pron: 'BEH-tuh' }
        ],
        tips: [
          'Drop the "r" at the end of words like "car" and "better"',
          'Use a longer "a" sound in words like "bath" and "grass"',
          'Pronounce "t" clearly, especially at word endings'
        ]
      },
      {
        name: 'Australian',
        region: 'Australia',
        description: 'The Australian accent features unique vowel shifts and a rising intonation pattern at the end of sentences.',
        features: [
          'Non-rhotic like British English',
          'Raised vowels - "day" sounds like "die"',
          'Rising intonation (upspeak)',
          'Shortened words and unique slang'
        ],
        examples: [
          { word: 'day', pron: 'die' },
          { word: 'mate', pron: 'mite' },
          { word: 'no', pron: 'naow' },
          { word: 'today', pron: 'to-DIE' }
        ],
        tips: [
          'Practice raising the "a" sound toward "i"',
          'End statements with a slight rise in pitch',
          'The "i" sound often shifts toward "oi"'
        ]
      }
    ],
    spanish: [
      {
        name: 'Castilian',
        region: 'Spain (Central)',
        description: 'The standard Spanish accent from central Spain, featuring the distinctive "th" sound for "c" and "z".',
        features: [
          'Distinción - "c/z" pronounced as "th"',
          'Strong "j" sound (like Scottish "loch")',
          'Crisp consonants',
          'Varied intonation patterns'
        ],
        examples: [
          { word: 'cerveza', pron: 'ther-VEH-tha' },
          { word: 'cinco', pron: 'THEEN-ko' },
          { word: 'gracias', pron: 'GRAH-thyahs' },
          { word: 'jamón', pron: 'ha-MON' }
        ],
        tips: [
          'Place tongue between teeth for the "th" sound',
          'The "j" is pronounced from the back of the throat',
          'Roll your "r" distinctly in words with "rr"'
        ]
      },
      {
        name: 'Latin American',
        region: 'Latin America',
        description: 'General Latin American Spanish, characterized by seseo (no "th" sound) and softer consonants than Castilian.',
        features: [
          'Seseo - "c/z" pronounced as "s"',
          'Softer "j" sound',
          'Varied regional differences',
          'Clear vowel pronunciation'
        ],
        examples: [
          { word: 'cerveza', pron: 'ser-VEH-sa' },
          { word: 'cinco', pron: 'SEEN-ko' },
          { word: 'gracias', pron: 'GRAH-syahs' },
          { word: 'calle', pron: 'KAH-yeh' }
        ],
        tips: [
          'Use "s" sound for both "c" (before e/i) and "z"',
          'The "j" is softer, more like an English "h"',
          'Keep vowels clear and consistent'
        ]
      },
      {
        name: 'Mexican',
        region: 'Mexico',
        description: 'Mexican Spanish features clear enunciation and distinctive intonation patterns, widely understood across the Spanish-speaking world.',
        features: [
          'Clear consonant pronunciation',
          'Melodic intonation',
          'Reduced final syllables sometimes',
          'Unique vocabulary and expressions'
        ],
        examples: [
          { word: 'bueno', pron: 'BWEH-no' },
          { word: 'México', pron: 'MEH-hee-ko' },
          { word: 'trabajo', pron: 'tra-BAH-ho' },
          { word: 'qué', pron: 'keh' }
        ],
        tips: [
          'Maintain clear, even pronunciation of all syllables',
          'The intonation tends to be musical and varied',
          'Practice the soft "x" sound (like "h") in Mexican words'
        ]
      }
    ],
    french: [
      {
        name: 'Parisian',
        region: 'France (Paris)',
        description: 'Standard French as spoken in Paris. Features nasal vowels, liaison, and the distinctive French "r".',
        features: [
          'Uvular "r" (back of throat)',
          'Nasal vowels (on, an, in, un)',
          'Liaison between words',
          'Silent final consonants'
        ],
        examples: [
          { word: 'bonjour', pron: 'bon-ZHOOR' },
          { word: 'merci', pron: 'mehr-SEE' },
          { word: 'France', pron: 'frahns' },
          { word: 'très', pron: 'treh' }
        ],
        tips: [
          'Practice the "r" by gargling gently',
          'For nasal vowels, let air flow through your nose',
          'Link words together smoothly (liaison)'
        ]
      },
      {
        name: 'Québécois',
        region: 'Canada (Quebec)',
        description: 'French as spoken in Quebec, featuring unique vowel sounds, expressions, and a more relaxed pronunciation style.',
        features: [
          'Affricated "t" and "d" (sounds like "ts", "dz")',
          'Diphthongized vowels',
          'Unique expressions and vocabulary',
          'More varied intonation'
        ],
        examples: [
          { word: 'petit', pron: 'p-TSEE' },
          { word: 'tu', pron: 'tsu' },
          { word: 'icitte', pron: 'ee-SIT' },
          { word: 'ben', pron: 'ben' }
        ],
        tips: [
          'Add a slight "s" sound after "t" before "i" and "u"',
          'Vowels tend to be longer and more varied',
          'Intonation is more melodic than Parisian French'
        ]
      },
      {
        name: 'Belgian',
        region: 'Belgium',
        description: 'Belgian French maintains many traditional pronunciations and has a clearer, more measured speaking style.',
        features: [
          'Distinct number words (septante, nonante)',
          'Clearer vowel pronunciation',
          'Less liaison than Parisian',
          'Measured, even pace'
        ],
        examples: [
          { word: 'septante', pron: 'sep-TAHNT' },
          { word: 'nonante', pron: 'no-NAHNT' },
          { word: 'une fois', pron: 'oon fwah' },
          { word: 'savoir', pron: 'sa-VWAR' }
        ],
        tips: [
          'Use septante (70) instead of soixante-dix',
          'Pronounce words more distinctly than Parisian',
          'Less blending between words'
        ]
      }
    ]
  };

  // DOM Elements
  const langBtns = document.querySelectorAll('.lang-btn');
  const accentTabs = document.querySelectorAll('.accent-tab');
  const accentName = document.getElementById('accentName');
  const accentRegion = document.getElementById('accentRegion');
  const accentDescription = document.getElementById('accentDescription');
  const featuresList = document.getElementById('featuresList');
  const examplesList = document.getElementById('examplesList');
  const tipsList = document.getElementById('tipsList');
  const practiceWord = document.getElementById('practiceWord');
  const listenBtn = document.getElementById('listenBtn');
  const nextWordBtn = document.getElementById('nextWordBtn');
  const savedList = document.getElementById('savedList');
  const savedCount = document.getElementById('savedCount');
  const saveBtn = document.getElementById('saveBtn');
  const saveIcon = document.getElementById('saveIcon');
  const compareBtn = document.getElementById('compareBtn');

  // State
  let currentLanguage = 'english';
  let currentAccentIndex = 0;
  let currentAccent = null;
  let currentPracticeWord = null;
  let saved = [];

  // Load saved
  chrome.storage.local.get(['accentGuideSaved'], (result) => {
    saved = result.accentGuideSaved || [];
    updateSaved();
  });

  // Save data
  function saveData() {
    chrome.storage.local.set({ accentGuideSaved: saved });
  }

  // Display accent
  function displayAccent() {
    const accentList = accents[currentLanguage];
    currentAccent = accentList[currentAccentIndex];

    // Update tabs
    accentTabs.forEach((tab, index) => {
      tab.textContent = accentList[index]?.name.split(' ')[0] || `Accent ${index + 1}`;
      tab.classList.toggle('active', index === currentAccentIndex);
    });

    accentName.textContent = currentAccent.name;
    accentRegion.textContent = currentAccent.region;
    accentDescription.textContent = currentAccent.description;

    // Features
    featuresList.innerHTML = '';
    currentAccent.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      featuresList.appendChild(li);
    });

    // Examples
    examplesList.innerHTML = '';
    currentAccent.examples.forEach(example => {
      const div = document.createElement('div');
      div.className = 'example-item';
      div.innerHTML = `<span class="example-word">${example.word}</span><span class="example-pron">${example.pron}</span>`;
      div.addEventListener('click', () => speakWord(example.word));
      examplesList.appendChild(div);
    });

    // Tips
    tipsList.innerHTML = '';
    currentAccent.tips.forEach(tip => {
      const div = document.createElement('div');
      div.className = 'tip-item';
      div.textContent = tip;
      tipsList.appendChild(div);
    });

    // Update save button
    const isSaved = saved.some(s => s.name === currentAccent.name && s.language === currentLanguage);
    saveIcon.textContent = isSaved ? '★' : '☆';
    saveBtn.classList.toggle('saved', isSaved);

    // Set practice word
    setRandomPracticeWord();
  }

  // Speak word
  function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);

    // Set language
    const langCodes = {
      english: 'en-US',
      spanish: 'es-ES',
      french: 'fr-FR'
    };
    utterance.lang = langCodes[currentLanguage];

    speechSynthesis.speak(utterance);
  }

  // Set random practice word
  function setRandomPracticeWord() {
    const examples = currentAccent.examples;
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    currentPracticeWord = randomExample.word;
    practiceWord.textContent = `${randomExample.word} (${randomExample.pron})`;
  }

  // Update saved list
  function updateSaved() {
    savedCount.textContent = saved.length;

    if (saved.length === 0) {
      savedList.innerHTML = '<p style="color:#666;font-size:12px;text-align:center;">No saved accents</p>';
      return;
    }

    savedList.innerHTML = '';
    saved.slice(0, 5).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'saved-item';
      div.innerHTML = `
        <span>
          <span class="saved-accent">${item.name}</span>
          <span class="saved-lang">(${item.language})</span>
        </span>
        <button class="saved-remove" data-index="${index}">&times;</button>
      `;
      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('saved-remove')) {
          // Switch to saved accent
          currentLanguage = item.language;
          langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === item.language));

          const accentList = accents[item.language];
          const accentIndex = accentList.findIndex(a => a.name === item.name);
          if (accentIndex !== -1) {
            currentAccentIndex = accentIndex;
            displayAccent();
          }
        }
      });
      div.querySelector('.saved-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        saved.splice(index, 1);
        saveData();
        updateSaved();
        if (currentAccent && currentAccent.name === item.name) {
          saveIcon.textContent = '☆';
          saveBtn.classList.remove('saved');
        }
      });
      savedList.appendChild(div);
    });
  }

  // Event listeners
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLanguage = btn.dataset.lang;
      currentAccentIndex = 0;
      displayAccent();
    });
  });

  accentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      accentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentAccentIndex = parseInt(tab.dataset.accent);
      displayAccent();
    });
  });

  listenBtn.addEventListener('click', () => {
    if (currentPracticeWord) {
      speakWord(currentPracticeWord);
    }
  });

  nextWordBtn.addEventListener('click', setRandomPracticeWord);

  saveBtn.addEventListener('click', () => {
    if (!currentAccent) return;

    const index = saved.findIndex(s => s.name === currentAccent.name && s.language === currentLanguage);
    if (index === -1) {
      saved.push({
        name: currentAccent.name,
        language: currentLanguage,
        region: currentAccent.region
      });
      saveIcon.textContent = '★';
      saveBtn.classList.add('saved');
    } else {
      saved.splice(index, 1);
      saveIcon.textContent = '☆';
      saveBtn.classList.remove('saved');
    }
    saveData();
    updateSaved();
  });

  compareBtn.addEventListener('click', () => {
    // Cycle through accents for comparison
    const accentList = accents[currentLanguage];
    currentAccentIndex = (currentAccentIndex + 1) % accentList.length;
    displayAccent();
  });

  // Initialize
  displayAccent();
});
