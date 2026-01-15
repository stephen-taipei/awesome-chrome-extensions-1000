let totalScore = 0, bestScore = 0, currentGame = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['finalChallengeBest', 'finalChallengeTotal']);
  bestScore = data.finalChallengeBest || 0;
  totalScore = data.finalChallengeTotal || 0;
  updateScores();
  document.querySelectorAll('.game-btn').forEach(btn => btn.addEventListener('click', () => startGame(btn.dataset.game)));
  document.getElementById('backBtn').addEventListener('click', showMenu);
}

function updateScores() {
  document.getElementById('totalScore').textContent = totalScore;
  document.getElementById('bestScore').textContent = bestScore;
}

function showMenu() {
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('gameArea').classList.add('hidden');
  document.getElementById('result').classList.add('hidden');
  document.getElementById('backBtn').classList.add('hidden');
}

function startGame(game) {
  currentGame = game;
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('gameArea').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');
  document.getElementById('backBtn').classList.remove('hidden');
  const area = document.getElementById('gameArea');
  if (game === 'reaction') startReaction(area);
  else if (game === 'memory') startMemory(area);
  else if (game === 'math') startMath(area);
  else if (game === 'sequence') startSequence(area);
}

function addScore(points) {
  totalScore += points;
  if (points > bestScore) { bestScore = points; }
  chrome.storage.local.set({ finalChallengeTotal: totalScore, finalChallengeBest: bestScore });
  updateScores();
}

function startReaction(area) {
  area.innerHTML = '<div class="reaction-box" style="background:#333">Wait for green...</div>';
  const box = area.querySelector('.reaction-box');
  let startTime, clicked = false;
  const delay = 1500 + Math.random() * 3000;
  setTimeout(() => {
    if (clicked) return;
    box.style.background = '#1dd1a1';
    box.textContent = 'CLICK!';
    startTime = Date.now();
    box.onclick = () => {
      const time = Date.now() - startTime;
      const points = Math.max(0, Math.floor(500 - time));
      showResult(`Reaction: ${time}ms | +${points} points`);
      addScore(points);
    };
  }, delay);
  box.onclick = () => { clicked = true; showResult('Too early! +0 points'); };
}

function startMemory(area) {
  const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎸'];
  const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  let flipped = [], matched = 0, moves = 0;
  area.innerHTML = '<div class="memory-grid"></div>';
  const grid = area.querySelector('.memory-grid');
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.addEventListener('click', () => flipCard(card));
    grid.appendChild(card);
  });
  function flipCard(card) {
    if (flipped.length >= 2 || card.classList.contains('flipped')) return;
    card.classList.add('flipped');
    card.textContent = card.dataset.emoji;
    flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
        matched += 2; flipped = [];
        if (matched === 16) { const pts = Math.max(10, 200 - moves * 5); showResult(`Memory: ${moves} moves | +${pts} points`); addScore(pts); }
      } else { setTimeout(() => { flipped.forEach(c => { c.classList.remove('flipped'); c.textContent = ''; }); flipped = []; }, 800); }
    }
  }
}

function startMath(area) {
  let correct = 0, round = 0;
  nextQuestion();
  function nextQuestion() {
    if (round >= 5) { const pts = correct * 20; showResult(`Math: ${correct}/5 correct | +${pts} points`); addScore(pts); return; }
    const a = Math.floor(Math.random() * 20) + 1, b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const options = [answer, answer + Math.floor(Math.random() * 10) - 5, answer + Math.floor(Math.random() * 10) + 1].filter((v, i, a) => a.indexOf(v) === i);
    while (options.length < 3) options.push(answer + options.length * 2);
    options.sort(() => Math.random() - 0.5);
    area.innerHTML = `<div class="math-display">${a} ${op} ${b} = ?</div><div class="math-options">${options.map(o => `<div class="math-btn" data-val="${o}">${o}</div>`).join('')}</div>`;
    area.querySelectorAll('.math-btn').forEach(btn => btn.addEventListener('click', () => { if (+btn.dataset.val === answer) correct++; round++; nextQuestion(); }));
  }
}

function startSequence(area) {
  let sequence = [], playerSeq = [], round = 0;
  area.innerHTML = '<div class="sequence-display"><div class="seq-btn"></div><div class="seq-btn"></div><div class="seq-btn"></div><div class="seq-btn"></div></div><p style="margin-top:15px">Watch the pattern!</p>';
  const btns = area.querySelectorAll('.seq-btn');
  nextRound();
  function nextRound() {
    playerSeq = [];
    sequence.push(Math.floor(Math.random() * 4));
    round++;
    playSequence();
  }
  function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
      if (i > 0) btns[sequence[i - 1]].classList.remove('active');
      if (i >= sequence.length) { clearInterval(interval); enableInput(); return; }
      btns[sequence[i]].classList.add('active');
      i++;
    }, 600);
  }
  function enableInput() {
    btns.forEach((btn, i) => btn.onclick = () => {
      playerSeq.push(i);
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 200);
      if (playerSeq[playerSeq.length - 1] !== sequence[playerSeq.length - 1]) { const pts = (round - 1) * 15; showResult(`Sequence: Round ${round - 1} | +${pts} points`); addScore(pts); return; }
      if (playerSeq.length === sequence.length) setTimeout(nextRound, 500);
    });
  }
}

function showResult(msg) { const r = document.getElementById('result'); r.textContent = msg; r.classList.remove('hidden'); }
