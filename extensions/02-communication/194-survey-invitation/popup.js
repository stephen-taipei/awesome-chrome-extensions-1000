// Survey Invitation - Popup Script
class SurveyInvitation {
  constructor() { this.invitations = []; this.initElements(); this.bindEvents(); this.loadData(); }
  initElements() {
    this.typeEl = document.getElementById('surveyType'); this.recipientEl = document.getElementById('recipient');
    this.surveyNameEl = document.getElementById('surveyName'); this.purposeEl = document.getElementById('purpose');
    this.durationEl = document.getElementById('duration'); this.incentiveEl = document.getElementById('incentive');
    this.copyBtn = document.getElementById('copyInvitation'); this.saveBtn = document.getElementById('saveInvitation');
    this.listEl = document.getElementById('invitationList');
  }
  bindEvents() { this.copyBtn.addEventListener('click', () => this.copyInvitation()); this.saveBtn.addEventListener('click', () => this.saveInvitation()); }
  async loadData() { const result = await chrome.storage.local.get('surveyInvitations'); if (result.surveyInvitations) this.invitations = result.surveyInvitations; this.render(); }
  async saveData() { await chrome.storage.local.set({ surveyInvitations: this.invitations }); }
  getTypeLabel(type) { const labels = { customer: 'Customer', employee: 'Employee', product: 'Product', research: 'Research', nps: 'NPS', event: 'Event' }; return labels[type] || type; }
  formatInvitation() {
    const recipient = this.recipientEl.value.trim(); const surveyName = this.surveyNameEl.value.trim();
    const purpose = this.purposeEl.value.trim(); const duration = this.durationEl.value.trim(); const incentive = this.incentiveEl.value.trim();
    let inv = `Dear${recipient ? ` ${recipient}` : ''},\n\nWe value your opinion and would love to hear from you!\n\n`;
    if (surveyName) inv += `We invite you to participate in our ${surveyName}.\n\n`;
    if (purpose) inv += `Purpose: ${purpose}\n\n`;
    if (duration) inv += `⏱️ Time Required: ${duration}\n\n`;
    if (incentive) inv += `🎁 Incentive: ${incentive}\n\n`;
    inv += 'Your feedback helps us improve and serve you better. Thank you for your time!\n\nBest regards';
    return inv;
  }
  async copyInvitation() { await navigator.clipboard.writeText(this.formatInvitation()); const original = this.copyBtn.textContent; this.copyBtn.textContent = 'Copied!'; setTimeout(() => { this.copyBtn.textContent = original; }, 1500); }
  saveInvitation() {
    const surveyName = this.surveyNameEl.value.trim(); if (!surveyName) return;
    this.invitations.unshift({ id: Date.now(), type: this.typeEl.value, recipient: this.recipientEl.value.trim(), surveyName, purpose: this.purposeEl.value.trim(), duration: this.durationEl.value.trim(), incentive: this.incentiveEl.value.trim(), created: Date.now() });
    if (this.invitations.length > 15) this.invitations.pop(); this.saveData(); this.render();
    const original = this.saveBtn.textContent; this.saveBtn.textContent = 'Saved!'; setTimeout(() => { this.saveBtn.textContent = original; }, 1500);
  }
  loadInvitation(id) { const inv = this.invitations.find(i => i.id === id); if (inv) { this.typeEl.value = inv.type || 'customer'; this.recipientEl.value = inv.recipient || ''; this.surveyNameEl.value = inv.surveyName || ''; this.purposeEl.value = inv.purpose || ''; this.durationEl.value = inv.duration || ''; this.incentiveEl.value = inv.incentive || ''; } }
  deleteInvitation(id) { this.invitations = this.invitations.filter(i => i.id !== id); this.saveData(); this.render(); }
  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  truncate(text, len = 25) { return (!text || text.length <= len) ? (text || '') : text.substring(0, len) + '...'; }
  render() {
    if (this.invitations.length === 0) { this.listEl.innerHTML = '<div class="empty-state">No saved invitations</div>'; return; }
    this.listEl.innerHTML = this.invitations.map(i => `<div class="invitation-item"><div class="invitation-info"><div class="invitation-name">${this.escapeHtml(this.truncate(i.surveyName))}</div><div class="invitation-type">${this.getTypeLabel(i.type)}</div></div><div class="invitation-actions"><button class="load-btn" data-load="${i.id}">Load</button><button class="delete-btn" data-delete="${i.id}">Del</button></div></div>`).join('');
    this.listEl.querySelectorAll('[data-load]').forEach(btn => btn.addEventListener('click', () => this.loadInvitation(parseInt(btn.dataset.load))));
    this.listEl.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => this.deleteInvitation(parseInt(btn.dataset.delete))));
  }
}
document.addEventListener('DOMContentLoaded', () => new SurveyInvitation());
