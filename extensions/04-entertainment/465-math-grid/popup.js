let level = 1, best = 0, solution = [];

chrome.storage.local.get(['mathGridBest'], r => { best = r.mathGridBest || 0; document.getElementById('best').textContent = best; });

function generatePuzzle() {
  solution = [];
  for (let i = 0; i < 9; i++) solution.push(Math.floor(Math.random() * 9) + 1);
  const rowSums = [solution[0] + solution[1] + solution[2], solution[3] + solution[4] + solution[5], solution[6] + solution[7] + solution[8]];
  const colSums = [solution[0] + solution[3] + solution[6], solution[1] + solution[4] + solution[7], solution[2] + solution[5] + solution[8]];
  const revealed = Math.max(9 - level * 2, 2);
  const indices = [0,1,2,3,4,5,6,7,8].sort(() => Math.random() - 0.5).slice(0, revealed);
  renderGrid(rowSums, colSums, indices);
}

function renderGrid(rowSums, colSums, revealed) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (col === 3 && row < 3) { cell.classList.add('sum'); cell.textContent = rowSums[row]; }
      else if (row === 3 && col < 3) { cell.classList.add('sum'); cell.textContent = colSums[col]; }
      else if (row < 3 && col < 3) {
        const idx = row * 3 + col;
        if (revealed.includes(idx)) { cell.textContent = solution[idx]; cell.dataset.value = solution[idx]; }
        else { const input = document.createElement('input'); input.type = 'number'; input.min = 1; input.max = 9; input.dataset.idx = idx; cell.appendChild(input); }
      }
      grid.appendChild(cell);
    }
  }
  document.getElementById('message').textContent = '';
}

function checkSolution() {
  const inputs = document.querySelectorAll('.cell input');
  let correct = true;
  inputs.forEach(inp => { if (parseInt(inp.value) !== solution[parseInt(inp.dataset.idx)]) correct = false; });
  if (correct) {
    level++;
    document.getElementById('level').textContent = level;
    if (level > best) { best = level; chrome.storage.local.set({ mathGridBest: best }); document.getElementById('best').textContent = best; }
    document.getElementById('message').textContent = 'Correct! Next level...';
    setTimeout(generatePuzzle, 1000);
  } else {
    document.getElementById('message').textContent = 'Not quite right. Try again!';
  }
}

document.getElementById('checkBtn').addEventListener('click', checkSolution);
generatePuzzle();
