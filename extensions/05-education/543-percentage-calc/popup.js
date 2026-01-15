document.addEventListener('DOMContentLoaded', () => {
  let history = [];

  // Load history
  chrome.storage.local.get(['percentHistory'], (data) => {
    if (data.percentHistory) {
      history = data.percentHistory;
      renderHistory();
    }
  });

  // Calculation buttons
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const calc = btn.dataset.calc;
      calculate(calc);
    });
  });

  // Enter key support
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const section = input.closest('.calc-section');
        section.querySelector('.calc-btn').click();
      }
    });
  });

  // Clear history
  document.getElementById('clear-history').addEventListener('click', () => {
    history = [];
    chrome.storage.local.set({ percentHistory: history });
    renderHistory();
  });

  function calculate(type) {
    let result, expression;
    const resultDiv = document.getElementById(`result${type}`);

    switch(type) {
      case '1': {
        // X% of Y
        const percent = parseFloat(document.getElementById('percent1').value);
        const value = parseFloat(document.getElementById('value1').value);

        if (isNaN(percent) || isNaN(value)) {
          showError(resultDiv, 'Enter both values');
          return;
        }

        result = (percent / 100) * value;
        expression = `${percent}% of ${value} = ${formatNumber(result)}`;
        break;
      }
      case '2': {
        // X is what % of Y
        const part = parseFloat(document.getElementById('part2').value);
        const whole = parseFloat(document.getElementById('whole2').value);

        if (isNaN(part) || isNaN(whole)) {
          showError(resultDiv, 'Enter both values');
          return;
        }

        if (whole === 0) {
          showError(resultDiv, 'Cannot divide by zero');
          return;
        }

        result = (part / whole) * 100;
        expression = `${part} is ${formatNumber(result)}% of ${whole}`;
        break;
      }
      case '3': {
        // Percentage change
        const from = parseFloat(document.getElementById('from3').value);
        const to = parseFloat(document.getElementById('to3').value);

        if (isNaN(from) || isNaN(to)) {
          showError(resultDiv, 'Enter both values');
          return;
        }

        if (from === 0) {
          showError(resultDiv, 'Initial value cannot be zero');
          return;
        }

        result = ((to - from) / Math.abs(from)) * 100;
        const direction = result >= 0 ? 'increase' : 'decrease';
        expression = `${from} → ${to}: ${formatNumber(Math.abs(result))}% ${direction}`;
        break;
      }
      case '4': {
        // Increase/decrease by %
        const value = parseFloat(document.getElementById('value4').value);
        const percent = parseFloat(document.getElementById('percent4').value);
        const operation = document.getElementById('operation4').value;

        if (isNaN(value) || isNaN(percent)) {
          showError(resultDiv, 'Enter both values');
          return;
        }

        if (operation === 'increase') {
          result = value * (1 + percent / 100);
          expression = `${value} + ${percent}% = ${formatNumber(result)}`;
        } else {
          result = value * (1 - percent / 100);
          expression = `${value} - ${percent}% = ${formatNumber(result)}`;
        }
        break;
      }
    }

    resultDiv.textContent = expression.split(' = ')[1] || formatNumber(result);
    resultDiv.className = 'result';
    addToHistory(expression);
  }

  function showError(element, message) {
    element.textContent = message;
    element.className = 'result error';
  }

  function formatNumber(num) {
    if (Number.isInteger(num)) return num;
    return parseFloat(num.toFixed(4));
  }

  function addToHistory(expression) {
    history.unshift({ expression, time: Date.now() });
    if (history.length > 10) history.pop();
    chrome.storage.local.set({ percentHistory: history });
    renderHistory();
  }

  function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = history.map(item =>
      `<li>${item.expression}</li>`
    ).join('');
  }
});
