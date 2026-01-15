document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const resultDiv = document.getElementById('result');
  const historyList = document.getElementById('history-list');

  let history = [];

  // Load history from storage
  chrome.storage.local.get(['mathHistory'], (data) => {
    if (data.mathHistory) {
      history = data.mathHistory;
      renderHistory();
    }
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
      resultDiv.textContent = '';
      resultDiv.className = 'result';
    });
  });

  // Solve linear equation: ax + b = c => x = (c - b) / a
  document.getElementById('solve-linear').addEventListener('click', () => {
    const a = parseFloat(document.getElementById('linear-a').value);
    const b = parseFloat(document.getElementById('linear-b').value);
    const c = parseFloat(document.getElementById('linear-c').value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      showResult('Please enter all values', 'error');
      return;
    }

    if (a === 0) {
      if (b === c) {
        showResult('Infinite solutions (any x works)', 'success');
      } else {
        showResult('No solution', 'error');
      }
      return;
    }

    const x = (c - b) / a;
    const equation = `${a}x + ${b} = ${c}`;
    showResult(`x = ${formatNumber(x)}`, 'success');
    addToHistory(equation, `x = ${formatNumber(x)}`);
  });

  // Solve quadratic equation: ax² + bx + c = 0
  document.getElementById('solve-quadratic').addEventListener('click', () => {
    const a = parseFloat(document.getElementById('quad-a').value);
    const b = parseFloat(document.getElementById('quad-b').value);
    const c = parseFloat(document.getElementById('quad-c').value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      showResult('Please enter all values', 'error');
      return;
    }

    if (a === 0) {
      showResult('Not a quadratic (a cannot be 0)', 'error');
      return;
    }

    const discriminant = b * b - 4 * a * c;
    const equation = `${a}x² + ${b}x + ${c} = 0`;

    if (discriminant > 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      const result = `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`;
      showResult(result, 'success');
      addToHistory(equation, result);
    } else if (discriminant === 0) {
      const x = -b / (2 * a);
      const result = `x = ${formatNumber(x)} (double root)`;
      showResult(result, 'success');
      addToHistory(equation, result);
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      const result = `x = ${formatNumber(realPart)} ± ${formatNumber(imagPart)}i`;
      showResult(result, 'success');
      addToHistory(equation, result);
    }
  });

  // Clear history
  document.getElementById('clear-history').addEventListener('click', () => {
    history = [];
    chrome.storage.local.set({ mathHistory: history });
    renderHistory();
  });

  function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.className = `result ${type}`;
  }

  function formatNumber(num) {
    return Number.isInteger(num) ? num : num.toFixed(4).replace(/\.?0+$/, '');
  }

  function addToHistory(equation, result) {
    history.unshift({ equation, result, time: Date.now() });
    if (history.length > 10) history.pop();
    chrome.storage.local.set({ mathHistory: history });
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = history.map(item =>
      `<li>${item.equation} <span>${item.result}</span></li>`
    ).join('');
  }
});
