document.addEventListener('DOMContentLoaded', () => {
  const gridEl = document.getElementById('grid');
  const wordsListEl = document.getElementById('words-list');
  const foundEl = document.getElementById('found');
  const totalEl = document.getElementById('total');
  const bestEl = document.getElementById('best');
  const newGameBtn = document.getElementById('new-game');

  const allWords = ['CAT', 'DOG', 'SUN', 'RUN', 'FUN', 'CAR', 'BAT', 'HAT', 'RAT', 'MAP', 'CUP', 'BUS', 'PEN', 'BOX', 'FOX', 'COW', 'OWL', 'BEE', 'ANT', 'KEY'];
  const size = 8;
  let grid = [], words = [], foundWords = [], selected = [], best = 0;

  const loadBest = () => chrome.storage.local.get(['wordFinderBest'], r => { best = r.wordFinderBest || 0; bestEl.textContent = best; });
  const saveBest = () => { if (foundWords.length > best) { best = foundWords.length; chrome.storage.local.set({ wordFinderBest: best }); bestEl.textContent = best; } };

  const placeWord = (word) => {
    const dirs = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0]];
    for (let attempt = 0; attempt < 50; attempt++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const startX = Math.floor(Math.random() * size), startY = Math.floor(Math.random() * size);
      let canPlace = true, positions = [];
      for (let i = 0; i < word.length; i++) {
        const x = startX + dir[0] * i, y = startY + dir[1] * i;
        if (x < 0 || x >= size || y < 0 || y >= size) { canPlace = false; break; }
        if (grid[y][x] !== '' && grid[y][x] !== word[i]) { canPlace = false; break; }
        positions.push({ x, y, char: word[i] });
      }
      if (canPlace) { positions.forEach(p => grid[p.y][p.x] = p.char); return true; }
    }
    return false;
  };

  const generatePuzzle = () => {
    grid = Array(size).fill(null).map(() => Array(size).fill(''));
    words = []; foundWords = []; selected = [];
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    for (let w of shuffled) { if (words.length < 5 && placeWord(w)) words.push(w); }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (grid[y][x] === '') grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    totalEl.textContent = words.length; foundEl.textContent = 0;
    render();
  };

  const render = () => {
    gridEl.innerHTML = ''; gridEl.style.gridTemplateColumns = `repeat(${size}, 32px)`;
    grid.forEach((row, y) => row.forEach((char, x) => {
      const cell = document.createElement('div');
      cell.className = 'cell'; cell.textContent = char; cell.dataset.x = x; cell.dataset.y = y;
      cell.addEventListener('mousedown', () => startSelect(x, y));
      cell.addEventListener('mouseenter', (e) => { if (e.buttons === 1) addSelect(x, y); });
      cell.addEventListener('mouseup', checkWord);
      gridEl.appendChild(cell);
    }));
    wordsListEl.innerHTML = '';
    words.forEach(w => { const tag = document.createElement('span'); tag.className = 'word-tag' + (foundWords.includes(w) ? ' found' : ''); tag.textContent = w; wordsListEl.appendChild(tag); });
  };

  const startSelect = (x, y) => { selected = [{ x, y }]; updateSelection(); };
  const addSelect = (x, y) => { if (!selected.find(s => s.x === x && s.y === y)) { selected.push({ x, y }); updateSelection(); } };
  const updateSelection = () => { document.querySelectorAll('.cell').forEach(c => { const x = +c.dataset.x, y = +c.dataset.y; c.classList.toggle('selected', !!selected.find(s => s.x === x && s.y === y)); }); };

  const checkWord = () => {
    const word = selected.map(s => grid[s.y][s.x]).join('');
    const wordRev = word.split('').reverse().join('');
    if ((words.includes(word) || words.includes(wordRev)) && !foundWords.includes(word) && !foundWords.includes(wordRev)) {
      const found = words.includes(word) ? word : wordRev;
      foundWords.push(found); foundEl.textContent = foundWords.length; saveBest();
      selected.forEach(s => document.querySelector(`.cell[data-x="${s.x}"][data-y="${s.y}"]`).classList.add('found'));
      if (foundWords.length === words.length) setTimeout(() => { alert('All words found!'); generatePuzzle(); }, 300);
    }
    selected = []; updateSelection(); render();
  };

  newGameBtn.addEventListener('click', generatePuzzle);
  loadBest(); generatePuzzle();
});
