const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'];
let score = 0, best = 0, spinning = [false, false, false], reelValues = [0, 0, 0];

chrome.storage.local.get(['spinMatchBest'], r => { best = r.spinMatchBest || 0; document.getElementById('best').textContent = best; });

function spinReel(idx) {
  if (!spinning[idx]) return;
  reelValues[idx] = (reelValues[idx] + 1) % symbols.length;
  document.getElementById(`reel${idx + 1}`).textContent = symbols[reelValues[idx]];
  setTimeout(() => spinReel(idx), 80);
}

function startSpin() {
  document.getElementById('message').textContent = '';
  spinning = [true, true, true];
  spinReel(0); spinReel(1); spinReel(2);
  document.getElementById('spinBtn').textContent = 'STOP';
  document.getElementById('spinBtn').onclick = stopSpin;
}

function stopSpin() {
  const stopNext = (idx) => {
    spinning[idx] = false;
    if (idx < 2) setTimeout(() => stopNext(idx + 1), 300);
    else checkResult();
  };
  stopNext(0);
}

function checkResult() {
  document.getElementById('spinBtn').textContent = 'SPIN';
  document.getElementById('spinBtn').onclick = startSpin;
  const vals = [reelValues[0], reelValues[1], reelValues[2]];
  let win = 0, msg = '';
  if (vals[0] === vals[1] && vals[1] === vals[2]) {
    win = symbols[vals[0]] === '💎' ? 100 : symbols[vals[0]] === '7️⃣' ? 77 : 50;
    msg = `JACKPOT! +${win}`;
  } else if (vals[0] === vals[1] || vals[1] === vals[2] || vals[0] === vals[2]) {
    win = 10;
    msg = `Match! +${win}`;
  } else {
    msg = 'Try again!';
  }
  score += win;
  document.getElementById('score').textContent = score;
  document.getElementById('message').textContent = msg;
  if (score > best) { best = score; chrome.storage.local.set({ spinMatchBest: best }); document.getElementById('best').textContent = best; }
}

[1, 2, 3].forEach(i => document.getElementById(`reel${i}`).textContent = symbols[0]);
document.getElementById('spinBtn').onclick = startSpin;
