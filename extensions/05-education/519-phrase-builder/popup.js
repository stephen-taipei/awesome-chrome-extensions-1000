document.addEventListener('DOMContentLoaded', () => {
  // Phrase database
  const phrases = {
    everyday: [
      { phrase: 'Break a leg', meaning: 'Good luck! (used before a performance)', example: 'Break a leg on your presentation today!', usage: 'Informal, friendly encouragement' },
      { phrase: 'Piece of cake', meaning: 'Something very easy to do', example: 'The test was a piece of cake.', usage: 'Casual conversation' },
      { phrase: 'Hit the hay', meaning: 'Go to bed', example: "I'm tired, I think I'll hit the hay.", usage: 'Informal, among friends/family' },
      { phrase: 'Under the weather', meaning: 'Feeling slightly ill', example: "I'm feeling under the weather today.", usage: 'Polite way to say you're not feeling well' },
      { phrase: 'Cost an arm and a leg', meaning: 'Very expensive', example: 'That new car costs an arm and a leg.', usage: 'Expressing high prices' },
      { phrase: 'On the same page', meaning: 'In agreement, having the same understanding', example: 'Let me make sure we are on the same page.', usage: 'Confirming mutual understanding' }
    ],
    business: [
      { phrase: 'Touch base', meaning: 'Make contact, check in briefly', example: "Let's touch base next week about the project.", usage: 'Professional meetings/emails' },
      { phrase: 'Think outside the box', meaning: 'Think creatively, unconventionally', example: 'We need to think outside the box for this campaign.', usage: 'Brainstorming sessions' },
      { phrase: 'Get the ball rolling', meaning: 'Start a process or activity', example: "Let's get the ball rolling on this initiative.", usage: 'Starting projects' },
      { phrase: 'Bring to the table', meaning: 'Contribute something of value', example: 'What skills can you bring to the table?', usage: 'Discussions about contributions' },
      { phrase: 'Win-win situation', meaning: 'Outcome beneficial to all parties', example: 'This partnership creates a win-win situation.', usage: 'Negotiations and partnerships' },
      { phrase: 'Cut to the chase', meaning: 'Get to the main point quickly', example: "Let me cut to the chase - we need more funding.", usage: 'When time is limited' }
    ],
    academic: [
      { phrase: 'Food for thought', meaning: 'Something worth thinking about', example: 'The professor gave us some food for thought.', usage: 'Academic discussions' },
      { phrase: 'In a nutshell', meaning: 'Summarized briefly', example: 'In a nutshell, the theory explains gravity.', usage: 'Summarizing complex topics' },
      { phrase: 'Back to square one', meaning: 'Starting over from the beginning', example: 'The experiment failed, so we are back to square one.', usage: 'Research setbacks' },
      { phrase: 'The bottom line', meaning: 'The most important point', example: 'The bottom line is that we need more data.', usage: 'Concluding arguments' },
      { phrase: 'Learning curve', meaning: 'Rate of progress in learning', example: 'There is a steep learning curve with this software.', usage: 'Discussing skill acquisition' },
      { phrase: 'Rule of thumb', meaning: 'A general guideline', example: 'As a rule of thumb, cite all sources.', usage: 'Giving practical advice' }
    ],
    social: [
      { phrase: 'Break the ice', meaning: 'Initiate conversation in a social setting', example: 'He told a joke to break the ice.', usage: 'Meeting new people' },
      { phrase: 'Hit it off', meaning: 'Immediately get along well', example: 'They really hit it off at the party.', usage: 'Describing new friendships' },
      { phrase: 'On cloud nine', meaning: 'Extremely happy', example: "She's been on cloud nine since the engagement.", usage: 'Expressing extreme happiness' },
      { phrase: 'Spill the beans', meaning: 'Reveal a secret', example: 'Who spilled the beans about the surprise party?', usage: 'Informal conversations' },
      { phrase: 'Keep in touch', meaning: 'Maintain contact', example: "It was great seeing you - let's keep in touch!", usage: 'Saying goodbye' },
      { phrase: 'Rain check', meaning: 'Postpone plans to another time', example: "Can I take a rain check on dinner?", usage: 'Rescheduling plans' }
    ]
  };

  // DOM Elements
  const catBtns = document.querySelectorAll('.cat-btn');
  const phraseText = document.getElementById('phraseText');
  const phraseMeaning = document.getElementById('phraseMeaning');
  const phraseExample = document.getElementById('phraseExample');
  const phraseUsage = document.getElementById('phraseUsage');
  const speakBtn = document.getElementById('speakBtn');
  const prevBtn = document.getElementById('prevBtn');
  const randomBtn = document.getElementById('randomBtn');
  const nextBtn = document.getElementById('nextBtn');
  const practicePrompt = document.getElementById('practicePrompt');
  const practiceOptions = document.getElementById('practiceOptions');
  const practiceFeedback = document.getElementById('practiceFeedback');
  const newPracticeBtn = document.getElementById('newPracticeBtn');
  const savedList = document.getElementById('savedList');
  const savedCount = document.getElementById('savedCount');
  const saveBtn = document.getElementById('saveBtn');
  const saveIcon = document.getElementById('saveIcon');
  const copyBtn = document.getElementById('copyBtn');

  // State
  let currentCategory = 'everyday';
  let currentIndex = 0;
  let currentPhrase = null;
  let saved = [];

  // Load saved
  chrome.storage.local.get(['phraseBuilderSaved'], (result) => {
    saved = result.phraseBuilderSaved || [];
    updateSaved();
  });

  // Save data
  function saveData() {
    chrome.storage.local.set({ phraseBuilderSaved: saved });
  }

  // Display phrase
  function displayPhrase(index) {
    const phraseList = phrases[currentCategory];
    currentIndex = index;
    currentPhrase = phraseList[index];

    phraseText.textContent = currentPhrase.phrase;
    phraseMeaning.textContent = currentPhrase.meaning;
    phraseExample.textContent = currentPhrase.example;
    phraseUsage.textContent = currentPhrase.usage;

    // Update save button
    const isSaved = saved.some(p => p.phrase === currentPhrase.phrase);
    saveIcon.textContent = isSaved ? '★' : '☆';
    saveBtn.classList.toggle('saved', isSaved);
  }

  // Generate practice
  function generatePractice() {
    const allPhrases = Object.values(phrases).flat();
    const randomPhrase = allPhrases[Math.floor(Math.random() * allPhrases.length)];

    // Create blank prompt
    const words = randomPhrase.phrase.split(' ');
    const blankIndex = Math.floor(Math.random() * words.length);
    const answer = words[blankIndex];
    words[blankIndex] = '<span class="blank">_____</span>';

    practicePrompt.innerHTML = words.join(' ');

    // Generate options
    const options = [answer];
    while (options.length < 4) {
      const randomWord = allPhrases[Math.floor(Math.random() * allPhrases.length)]
        .phrase.split(' ')[Math.floor(Math.random() * 3)];
      if (randomWord && !options.includes(randomWord)) {
        options.push(randomWord);
      }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    practiceOptions.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'practice-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => checkAnswer(btn, opt === answer, answer));
      practiceOptions.appendChild(btn);
    });

    practiceFeedback.textContent = '';
    practiceFeedback.className = 'practice-feedback';
  }

  // Check answer
  function checkAnswer(btn, isCorrect, correctAnswer) {
    document.querySelectorAll('.practice-option').forEach(opt => {
      opt.classList.add('disabled');
      opt.style.pointerEvents = 'none';
      if (opt.textContent === correctAnswer) {
        opt.classList.add('correct');
      }
    });

    if (isCorrect) {
      practiceFeedback.className = 'practice-feedback correct';
      practiceFeedback.textContent = 'Correct!';
    } else {
      btn.classList.add('wrong');
      practiceFeedback.className = 'practice-feedback wrong';
      practiceFeedback.textContent = `The answer was: ${correctAnswer}`;
    }
  }

  // Update saved list
  function updateSaved() {
    savedCount.textContent = saved.length;

    if (saved.length === 0) {
      savedList.innerHTML = '<p style="color:#666;font-size:12px;text-align:center;">No saved phrases</p>';
      return;
    }

    savedList.innerHTML = '';
    saved.slice(0, 5).forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'saved-item';
      div.innerHTML = `
        <span class="saved-phrase">${item.phrase}</span>
        <button class="saved-remove" data-index="${index}">&times;</button>
      `;
      div.addEventListener('click', (e) => {
        if (!e.target.classList.contains('saved-remove')) {
          currentPhrase = item;
          phraseText.textContent = item.phrase;
          phraseMeaning.textContent = item.meaning;
          phraseExample.textContent = item.example;
          phraseUsage.textContent = item.usage;
        }
      });
      div.querySelector('.saved-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        saved.splice(index, 1);
        saveData();
        updateSaved();
        if (currentPhrase && currentPhrase.phrase === item.phrase) {
          saveIcon.textContent = '☆';
          saveBtn.classList.remove('saved');
        }
      });
      savedList.appendChild(div);
    });
  }

  // Event listeners
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      currentIndex = 0;
      displayPhrase(0);
    });
  });

  prevBtn.addEventListener('click', () => {
    const list = phrases[currentCategory];
    currentIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    displayPhrase(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    const list = phrases[currentCategory];
    currentIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    displayPhrase(currentIndex);
  });

  randomBtn.addEventListener('click', () => {
    const list = phrases[currentCategory];
    currentIndex = Math.floor(Math.random() * list.length);
    displayPhrase(currentIndex);
  });

  speakBtn.addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(currentPhrase.phrase);
    speechSynthesis.speak(utterance);
  });

  newPracticeBtn.addEventListener('click', generatePractice);

  saveBtn.addEventListener('click', () => {
    if (!currentPhrase) return;
    const index = saved.findIndex(p => p.phrase === currentPhrase.phrase);
    if (index === -1) {
      saved.push(currentPhrase);
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

  copyBtn.addEventListener('click', () => {
    if (!currentPhrase) return;
    const text = `${currentPhrase.phrase}\n${currentPhrase.meaning}\nExample: ${currentPhrase.example}`;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span> Copy';
      }, 1500);
    });
  });

  // Initialize
  displayPhrase(0);
  generatePractice();
});
