const gridEl = document.getElementById('grid');
const symbols = ['@', '#', '$', '%', '&', '*', '+', '='];
let cards = [], flipped = [], matched = 0, moves = 0, best = null, locked = false;

chrome.storage.local.get(['symbolMatchBest'], (r) => {
  best = r.symbolMatchBest || null;
  document.getElementById('best').textContent = best || '-';
});

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateGame() {
  cards = []; flipped = []; matched = 0; moves = 0; locked = false;
  document.getElementById('moves').textContent = moves;
  document.getElementById('message').textContent = 'Match all pairs!';
  const pairs = shuffle([...symbols, ...symbols]);
  gridEl.innerHTML = '';
  pairs.forEach((symbol, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span class="symbol">${symbol}</span>`;
    card.dataset.symbol = symbol;
    card.dataset.index = i;
    card.addEventListener('click', () => handleClick(card));
    gridEl.appendChild(card);
    cards.push(card);
  });
}

function handleClick(card) {
  if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  flipped.push(card);
  if (flipped.length === 2) {
    moves++;
    document.getElementById('moves').textContent = moves;
    locked = true;
    const [a, b] = flipped;
    if (a.dataset.symbol === b.dataset.symbol) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched += 2;
      flipped = [];
      locked = false;
      if (matched === 16) {
        document.getElementById('message').textContent = `Complete in ${moves} moves!`;
        if (best === null || moves < best) {
          best = moves;
          document.getElementById('best').textContent = best;
          chrome.storage.local.set({ symbolMatchBest: best });
        }
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flipped = [];
        locked = false;
      }, 800);
    }
  }
}

document.getElementById('newGame').addEventListener('click', generateGame);
generateGame();
