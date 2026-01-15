document.addEventListener('DOMContentLoaded', () => {
  // Word database
  const words = [
    { word: 'Serendipity', phonetic: '/ˌserənˈdipədē/', type: 'noun', definition: 'The occurrence of events by chance in a happy or beneficial way.', example: 'A fortunate stroke of serendipity brought them together.', origin: 'Coined by Horace Walpole in 1754, from the fairy tale "The Three Princes of Serendip"' },
    { word: 'Ephemeral', phonetic: '/əˈfem(ə)rəl/', type: 'adjective', definition: 'Lasting for a very short time.', example: 'The ephemeral beauty of cherry blossoms reminds us to appreciate each moment.', origin: 'From Greek ephemeros, meaning "lasting only a day"' },
    { word: 'Ubiquitous', phonetic: '/yo͞oˈbikwədəs/', type: 'adjective', definition: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern society.', origin: 'From Latin ubique, meaning "everywhere"' },
    { word: 'Eloquent', phonetic: '/ˈeləkwənt/', type: 'adjective', definition: 'Fluent or persuasive in speaking or writing.', example: 'Her eloquent speech moved the entire audience to tears.', origin: 'From Latin eloquens, meaning "speaking out"' },
    { word: 'Resilient', phonetic: '/rəˈzilyənt/', type: 'adjective', definition: 'Able to recover quickly from difficulties; tough.', example: 'Children are remarkably resilient and can adapt to new situations.', origin: 'From Latin resilire, meaning "to spring back"' },
    { word: 'Pragmatic', phonetic: '/praɡˈmadik/', type: 'adjective', definition: 'Dealing with things sensibly and realistically.', example: 'She took a pragmatic approach to solving the problem.', origin: 'From Greek pragmatikos, meaning "relating to fact"' },
    { word: 'Mellifluous', phonetic: '/məˈliflo͞oəs/', type: 'adjective', definition: 'Sweet or musical; pleasant to hear.', example: 'The singer had a mellifluous voice that captivated everyone.', origin: 'From Latin mel "honey" + fluere "to flow"' },
    { word: 'Quintessential', phonetic: '/ˌkwin(t)əˈsen(t)SHəl/', type: 'adjective', definition: 'Representing the most perfect example of a quality.', example: 'Paris is the quintessential romantic city.', origin: 'From medieval Latin quinta essentia, the "fifth essence"' },
    { word: 'Sanguine', phonetic: '/ˈsaNGɡwən/', type: 'adjective', definition: 'Optimistic or positive, especially in a difficult situation.', example: 'Despite the setbacks, she remained sanguine about the project.', origin: 'From Latin sanguineus, meaning "of blood" (believed to cause optimism)' },
    { word: 'Ineffable', phonetic: '/inˈefəb(ə)l/', type: 'adjective', definition: 'Too great or extreme to be expressed in words.', example: 'The beauty of the sunset was ineffable.', origin: 'From Latin ineffabilis, meaning "unutterable"' },
    { word: 'Perspicacious', phonetic: '/ˌpərspəˈkāSHəs/', type: 'adjective', definition: 'Having a ready insight into and understanding of things.', example: 'Her perspicacious comments revealed deep understanding.', origin: 'From Latin perspicax, meaning "sharp-sighted"' },
    { word: 'Ethereal', phonetic: '/iˈTHirēəl/', type: 'adjective', definition: 'Extremely delicate and light; heavenly.', example: 'The ethereal music seemed to float through the air.', origin: 'From Latin aether, meaning "upper air"' }
  ];

  // DOM Elements
  const currentDate = document.getElementById('currentDate');
  const wordTitle = document.getElementById('wordTitle');
  const wordPhonetic = document.getElementById('wordPhonetic');
  const wordType = document.getElementById('wordType');
  const wordDefinition = document.getElementById('wordDefinition');
  const wordExample = document.getElementById('wordExample');
  const wordOrigin = document.getElementById('wordOrigin');
  const speakBtn = document.getElementById('speakBtn');
  const saveBtn = document.getElementById('saveBtn');
  const saveIcon = document.getElementById('saveIcon');
  const shareBtn = document.getElementById('shareBtn');
  const streakCount = document.getElementById('streakCount');
  const wordsLearned = document.getElementById('wordsLearned');
  const archiveList = document.getElementById('archiveList');
  const fullArchiveList = document.getElementById('fullArchiveList');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const backBtn = document.getElementById('backBtn');
  const archiveView = document.getElementById('archiveView');
  const mainContent = document.querySelector('.word-card').parentElement;

  // State
  let todaysWord = null;
  let savedWords = [];
  let streak = 0;
  let lastVisit = null;

  // Get today's date string
  function getDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // Format date for display
  function formatDate(date = new Date()) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  // Get word of the day (deterministic based on date)
  function getWordOfDay() {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today - start) / 86400000);
    return words[dayOfYear % words.length];
  }

  // Load data
  function loadData() {
    chrome.storage.local.get(['wordOfDayData'], (result) => {
      const data = result.wordOfDayData || {};
      savedWords = data.savedWords || [];
      streak = data.streak || 0;
      lastVisit = data.lastVisit;

      // Update streak
      const today = getDateString();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (lastVisit === yesterday) {
        streak++;
      } else if (lastVisit !== today) {
        streak = 1;
      }

      lastVisit = today;
      saveData();

      displayWord();
      updateStats();
      renderArchive();
    });
  }

  // Save data
  function saveData() {
    chrome.storage.local.set({
      wordOfDayData: {
        savedWords,
        streak,
        lastVisit
      }
    });
  }

  // Display today's word
  function displayWord() {
    todaysWord = getWordOfDay();

    currentDate.textContent = formatDate();
    wordTitle.textContent = todaysWord.word;
    wordPhonetic.textContent = todaysWord.phonetic;
    wordType.textContent = todaysWord.type;
    wordDefinition.textContent = todaysWord.definition;
    wordExample.textContent = todaysWord.example;
    wordOrigin.textContent = todaysWord.origin;

    // Check if saved
    const isSaved = savedWords.some(w => w.word === todaysWord.word);
    saveIcon.textContent = isSaved ? '★' : '☆';
    saveBtn.classList.toggle('saved', isSaved);
  }

  // Update stats
  function updateStats() {
    streakCount.textContent = streak;
    wordsLearned.textContent = savedWords.length;
  }

  // Render archive
  function renderArchive(full = false) {
    const list = full ? fullArchiveList : archiveList;
    const items = full ? savedWords : savedWords.slice(0, 3);

    list.innerHTML = '';
    if (items.length === 0) {
      list.innerHTML = '<p style="color:#666;font-size:12px;text-align:center;">No saved words yet</p>';
      return;
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'archive-item';
      div.innerHTML = `
        <span class="archive-word">${item.word}</span>
        <span class="archive-date">${item.date}</span>
      `;
      div.addEventListener('click', () => {
        todaysWord = item;
        displayWord();
        if (full) {
          archiveView.style.display = 'none';
          mainContent.style.display = 'block';
        }
      });
      list.appendChild(div);
    });
  }

  // Event listeners
  speakBtn.addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(todaysWord.word);
    speechSynthesis.speak(utterance);
  });

  saveBtn.addEventListener('click', () => {
    const index = savedWords.findIndex(w => w.word === todaysWord.word);
    if (index === -1) {
      savedWords.unshift({
        ...todaysWord,
        date: formatDate()
      });
      saveIcon.textContent = '★';
      saveBtn.classList.add('saved');
    } else {
      savedWords.splice(index, 1);
      saveIcon.textContent = '☆';
      saveBtn.classList.remove('saved');
    }
    saveData();
    updateStats();
    renderArchive();
  });

  shareBtn.addEventListener('click', () => {
    const text = `📚 Word of the Day: ${todaysWord.word}\n\n${todaysWord.definition}\n\nExample: "${todaysWord.example}"`;
    navigator.clipboard.writeText(text).then(() => {
      shareBtn.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        shareBtn.innerHTML = '<span>📋</span> Copy';
      }, 1500);
    });
  });

  viewAllBtn.addEventListener('click', () => {
    mainContent.querySelectorAll('.word-card, .streak-section, .archive-section').forEach(el => {
      el.style.display = 'none';
    });
    archiveView.style.display = 'block';
    renderArchive(true);
  });

  backBtn.addEventListener('click', () => {
    archiveView.style.display = 'none';
    mainContent.querySelectorAll('.word-card, .streak-section, .archive-section').forEach(el => {
      el.style.display = '';
    });
  });

  // Initialize
  loadData();
});
