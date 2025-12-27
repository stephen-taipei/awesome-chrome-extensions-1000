// Pitch Deck Notes - Popup Script

class PitchDeckNotes {
  constructor() {
    this.pitches = [];
    this.currentNotes = {
      problem: '',
      solution: '',
      market: '',
      traction: '',
      ask: ''
    };
    this.currentSection = 'problem';
    this.sections = {
      problem: { icon: '💡', name: 'Problem' },
      solution: { icon: '🚀', name: 'Solution' },
      market: { icon: '📊', name: 'Market' },
      traction: { icon: '📈', name: 'Traction' },
      ask: { icon: '💰', name: 'The Ask' }
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.sectionBtns = document.querySelectorAll('.section-btn');
    this.sectionIconEl = document.getElementById('sectionIcon');
    this.sectionNameEl = document.getElementById('sectionName');
    this.notesEl = document.getElementById('notes');
    this.saveBtn = document.getElementById('saveNotes');
    this.copyBtn = document.getElementById('copyAll');
    this.listEl = document.getElementById('pitchList');
  }

  bindEvents() {
    this.sectionBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchSection(btn.dataset.section));
    });
    this.notesEl.addEventListener('input', () => this.updateCurrentNotes());
    this.saveBtn.addEventListener('click', () => this.savePitch());
    this.copyBtn.addEventListener('click', () => this.copyAll());
  }

  async loadData() {
    const result = await chrome.storage.local.get(['pitchDecks', 'currentPitchNotes']);
    if (result.pitchDecks) {
      this.pitches = result.pitchDecks;
    }
    if (result.currentPitchNotes) {
      this.currentNotes = result.currentPitchNotes;
    }
    this.updateUI();
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({
      pitchDecks: this.pitches,
      currentPitchNotes: this.currentNotes
    });
  }

  switchSection(section) {
    this.currentSection = section;
    this.sectionBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });
    this.updateUI();
  }

  updateUI() {
    const section = this.sections[this.currentSection];
    this.sectionIconEl.textContent = section.icon;
    this.sectionNameEl.textContent = section.name;
    this.notesEl.value = this.currentNotes[this.currentSection] || '';
  }

  updateCurrentNotes() {
    this.currentNotes[this.currentSection] = this.notesEl.value;
    this.saveData();
  }

  formatAllNotes() {
    let output = '🎯 PITCH DECK NOTES\n';
    output += '═'.repeat(35) + '\n\n';

    Object.entries(this.sections).forEach(([key, section]) => {
      output += `${section.icon} ${section.name.toUpperCase()}\n`;
      output += '─'.repeat(25) + '\n';
      output += (this.currentNotes[key] || '(No notes)') + '\n\n';
    });

    return output.trim();
  }

  async copyAll() {
    const text = this.formatAllNotes();
    await navigator.clipboard.writeText(text);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  savePitch() {
    const hasContent = Object.values(this.currentNotes).some(v => v.trim());
    if (!hasContent) return;

    const pitch = {
      id: Date.now(),
      notes: { ...this.currentNotes },
      created: Date.now()
    };

    this.pitches.unshift(pitch);
    if (this.pitches.length > 10) {
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
      this.currentNotes = { ...pitch.notes };
      this.updateUI();
      this.saveData();
    }
  }

  deletePitch(id) {
    this.pitches = this.pitches.filter(p => p.id !== id);
    this.saveData();
    this.render();
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.pitches.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved pitches</div>';
      return;
    }

    this.listEl.innerHTML = this.pitches.map(p => `
      <div class="pitch-item">
        <div>
          <div class="pitch-name">Pitch ${this.formatDate(p.created)}</div>
          <div class="pitch-date">Saved ${this.formatDate(p.created)}</div>
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

document.addEventListener('DOMContentLoaded', () => new PitchDeckNotes());
