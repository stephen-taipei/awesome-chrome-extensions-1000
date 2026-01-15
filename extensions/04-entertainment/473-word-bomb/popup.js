const words = ['apple','brave','cloud','dance','eagle','flame','grape','heart','ivory','jolly','kayak','lemon','mango','noble','ocean','piano','queen','robot','snake','tiger','umbra','vivid','whale','xenon','yacht','zebra'];
let score = 0, timer = 5, interval = null, playing = false;

function init() {
  chrome.storage.local.get(['wordBombBest'], (r) => {
    document.getElementById('best').textContent = r.wordBombBest || 0;
  });
}

function startGame() {
  score = 0; timer = 5; playing = true;
  document.getElementById('score').textContent = '0';
  document.getElementById('bomb').textContent = '💣';
  document.getElementById('bomb').classList.remove('exploded');
  document.getElementById('start').style.display = 'none';
  document.getElementById('input').value = '';
  document.getElementById('input').focus();
  nextWord();
  startTimer();
}

function nextWord() {
  const word = words[Math.floor(Math.random() * words.length)];
  document.getElementById('word').textContent = word.toUpperCase();
  timer = Math.max(2, 5 - score * 0.2);
  document.getElementById('timer').textContent = timer.toFixed(1);
}

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    timer -= 0.1;
    document.getElementById('timer').textContent = Math.max(0, timer).toFixed(1);
    if (timer <= 0) endGame();
  }, 100);
}

function endGame() {
  clearInterval(interval);
  playing = false;
  document.getElementById('bomb').textContent = '💥';
  document.getElementById('bomb').classList.add('exploded');
  document.getElementById('word').textContent = 'BOOM!';
  document.getElementById('start').style.display = 'inline-block';
  document.getElementById('start').textContent = 'Play Again';
  chrome.storage.local.get(['wordBombBest'], (r) => {
    if (score > (r.wordBombBest || 0)) {
      chrome.storage.local.set({ wordBombBest: score });
      document.getElementById('best').textContent = score;
    }
  });
}

document.getElementById('input').addEventListener('input', (e) => {
  if (!playing) return;
  const typed = e.target.value.toUpperCase();
  const target = document.getElementById('word').textContent;
  if (typed === target) {
    score++;
    document.getElementById('score').textContent = score;
    e.target.value = '';
    nextWord();
    startTimer();
  }
});

document.getElementById('start').addEventListener('click', startGame);
init();
