// Product Description - Popup Script

class ProductDescription {
  constructor() {
    this.products = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.nameEl = document.getElementById('productName');
    this.taglineEl = document.getElementById('tagline');
    this.featuresEl = document.getElementById('features');
    this.benefitsEl = document.getElementById('benefits');
    this.ctaEl = document.getElementById('cta');
    this.copyBtn = document.getElementById('copyDesc');
    this.saveBtn = document.getElementById('saveProduct');
    this.listEl = document.getElementById('productList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyDesc());
    this.saveBtn.addEventListener('click', () => this.saveProduct());
  }

  async loadData() {
    const result = await chrome.storage.local.get('productDescriptions');
    if (result.productDescriptions) {
      this.products = result.productDescriptions;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ productDescriptions: this.products });
  }

  formatDesc() {
    const name = this.nameEl.value.trim();
    const tagline = this.taglineEl.value.trim();
    const features = this.featuresEl.value.trim();
    const benefits = this.benefitsEl.value.trim();
    const cta = this.ctaEl.value.trim();

    let desc = '';

    if (name) {
      desc += `✨ ${name}\n`;
    }

    if (tagline) {
      desc += `${tagline}\n`;
    }

    desc += '\n';

    if (features) {
      desc += '🎯 Key Features:\n';
      features.split('\n').forEach(f => {
        if (f.trim()) desc += `• ${f.trim()}\n`;
      });
      desc += '\n';
    }

    if (benefits) {
      desc += '💫 Why You\'ll Love It:\n';
      desc += `${benefits}\n\n`;
    }

    if (cta) {
      desc += `👉 ${cta}`;
    }

    return desc;
  }

  async copyDesc() {
    const text = this.formatDesc();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveProduct() {
    const name = this.nameEl.value.trim();
    if (!name) return;

    const product = {
      id: Date.now(),
      name,
      tagline: this.taglineEl.value.trim(),
      features: this.featuresEl.value.trim(),
      benefits: this.benefitsEl.value.trim(),
      cta: this.ctaEl.value.trim(),
      created: Date.now()
    };

    this.products.unshift(product);
    if (this.products.length > 15) {
      this.products.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.nameEl.value = product.name || '';
      this.taglineEl.value = product.tagline || '';
      this.featuresEl.value = product.features || '';
      this.benefitsEl.value = product.benefits || '';
      this.ctaEl.value = product.cta || '';
    }
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncate(text, len = 25) {
    if (!text || text.length <= len) return text || '';
    return text.substring(0, len) + '...';
  }

  render() {
    if (this.products.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved products</div>';
      return;
    }

    this.listEl.innerHTML = this.products.map(p => `
      <div class="product-item">
        <div class="product-info">
          <div class="product-name">${this.escapeHtml(p.name)}</div>
          ${p.tagline ? `<div class="product-tagline">${this.escapeHtml(this.truncate(p.tagline))}</div>` : ''}
        </div>
        <div class="product-actions">
          <button class="load-btn" data-load="${p.id}">Load</button>
          <button class="delete-btn" data-delete="${p.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadProduct(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteProduct(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ProductDescription());
