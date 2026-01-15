document.addEventListener('DOMContentLoaded', () => {
  // Verb conjugation database
  const verbsDB = {
    spanish: {
      verbs: {
        hablar: {
          meaning: 'to speak',
          present: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
          past: ['hablé', 'hablaste', 'habló', 'hablamos', 'hablasteis', 'hablaron'],
          future: ['hablaré', 'hablarás', 'hablará', 'hablaremos', 'hablaréis', 'hablarán']
        },
        comer: {
          meaning: 'to eat',
          present: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'],
          past: ['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron'],
          future: ['comeré', 'comerás', 'comerá', 'comeremos', 'comeréis', 'comerán']
        },
        vivir: {
          meaning: 'to live',
          present: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'],
          past: ['viví', 'viviste', 'vivió', 'vivimos', 'vivisteis', 'vivieron'],
          future: ['viviré', 'vivirás', 'vivirá', 'viviremos', 'viviréis', 'vivirán']
        },
        ser: {
          meaning: 'to be (permanent)',
          present: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
          past: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
          future: ['seré', 'serás', 'será', 'seremos', 'seréis', 'serán']
        },
        tener: {
          meaning: 'to have',
          present: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
          past: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
          future: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán']
        }
      },
      pronouns: ['yo', 'tú', 'él/ella', 'nosotros', 'vosotros', 'ellos']
    },
    french: {
      verbs: {
        parler: {
          meaning: 'to speak',
          present: ['parle', 'parles', 'parle', 'parlons', 'parlez', 'parlent'],
          past: ['ai parlé', 'as parlé', 'a parlé', 'avons parlé', 'avez parlé', 'ont parlé'],
          future: ['parlerai', 'parleras', 'parlera', 'parlerons', 'parlerez', 'parleront']
        },
        manger: {
          meaning: 'to eat',
          present: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'],
          past: ['ai mangé', 'as mangé', 'a mangé', 'avons mangé', 'avez mangé', 'ont mangé'],
          future: ['mangerai', 'mangeras', 'mangera', 'mangerons', 'mangerez', 'mangeront']
        },
        être: {
          meaning: 'to be',
          present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
          past: ['ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été'],
          future: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront']
        },
        avoir: {
          meaning: 'to have',
          present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
          past: ['ai eu', 'as eu', 'a eu', 'avons eu', 'avez eu', 'ont eu'],
          future: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront']
        }
      },
      pronouns: ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles']
    },
    italian: {
      verbs: {
        parlare: {
          meaning: 'to speak',
          present: ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano'],
          past: ['ho parlato', 'hai parlato', 'ha parlato', 'abbiamo parlato', 'avete parlato', 'hanno parlato'],
          future: ['parlerò', 'parlerai', 'parlerà', 'parleremo', 'parlerete', 'parleranno']
        },
        mangiare: {
          meaning: 'to eat',
          present: ['mangio', 'mangi', 'mangia', 'mangiamo', 'mangiate', 'mangiano'],
          past: ['ho mangiato', 'hai mangiato', 'ha mangiato', 'abbiamo mangiato', 'avete mangiato', 'hanno mangiato'],
          future: ['mangerò', 'mangerai', 'mangerà', 'mangeremo', 'mangerete', 'mangeranno']
        },
        essere: {
          meaning: 'to be',
          present: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
          past: ['sono stato', 'sei stato', 'è stato', 'siamo stati', 'siete stati', 'sono stati'],
          future: ['sarò', 'sarai', 'sarà', 'saremo', 'sarete', 'saranno']
        },
        avere: {
          meaning: 'to have',
          present: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
          past: ['ho avuto', 'hai avuto', 'ha avuto', 'abbiamo avuto', 'avete avuto', 'hanno avuto'],
          future: ['avrò', 'avrai', 'avrà', 'avremo', 'avrete', 'avranno']
        }
      },
      pronouns: ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro']
    }
  };

  const pronounLabels = ['I', 'You (informal)', 'He/She/It', 'We', 'You (formal)', 'They'];

  // DOM Elements
  const languageSelect = document.getElementById('languageSelect');
  const tenseSelect = document.getElementById('tenseSelect');
  const verbInput = document.getElementById('verbInput');
  const conjugateBtn = document.getElementById('conjugateBtn');
  const conjugationCard = document.getElementById('conjugationCard');
  const verbInfinitive = document.getElementById('verbInfinitive');
  const verbMeaning = document.getElementById('verbMeaning');
  const tenseLabel = document.getElementById('tenseLabel');
  const verbChips = document.getElementById('verbChips');

  // Practice elements
  const practiceView = document.getElementById('practiceView');
  const practiceSection = document.querySelector('.practice-section');
  const startPracticeBtn = document.getElementById('startPracticeBtn');
  const exitPracticeBtn = document.getElementById('exitPracticeBtn');
  const practiceVerb = document.getElementById('practiceVerb');
  const practiceForm = document.getElementById('practiceForm');
  const practiceAnswer = document.getElementById('practiceAnswer');
  const checkAnswerBtn = document.getElementById('checkAnswerBtn');
  const practiceFeedback = document.getElementById('practiceFeedback');
  const correctCount = document.getElementById('correctCount');
  const totalCount = document.getElementById('totalCount');

  // State
  let currentLanguage = 'spanish';
  let currentTense = 'present';
  let currentVerb = 'hablar';
  let practiceCorrect = 0;
  let practiceTotal = 0;
  let currentPracticeData = null;

  // Display conjugation
  function displayConjugation(verb) {
    const langData = verbsDB[currentLanguage];
    const verbData = langData.verbs[verb];

    if (!verbData) {
      alert('Verb not found in database');
      return;
    }

    currentVerb = verb;
    verbInfinitive.textContent = verb;
    verbMeaning.textContent = verbData.meaning;
    tenseLabel.textContent = `${currentTense.charAt(0).toUpperCase() + currentTense.slice(1)} Tense`;

    const conjugations = verbData[currentTense];
    for (let i = 0; i < 6; i++) {
      document.getElementById(`conj${i + 1}`).textContent = conjugations[i];
    }
  }

  // Render verb chips
  function renderVerbChips() {
    const verbs = Object.keys(verbsDB[currentLanguage].verbs);
    verbChips.innerHTML = '';
    verbs.forEach(verb => {
      const chip = document.createElement('span');
      chip.className = 'verb-chip';
      chip.textContent = verb;
      chip.addEventListener('click', () => {
        verbInput.value = verb;
        displayConjugation(verb);
      });
      verbChips.appendChild(chip);
    });
  }

  // Event listeners
  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    renderVerbChips();
    const firstVerb = Object.keys(verbsDB[currentLanguage].verbs)[0];
    displayConjugation(firstVerb);
  });

  tenseSelect.addEventListener('change', (e) => {
    currentTense = e.target.value;
    displayConjugation(currentVerb);
  });

  conjugateBtn.addEventListener('click', () => {
    const verb = verbInput.value.toLowerCase().trim();
    if (verb) displayConjugation(verb);
  });

  verbInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const verb = verbInput.value.toLowerCase().trim();
      if (verb) displayConjugation(verb);
    }
  });

  // Practice mode
  function getRandomPractice() {
    const verbs = Object.keys(verbsDB[currentLanguage].verbs);
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const tenses = ['present', 'past', 'future'];
    const tense = tenses[Math.floor(Math.random() * tenses.length)];
    const personIndex = Math.floor(Math.random() * 6);

    const verbData = verbsDB[currentLanguage].verbs[verb];
    const pronouns = verbsDB[currentLanguage].pronouns;

    return {
      verb,
      tense,
      personIndex,
      pronoun: pronouns[personIndex],
      answer: verbData[tense][personIndex]
    };
  }

  function showPracticeQuestion() {
    currentPracticeData = getRandomPractice();
    practiceVerb.textContent = currentPracticeData.verb;
    practiceForm.textContent = `(${currentPracticeData.pronoun} - ${currentPracticeData.tense})`;
    practiceAnswer.value = '';
    practiceFeedback.textContent = '';
    practiceFeedback.className = 'practice-feedback';
    practiceAnswer.focus();
  }

  startPracticeBtn.addEventListener('click', () => {
    practiceSection.style.display = 'none';
    conjugationCard.style.display = 'none';
    document.querySelector('.verb-search').style.display = 'none';
    document.querySelector('.verb-list').style.display = 'none';
    practiceView.style.display = 'block';
    practiceCorrect = 0;
    practiceTotal = 0;
    correctCount.textContent = '0';
    totalCount.textContent = '0';
    showPracticeQuestion();
  });

  exitPracticeBtn.addEventListener('click', () => {
    practiceView.style.display = 'none';
    practiceSection.style.display = 'block';
    conjugationCard.style.display = 'block';
    document.querySelector('.verb-search').style.display = 'flex';
    document.querySelector('.verb-list').style.display = 'block';
  });

  function checkAnswer() {
    const userAnswer = practiceAnswer.value.toLowerCase().trim();
    const correct = currentPracticeData.answer.toLowerCase();

    practiceTotal++;
    totalCount.textContent = practiceTotal;

    if (userAnswer === correct) {
      practiceCorrect++;
      correctCount.textContent = practiceCorrect;
      practiceFeedback.className = 'practice-feedback correct';
      practiceFeedback.textContent = 'Correct!';
    } else {
      practiceFeedback.className = 'practice-feedback incorrect';
      practiceFeedback.textContent = `Incorrect. The answer is: ${currentPracticeData.answer}`;
    }

    setTimeout(showPracticeQuestion, 1500);
  }

  checkAnswerBtn.addEventListener('click', checkAnswer);
  practiceAnswer.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  // Initialize
  renderVerbChips();
  displayConjugation('hablar');
});
