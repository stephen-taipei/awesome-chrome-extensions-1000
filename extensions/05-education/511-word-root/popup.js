document.addEventListener('DOMContentLoaded', () => {
  // Word roots database
  const rootsDB = {
    roots: [
      { root: 'bio', meaning: 'life, living', origin: 'Greek', examples: ['biology', 'biography', 'antibiotic', 'biodegradable'] },
      { root: 'graph', meaning: 'write, writing', origin: 'Greek', examples: ['autograph', 'paragraph', 'telegraph', 'biography'] },
      { root: 'phon', meaning: 'sound', origin: 'Greek', examples: ['telephone', 'phonetic', 'symphony', 'microphone'] },
      { root: 'aud', meaning: 'hear, listen', origin: 'Latin', examples: ['audience', 'audio', 'audible', 'auditorium'] },
      { root: 'vis/vid', meaning: 'see', origin: 'Latin', examples: ['vision', 'video', 'visible', 'supervise'] },
      { root: 'dict', meaning: 'say, speak', origin: 'Latin', examples: ['dictate', 'predict', 'dictionary', 'contradict'] },
      { root: 'ject', meaning: 'throw', origin: 'Latin', examples: ['project', 'reject', 'inject', 'subject'] },
      { root: 'port', meaning: 'carry', origin: 'Latin', examples: ['transport', 'export', 'import', 'portable'] },
      { root: 'scrib/script', meaning: 'write', origin: 'Latin', examples: ['describe', 'manuscript', 'prescription', 'subscribe'] },
      { root: 'chron', meaning: 'time', origin: 'Greek', examples: ['chronic', 'synchronize', 'chronology', 'anachronism'] },
      { root: 'geo', meaning: 'earth', origin: 'Greek', examples: ['geography', 'geology', 'geometry', 'geothermal'] },
      { root: 'therm', meaning: 'heat', origin: 'Greek', examples: ['thermometer', 'thermal', 'thermostat', 'hypothermia'] }
    ],
    prefixes: [
      { root: 'un-', meaning: 'not, opposite', origin: 'Old English', examples: ['unhappy', 'undo', 'unfair', 'unknown'] },
      { root: 're-', meaning: 'again, back', origin: 'Latin', examples: ['return', 'repeat', 'rebuild', 'review'] },
      { root: 'pre-', meaning: 'before', origin: 'Latin', examples: ['preview', 'prepare', 'predict', 'prefix'] },
      { root: 'mis-', meaning: 'wrong, bad', origin: 'Old English', examples: ['mistake', 'misunderstand', 'misbehave', 'mislead'] },
      { root: 'anti-', meaning: 'against', origin: 'Greek', examples: ['antibiotic', 'antisocial', 'antivirus', 'antidote'] },
      { root: 'auto-', meaning: 'self', origin: 'Greek', examples: ['automatic', 'automobile', 'autograph', 'autonomous'] },
      { root: 'bi-', meaning: 'two', origin: 'Latin', examples: ['bicycle', 'bilingual', 'binoculars', 'biweekly'] },
      { root: 'sub-', meaning: 'under, below', origin: 'Latin', examples: ['submarine', 'subway', 'subtract', 'submerge'] },
      { root: 'trans-', meaning: 'across, beyond', origin: 'Latin', examples: ['transport', 'transform', 'translate', 'transfer'] },
      { root: 'inter-', meaning: 'between, among', origin: 'Latin', examples: ['international', 'internet', 'interact', 'interview'] }
    ],
    suffixes: [
      { root: '-tion/-sion', meaning: 'act or state of', origin: 'Latin', examples: ['action', 'decision', 'creation', 'expression'] },
      { root: '-able/-ible', meaning: 'capable of', origin: 'Latin', examples: ['readable', 'visible', 'comfortable', 'flexible'] },
      { root: '-ful', meaning: 'full of', origin: 'Old English', examples: ['beautiful', 'helpful', 'peaceful', 'wonderful'] },
      { root: '-less', meaning: 'without', origin: 'Old English', examples: ['hopeless', 'careless', 'fearless', 'endless'] },
      { root: '-ment', meaning: 'state or act of', origin: 'Latin', examples: ['movement', 'government', 'development', 'agreement'] },
      { root: '-ness', meaning: 'state of being', origin: 'Old English', examples: ['happiness', 'darkness', 'kindness', 'weakness'] },
      { root: '-ly', meaning: 'in the manner of', origin: 'Old English', examples: ['quickly', 'slowly', 'happily', 'carefully'] },
      { root: '-ology', meaning: 'study of', origin: 'Greek', examples: ['biology', 'psychology', 'technology', 'geology'] },
      { root: '-er/-or', meaning: 'one who', origin: 'Latin/Old English', examples: ['teacher', 'actor', 'writer', 'doctor'] },
      { root: '-ist', meaning: 'one who practices', origin: 'Greek', examples: ['artist', 'scientist', 'pianist', 'journalist'] }
    ]
  };

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const typeTabs = document.querySelectorAll('.type-tab');
  const rootText = document.getElementById('rootText');
  const rootOrigin = document.getElementById('rootOrigin');
  const rootMeaning = document.getElementById('rootMeaning');
  const exampleWords = document.getElementById('exampleWords');
  const rootList = document.getElementById('rootList');
  const prevBtn = document.getElementById('prevBtn');
  const randomBtn = document.getElementById('randomBtn');
  const nextBtn = document.getElementById('nextBtn');
  const markLearnedBtn = document.getElementById('markLearnedBtn');
  const rootsLearned = document.getElementById('rootsLearned');
  const prefixesLearned = document.getElementById('prefixesLearned');
  const suffixesLearned = document.getElementById('suffixesLearned');

  // State
  let currentType = 'roots';
  let currentIndex = 0;
  let learned = { roots: [], prefixes: [], suffixes: [] };

  // Load learned
  chrome.storage.local.get(['wordRootLearned'], (result) => {
    learned = result.wordRootLearned || { roots: [], prefixes: [], suffixes: [] };
    updateStats();
    renderList();
  });

  // Save learned
  function saveLearned() {
    chrome.storage.local.set({ wordRootLearned: learned });
  }

  // Get current list
  function getCurrentList() {
    return rootsDB[currentType];
  }

  // Display root
  function displayRoot(index) {
    const list = getCurrentList();
    if (list.length === 0) return;

    currentIndex = index;
    const item = list[index];

    rootText.textContent = item.root;
    rootOrigin.textContent = item.origin;
    rootMeaning.textContent = item.meaning;

    exampleWords.innerHTML = '';
    item.examples.forEach(example => {
      const span = document.createElement('span');
      span.className = 'example-word';
      // Highlight the root in the example
      const highlighted = highlightRoot(example, item.root);
      span.innerHTML = highlighted;
      exampleWords.appendChild(span);
    });

    // Update mark learned button
    const isLearned = learned[currentType].includes(item.root);
    markLearnedBtn.textContent = isLearned ? 'Marked as Learned ✓' : 'Mark as Learned';
  }

  // Highlight root in word
  function highlightRoot(word, root) {
    const cleanRoot = root.replace(/[-\/]/g, '');
    const regex = new RegExp(`(${cleanRoot})`, 'gi');
    return word.replace(regex, '<span class="highlight">$1</span>');
  }

  // Render list
  function renderList(filter = '') {
    const list = getCurrentList();
    const filtered = filter
      ? list.filter(item =>
          item.root.toLowerCase().includes(filter.toLowerCase()) ||
          item.meaning.toLowerCase().includes(filter.toLowerCase())
        )
      : list;

    rootList.innerHTML = '';
    filtered.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'root-item';
      if (learned[currentType].includes(item.root)) {
        div.classList.add('learned');
      }
      div.innerHTML = `
        <span class="root-item-text">${item.root}</span>
        <span class="root-item-meaning">${item.meaning}</span>
      `;
      div.addEventListener('click', () => {
        const actualIndex = list.findIndex(r => r.root === item.root);
        displayRoot(actualIndex);
      });
      rootList.appendChild(div);
    });
  }

  // Update stats
  function updateStats() {
    rootsLearned.textContent = learned.roots.length;
    prefixesLearned.textContent = learned.prefixes.length;
    suffixesLearned.textContent = learned.suffixes.length;
  }

  // Event listeners
  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentType = tab.dataset.type;
      currentIndex = 0;
      displayRoot(0);
      renderList(searchInput.value);
    });
  });

  searchInput.addEventListener('input', (e) => {
    renderList(e.target.value);
  });

  prevBtn.addEventListener('click', () => {
    const list = getCurrentList();
    currentIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    displayRoot(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    const list = getCurrentList();
    currentIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    displayRoot(currentIndex);
  });

  randomBtn.addEventListener('click', () => {
    const list = getCurrentList();
    currentIndex = Math.floor(Math.random() * list.length);
    displayRoot(currentIndex);
  });

  markLearnedBtn.addEventListener('click', () => {
    const list = getCurrentList();
    const item = list[currentIndex];
    const index = learned[currentType].indexOf(item.root);

    if (index === -1) {
      learned[currentType].push(item.root);
      markLearnedBtn.textContent = 'Marked as Learned ✓';
    } else {
      learned[currentType].splice(index, 1);
      markLearnedBtn.textContent = 'Mark as Learned';
    }

    saveLearned();
    updateStats();
    renderList(searchInput.value);
  });

  // Initialize
  displayRoot(0);
  renderList();
});
