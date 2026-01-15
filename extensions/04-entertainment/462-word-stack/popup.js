const words = ['STACK', 'BLOCK', 'TOWER', 'BUILD', 'CLIMB', 'SMART', 'BRAIN', 'QUICK', 'SPELL', 'WORDS'];
let currentWord = '', stack = [], score = 0, best = 0;

chrome.storage.local.get(['wordStackBest'], r => { best = r.wordStackBest || 0; document.getElementById('best').textContent = best; });

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function newRound() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  document.getElementById('targetWord').textContent = 'Spell: ' + currentWord;
  stack = [];
  renderStack();
  const letters = shuffle([...currentWord, ...shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ').slice(0, 3)]);
  const lettersDiv = document.getElementById('letters');
  lettersDiv.innerHTML = '';
  letters.forEach((l, i) => {
    const div = document.createElement('div');
    div.className = 'letter';
    div.textContent = l;
    div.dataset.index = i;
    div.addEventListener('click', () => addToStack(l, div));
    lettersDiv.appendChild(div);
  });
}

function addToStack(letter, el) {
  if (el.classList.contains('used')) return;
  stack.push(letter);
  el.classList.add('used');
  el.style.opacity = '0.4';
  renderStack();
  checkWord();
}

function renderStack() {
  const stackDiv = document.getElementById('stack');
  stackDiv.innerHTML = stack.map(l => `<div class="letter stacked">${l}</div>`).join('');
}

function checkWord() {
  const formed = stack.join('');
  if (formed === currentWord) {
    score += currentWord.length * 10;
    document.getElementById('score').textContent = score;
    if (score > best) { best = score; chrome.storage.local.set({ wordStackBest: best }); document.getElementById('best').textContent = best; }
    setTimeout(newRound, 500);
  } else if (formed.length >= currentWord.length) {
    stack = [];
    renderStack();
    document.querySelectorAll('.letter').forEach(el => { el.classList.remove('used'); el.style.opacity = '1'; });
  }
}

document.getElementById('clearBtn').addEventListener('click', () => {
  stack = [];
  renderStack();
  document.querySelectorAll('.letter').forEach(el => { el.classList.remove('used'); el.style.opacity = '1'; });
});

newRound();
