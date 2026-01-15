document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const resultDiv = document.getElementById('result');
  const historyList = document.getElementById('history-list');

  let history = [];

  // Conversion factors to base units
  const lengthToMeters = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.344,
    yd: 0.9144,
    ft: 0.3048,
    in: 0.0254
  };

  const weightToKg = {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
    oz: 0.0283495,
    ton: 1000
  };

  const unitNames = {
    m: 'meters', km: 'kilometers', cm: 'centimeters', mm: 'millimeters',
    mi: 'miles', yd: 'yards', ft: 'feet', in: 'inches',
    kg: 'kilograms', g: 'grams', mg: 'milligrams',
    lb: 'pounds', oz: 'ounces', ton: 'metric tons',
    c: '°C', f: '°F', k: 'K'
  };

  // Load history
  chrome.storage.local.get(['conversionHistory'], (data) => {
    if (data.conversionHistory) {
      history = data.conversionHistory;
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

  // Convert buttons
  document.querySelectorAll('.convert-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      convert(type);
    });
  });

  function convert(type) {
    const value = parseFloat(document.getElementById(`${type}-value`).value);
    const from = document.getElementById(`${type}-from`).value;
    const to = document.getElementById(`${type}-to`).value;

    if (isNaN(value)) {
      resultDiv.textContent = 'Please enter a valid number';
      resultDiv.className = 'result';
      return;
    }

    let result;

    if (type === 'length') {
      const meters = value * lengthToMeters[from];
      result = meters / lengthToMeters[to];
    } else if (type === 'weight') {
      const kg = value * weightToKg[from];
      result = kg / weightToKg[to];
    } else if (type === 'temp') {
      result = convertTemperature(value, from, to);
    }

    const formattedResult = formatNumber(result);
    resultDiv.textContent = `${value} ${unitNames[from]} = ${formattedResult} ${unitNames[to]}`;
    resultDiv.className = 'result success';

    addToHistory(value, from, formattedResult, to);
  }

  function convertTemperature(value, from, to) {
    // Convert to Celsius first
    let celsius;
    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * 5/9;
    else if (from === 'k') celsius = value - 273.15;

    // Convert from Celsius to target
    if (to === 'c') return celsius;
    else if (to === 'f') return celsius * 9/5 + 32;
    else if (to === 'k') return celsius + 273.15;
  }

  function formatNumber(num) {
    if (Math.abs(num) < 0.0001 || Math.abs(num) >= 1000000) {
      return num.toExponential(4);
    }
    return Number.isInteger(num) ? num : parseFloat(num.toFixed(6));
  }

  function addToHistory(value, from, result, to) {
    history.unshift({
      text: `${value} ${unitNames[from]} = ${result} ${unitNames[to]}`,
      time: Date.now()
    });
    if (history.length > 5) history.pop();
    chrome.storage.local.set({ conversionHistory: history });
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = history.map(item =>
      `<li>${item.text}</li>`
    ).join('');
  }
});
