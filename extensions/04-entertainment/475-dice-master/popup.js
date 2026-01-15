let score = 0, streak = 0, target = 7, rolling = false;

function init() {
  chrome.storage.local.get(['diceMasterScore'], (r) => {
    score = r.diceMasterScore || 0;
    document.getElementById('score').textContent = score;
  });
  newTarget();
}

function newTarget() {
  target = Math.floor(Math.random() * 11) + 2;
  document.getElementById('target').textContent = target;
  document.getElementById('result').textContent = '';
  document.getElementById('result').className = 'result';
}

function rollDice() {
  if (rolling) return;
  rolling = true;
  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  die1.classList.add('rolling');
  die2.classList.add('rolling');
  let count = 0;
  const interval = setInterval(() => {
    die1.textContent = Math.floor(Math.random() * 6) + 1;
    die2.textContent = Math.floor(Math.random() * 6) + 1;
    count++;
    if (count >= 10) {
      clearInterval(interval);
      const v1 = Math.floor(Math.random() * 6) + 1;
      const v2 = Math.floor(Math.random() * 6) + 1;
      die1.textContent = v1;
      die2.textContent = v2;
      die1.classList.remove('rolling');
      die2.classList.remove('rolling');
      checkResult(v1 + v2);
      rolling = false;
    }
  }, 50);
}

function checkResult(total) {
  const result = document.getElementById('result');
  if (total === target) {
    streak++;
    score += 10 * streak;
    result.textContent = `HIT! +${10 * streak} points`;
    result.className = 'result win';
  } else {
    streak = 0;
    result.textContent = `Rolled ${total} - Miss!`;
    result.className = 'result lose';
  }
  document.getElementById('score').textContent = score;
  document.getElementById('streak').textContent = streak;
  chrome.storage.local.set({ diceMasterScore: score });
}

document.getElementById('roll').addEventListener('click', rollDice);
document.getElementById('newTarget').addEventListener('click', newTarget);
init();
