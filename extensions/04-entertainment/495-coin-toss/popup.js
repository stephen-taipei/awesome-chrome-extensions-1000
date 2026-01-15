let streak = 0, best = 0, history = [], isFlipping = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const data = await chrome.storage.local.get(['coinTossBest', 'coinHistory']);
  best = data.coinTossBest || 0;
  history = data.coinHistory || [];
  document.getElementById('best').textContent = best;
  updateHistory();
  document.getElementById('headsBtn').addEventListener('click', () => makeGuess('heads'));
  document.getElementById('tailsBtn').addEventListener('click', () => makeGuess('tails'));
}

function makeGuess(guess) {
  if (isFlipping) return;
  isFlipping = true;
  const coin = document.getElementById('coin');
  const result = document.getElementById('result');
  const btns = document.querySelectorAll('.guess-btn');
  btns.forEach(b => b.disabled = true);
  coin.classList.add('flipping');
  result.textContent = 'Flipping...';
  result.className = 'result';
  setTimeout(() => {
    const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
    coin.classList.remove('flipping');
    coin.textContent = outcome === 'heads' ? '🪙' : '⚫';
    coin.className = 'coin ' + outcome;
    history.unshift(outcome === 'heads' ? 'H' : 'T');
    if (history.length > 10) history.pop();
    updateHistory();
    if (guess === outcome) {
      streak++;
      result.textContent = `${outcome.toUpperCase()}! Streak: ${streak}`;
      result.className = 'result win';
      if (streak > best) {
        best = streak;
        document.getElementById('best').textContent = best;
        chrome.storage.local.set({ coinTossBest: best });
      }
    } else {
      result.textContent = `${outcome.toUpperCase()}! Streak broken at ${streak}`;
      result.className = 'result lose';
      streak = 0;
    }
    document.getElementById('streak').textContent = streak;
    chrome.storage.local.set({ coinHistory: history });
    btns.forEach(b => b.disabled = false);
    isFlipping = false;
  }, 600);
}

function updateHistory() {
  const display = history.map(h => h === 'H' ? '🟡' : '⚫').join(' ');
  document.getElementById('history').textContent = display || '---';
}
