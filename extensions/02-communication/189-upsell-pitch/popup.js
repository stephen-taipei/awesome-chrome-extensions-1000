// Upsell Pitch - Popup Script

class UpsellPitch {
  constructor() {
    this.pitches = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.typeEl = document.getElementById('pitchType');
    this.customerEl = document.getElementById('customer');
    this.currentPlanEl = document.getElementById('currentPlan');
    this.upgradeEl = document.getElementById('upgrade');
    this.benefitsEl = document.getElementById('benefits');
    this.pricingEl = document.getElementById('pricing');
    this.copyBtn = document.getElementById('copyPitch');
    this.saveBtn = document.getElementById('savePitch');
    this.listEl = document.getElementById('pitchList');
  }

  bindEvents() {
    this.copyBtn.addEventListener('click', () => this.copyPitch());
    this.saveBtn.addEventListener('click', () => this.savePitch());
  }

  async loadData() {
    const result = await chrome.storage.local.get('upsellPitches');
    if (result.upsellPitches) {
      this.pitches = result.upsellPitches;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ upsellPitches: this.pitches });
  }

  getTypeLabel(type) {
    const labels = {
      upgrade: 'Upgrade',
      addon: 'Add-on',
      premium: 'Premium',
      bundle: 'Bundle',
      service: 'Service',
      annual: 'Annual'
    };
    return labels[type] || type;
  }

  formatPitch() {
    const customer = this.customerEl.value.trim();
    const currentPlan = this.currentPlanEl.value.trim();
    const upgrade = this.upgradeEl.value.trim();
    const benefits = this.benefitsEl.value.trim();
    const pricing = this.pricingEl.value.trim();

    let pitch = `Hi${customer ? ` ${customer}` : ''},\n\n`;
    pitch += 'I hope you\'re enjoying your experience with us!\n\n';

    if (currentPlan) {
      pitch += `Based on your use of ${currentPlan}, I think you\'d love what we have to offer.\n\n`;
    }

    if (upgrade) {
      pitch += `⭐ I\'d like to introduce you to ${upgrade}.\n\n`;
    }

    if (benefits) {
      pitch += `Key Benefits:\n${benefits}\n\n`;
    }

    if (pricing) {
      pitch += `💰 Special Offer: ${pricing}\n\n`;
    }

    pitch += 'Would you be interested in learning more? I\'d be happy to schedule a quick call to walk you through the details.\n\n';
    pitch += 'Best regards';

    return pitch;
  }

  async copyPitch() {
    const text = this.formatPitch();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  savePitch() {
    const customer = this.customerEl.value.trim();
    if (!customer) return;

    const pitch = {
      id: Date.now(),
      type: this.typeEl.value,
      customer,
      currentPlan: this.currentPlanEl.value.trim(),
      upgrade: this.upgradeEl.value.trim(),
      benefits: this.benefitsEl.value.trim(),
      pricing: this.pricingEl.value.trim(),
      created: Date.now()
    };

    this.pitches.unshift(pitch);
    if (this.pitches.length > 15) {
      this.pitches.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  loadPitch(id) {
    const pitch = this.pitches.find(p => p.id === id);
    if (pitch) {
      this.typeEl.value = pitch.type || 'upgrade';
      this.customerEl.value = pitch.customer || '';
      this.currentPlanEl.value = pitch.currentPlan || '';
      this.upgradeEl.value = pitch.upgrade || '';
      this.benefitsEl.value = pitch.benefits || '';
      this.pricingEl.value = pitch.pricing || '';
    }
  }

  deletePitch(id) {
    this.pitches = this.pitches.filter(p => p.id !== id);
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
    if (this.pitches.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved pitches</div>';
      return;
    }

    this.listEl.innerHTML = this.pitches.map(p => `
      <div class="pitch-item">
        <div class="pitch-info">
          <div class="pitch-customer">${this.escapeHtml(this.truncate(p.customer))}</div>
          <div class="pitch-type">${this.getTypeLabel(p.type)}</div>
        </div>
        <div class="pitch-actions">
          <button class="load-btn" data-load="${p.id}">Load</button>
          <button class="delete-btn" data-delete="${p.id}">Del</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadPitch(parseInt(btn.dataset.load)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePitch(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new UpsellPitch());
