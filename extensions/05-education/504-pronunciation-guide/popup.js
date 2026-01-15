document.addEventListener('DOMContentLoaded', () => {
  // Pronunciation database
  const pronunciationDB = {
    'hello': { ipa: '/həˈloʊ/', syllables: 'hel-lo', phonemes: [
      { symbol: 'h', example: 'hat' },
      { symbol: 'ə', example: 'about' },
      { symbol: 'l', example: 'leg' },
      { symbol: 'oʊ', example: 'go' }
    ], tip: 'Stress the second syllable. The "e" sounds like the "u" in "but".' },
    'world': { ipa: '/wɜːld/', syllables: 'world', phonemes: [
      { symbol: 'w', example: 'wet' },
      { symbol: 'ɜː', example: 'bird' },
      { symbol: 'l', example: 'leg' },
      { symbol: 'd', example: 'dog' }
    ], tip: 'The "or" makes an "er" sound like in "bird". Round your lips for the "w".' },
    'pronunciation': { ipa: '/prəˌnʌnsiˈeɪʃən/', syllables: 'pro-nun-ci-a-tion', phonemes: [
      { symbol: 'pr', example: 'pray' },
      { symbol: 'ə', example: 'about' },
      { symbol: 'n', example: 'no' },
      { symbol: 'ʌ', example: 'cup' },
      { symbol: 'eɪ', example: 'say' },
      { symbol: 'ʃ', example: 'she' },
      { symbol: 'ən', example: 'button' }
    ], tip: 'Stress is on the fourth syllable "-a-". Note: it\'s "nun" not "noun".' },
    'language': { ipa: '/ˈlæŋɡwɪdʒ/', syllables: 'lan-guage', phonemes: [
      { symbol: 'l', example: 'leg' },
      { symbol: 'æ', example: 'cat' },
      { symbol: 'ŋ', example: 'sing' },
      { symbol: 'ɡw', example: 'Gwen' },
      { symbol: 'ɪ', example: 'sit' },
      { symbol: 'dʒ', example: 'job' }
    ], tip: 'Stress the first syllable. The "gu" makes a "gw" sound.' },
    'beautiful': { ipa: '/ˈbjuːtɪfəl/', syllables: 'beau-ti-ful', phonemes: [
      { symbol: 'b', example: 'bad' },
      { symbol: 'juː', example: 'you' },
      { symbol: 't', example: 'tea' },
      { symbol: 'ɪ', example: 'sit' },
      { symbol: 'f', example: 'fall' },
      { symbol: 'əl', example: 'bottle' }
    ], tip: 'Stress the first syllable. "eau" makes a "you" sound.' },
    'schedule': { ipa: '/ˈskedʒuːl/', syllables: 'sched-ule', phonemes: [
      { symbol: 'sk', example: 'skip' },
      { symbol: 'e', example: 'bed' },
      { symbol: 'dʒ', example: 'job' },
      { symbol: 'uːl', example: 'pool' }
    ], tip: 'American: "SKED-jool". British: "SHED-yool". Both are correct!' },
    'comfortable': { ipa: '/ˈkʌmftəbəl/', syllables: 'comf-ta-ble', phonemes: [
      { symbol: 'k', example: 'cat' },
      { symbol: 'ʌ', example: 'cup' },
      { symbol: 'mf', example: 'triumph' },
      { symbol: 't', example: 'tea' },
      { symbol: 'ə', example: 'about' },
      { symbol: 'bəl', example: 'able' }
    ], tip: 'Only 3 syllables in casual speech. The "or" is often dropped.' },
    'necessary': { ipa: '/ˈnesəseri/', syllables: 'nec-es-sar-y', phonemes: [
      { symbol: 'n', example: 'no' },
      { symbol: 'e', example: 'bed' },
      { symbol: 's', example: 'see' },
      { symbol: 'ə', example: 'about' },
      { symbol: 's', example: 'see' },
      { symbol: 'eri', example: 'every' }
    ], tip: 'Stress the first syllable. Remember: one C, two S\'s.' }
  };

  // DOM Elements
  const wordInput = document.getElementById('wordInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultSection = document.getElementById('resultSection');
  const wordTitle = document.getElementById('wordTitle');
  const ipaText = document.getElementById('ipaText');
  const syllableText = document.getElementById('syllableText');
  const phonemes = document.getElementById('phonemes');
  const tipContent = document.getElementById('tipContent');
  const speakBtn = document.getElementById('speakBtn');
  const speedRange = document.getElementById('speedRange');
  const speedValue = document.getElementById('speedValue');
  const historyList = document.getElementById('historyList');
  const ipaTabs = document.querySelectorAll('.ipa-tab');
  const vowelsTab = document.getElementById('vowelsTab');
  const consonantsTab = document.getElementById('consonantsTab');
  const ipaItems = document.querySelectorAll('.ipa-item');

  // State
  let currentWord = '';
  let speechRate = 1;
  let history = [];

  // Load history
  chrome.storage.local.get(['pronunciationHistory'], (result) => {
    history = result.pronunciationHistory || [];
    renderHistory();
  });

  // Save history
  function saveHistory() {
    chrome.storage.local.set({ pronunciationHistory: history });
  }

  // Add to history
  function addToHistory(word) {
    history = history.filter(w => w !== word);
    history.unshift(word);
    if (history.length > 10) history.pop();
    saveHistory();
    renderHistory();
  }

  // Render history
  function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(word => {
      const span = document.createElement('span');
      span.className = 'history-item';
      span.textContent = word;
      span.addEventListener('click', () => lookupWord(word));
      historyList.appendChild(span);
    });
  }

  // Lookup word
  function lookupWord(word) {
    word = word.toLowerCase().trim();
    if (!word) return;

    currentWord = word;
    wordInput.value = word;
    addToHistory(word);

    const data = pronunciationDB[word];

    if (data) {
      wordTitle.textContent = word;
      ipaText.textContent = data.ipa;
      syllableText.textContent = data.syllables;
      tipContent.textContent = data.tip;

      phonemes.innerHTML = '';
      data.phonemes.forEach(p => {
        const div = document.createElement('div');
        div.className = 'phoneme';
        div.innerHTML = `
          <div class="phoneme-symbol">${p.symbol}</div>
          <div class="phoneme-example">as in "${p.example}"</div>
        `;
        phonemes.appendChild(div);
      });
    } else {
      wordTitle.textContent = word;
      ipaText.textContent = '(generating...)';
      syllableText.textContent = estimateSyllables(word);
      tipContent.textContent = 'Click the speaker icon to hear the pronunciation.';
      phonemes.innerHTML = '<p style="color:#888;font-size:12px;">Phonetic breakdown not available for this word.</p>';
    }

    resultSection.style.display = 'block';
  }

  // Estimate syllables
  function estimateSyllables(word) {
    const vowels = word.match(/[aeiouy]+/gi) || [];
    return word.split('').map((c, i) =>
      vowels.some(v => word.indexOf(v) === i) ? c + '-' : c
    ).join('').replace(/-$/, '').replace(/--/g, '-');
  }

  // Speak word
  function speakWord() {
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = speechRate;
    speechSynthesis.speak(utterance);
  }

  // Event listeners
  searchBtn.addEventListener('click', () => lookupWord(wordInput.value));
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') lookupWord(wordInput.value);
  });

  speakBtn.addEventListener('click', speakWord);

  speedRange.addEventListener('input', (e) => {
    speechRate = parseFloat(e.target.value);
    speedValue.textContent = `${speechRate.toFixed(1)}x`;
  });

  // IPA tabs
  ipaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ipaTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      vowelsTab.style.display = tab.dataset.tab === 'vowels' ? 'block' : 'none';
      consonantsTab.style.display = tab.dataset.tab === 'consonants' ? 'block' : 'none';
    });
  });

  // IPA item click - speak example
  ipaItems.forEach(item => {
    item.addEventListener('click', () => {
      const example = item.querySelector('span').textContent;
      const utterance = new SpeechSynthesisUtterance(example);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    });
  });
});
