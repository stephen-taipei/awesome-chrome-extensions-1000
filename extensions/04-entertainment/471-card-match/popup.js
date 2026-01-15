const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸'];
let cards = [], flipped = [], matched = 0, moves = 0, locked = false;

function init() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  flipped = []; matched = 0; moves = 0; locked = false;
  document.getElementById('moves').textContent = '0';
  cards.forEach((sym, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span class="face">${sym}</span>`;
    card.addEventListener('click', () => flipCard(card, i));
    grid.appendChild(card);
  });
  loadBest();
}

function flipCard(card, index) {
  if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  flipped.push({ card, index });
  if (flipped.length === 2) {
    moves++;
    document.getElementById('moves').textContent = moves;
    locked = true;
    setTimeout(checkMatch, 600);
  }
}

function checkMatch() {
  const [a, b] = flipped;
  if (cards[a.index] === cards[b.index]) {
    a.card.classList.add('matched');
    b.card.classList.add('matched');
    matched += 2;
    if (matched === cards.length) saveBest();
  } else {
    a.card.classList.remove('flipped');
    b.card.classList.remove('flipped');
  }
  flipped = [];
  locked = false;
}

function loadBest() {
  chrome.storage.local.get(['cardMatchBest'], (r) => {
    document.getElementById('best').textContent = r.cardMatchBest || '-';
  });
}

function saveBest() {
  chrome.storage.local.get(['cardMatchBest'], (r) => {
    if (!r.cardMatchBest || moves < r.cardMatchBest) {
      chrome.storage.local.set({ cardMatchBest: moves });
      document.getElementById('best').textContent = moves;
    }
  });
}

document.getElementById('restart').addEventListener('click', init);
init();
