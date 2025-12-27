// Unit Converter - Popup Script

const UNITS = {
  length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    names: { mm: 'Millimeter', cm: 'Centimeter', m: 'Meter', km: 'Kilometer', in: 'Inch', ft: 'Foot', yd: 'Yard', mi: 'Mile' },
    references: [
      { value: '1 in', result: '2.54 cm' },
      { value: '1 ft', result: '30.48 cm' },
      { value: '1 mi', result: '1.609 km' },
      { value: '1 m', result: '3.281 ft' }
    ]
  },
  weight: {
    units: ['mg', 'g', 'kg', 'oz', 'lb', 'st'],
    toBase: { mg: 0.001, g: 1, kg: 1000, oz: 28.3495, lb: 453.592, st: 6350.29 },
    names: { mg: 'Milligram', g: 'Gram', kg: 'Kilogram', oz: 'Ounce', lb: 'Pound', st: 'Stone' },
    references: [
      { value: '1 lb', result: '0.454 kg' },
      { value: '1 kg', result: '2.205 lb' },
      { value: '1 oz', result: '28.35 g' },
      { value: '1 st', result: '6.35 kg' }
    ]
  },
  temp: {
    units: ['C', 'F', 'K'],
    names: { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' },
    references: [
      { value: '0°C', result: '32°F' },
      { value: '100°C', result: '212°F' },
      { value: '°F to °C', result: '(F-32)×5/9' },
      { value: '°C to °F', result: 'C×9/5+32' }
    ]
  },
  volume: {
    units: ['ml', 'l', 'gal', 'qt', 'pt', 'cup', 'fl oz'],
    toBase: { ml: 0.001, l: 1, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588, 'fl oz': 0.0295735 },
    names: { ml: 'Milliliter', l: 'Liter', gal: 'Gallon', qt: 'Quart', pt: 'Pint', cup: 'Cup', 'fl oz': 'Fluid Ounce' },
    references: [
      { value: '1 gal', result: '3.785 l' },
      { value: '1 l', result: '0.264 gal' },
      { value: '1 cup', result: '237 ml' },
      { value: '1 fl oz', result: '29.6 ml' }
    ]
  }
};

class UnitConverter {
  constructor() {
    this.currentCategory = 'length';
    this.initElements();
    this.bindEvents();
    this.loadCategory('length');
  }

  initElements() {
    this.tabs = document.querySelectorAll('.tab');
    this.fromValueEl = document.getElementById('fromValue');
    this.fromUnitEl = document.getElementById('fromUnit');
    this.toValueEl = document.getElementById('toValue');
    this.toUnitEl = document.getElementById('toUnit');
    this.referenceListEl = document.getElementById('referenceList');
  }

  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.loadCategory(tab.dataset.category));
    });
    this.fromValueEl.addEventListener('input', () => this.convert());
    this.fromUnitEl.addEventListener('change', () => this.convert());
    this.toUnitEl.addEventListener('change', () => this.convert());
  }

  loadCategory(category) {
    this.currentCategory = category;
    const data = UNITS[category];

    // Update tabs
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Populate unit dropdowns
    const options = data.units.map(u => `<option value="${u}">${u}</option>`).join('');
    this.fromUnitEl.innerHTML = options;
    this.toUnitEl.innerHTML = options;

    // Set defaults
    if (data.units.length >= 2) {
      this.fromUnitEl.value = data.units[0];
      this.toUnitEl.value = data.units[data.units.length > 3 ? 3 : 1];
    }

    // Clear values
    this.fromValueEl.value = '';
    this.toValueEl.value = '';

    // Update references
    this.renderReferences(data.references);
  }

  convert() {
    const value = parseFloat(this.fromValueEl.value);
    if (isNaN(value)) {
      this.toValueEl.value = '';
      return;
    }

    const from = this.fromUnitEl.value;
    const to = this.toUnitEl.value;
    const category = this.currentCategory;

    let result;
    if (category === 'temp') {
      result = this.convertTemperature(value, from, to);
    } else {
      const data = UNITS[category];
      const inBase = value * data.toBase[from];
      result = inBase / data.toBase[to];
    }

    this.toValueEl.value = this.formatNumber(result);
  }

  convertTemperature(value, from, to) {
    // Convert to Celsius first
    let celsius;
    switch (from) {
      case 'C': celsius = value; break;
      case 'F': celsius = (value - 32) * 5 / 9; break;
      case 'K': celsius = value - 273.15; break;
    }

    // Convert from Celsius to target
    switch (to) {
      case 'C': return celsius;
      case 'F': return celsius * 9 / 5 + 32;
      case 'K': return celsius + 273.15;
    }
  }

  formatNumber(num) {
    if (Math.abs(num) < 0.01 || Math.abs(num) >= 10000) {
      return num.toExponential(4);
    }
    return parseFloat(num.toFixed(6)).toString();
  }

  renderReferences(references) {
    this.referenceListEl.innerHTML = references.map(ref => `
      <div class="reference-item">
        <div class="reference-value">${ref.value}</div>
        <div class="reference-label">= ${ref.result}</div>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => new UnitConverter());
