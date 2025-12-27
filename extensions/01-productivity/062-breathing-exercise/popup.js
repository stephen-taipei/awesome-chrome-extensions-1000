// Breathing Exercise - Popup Script

const techniques = {
  box: {
    name: '方塊呼吸',
    phases: [
      { name: '吸氣', duration: 4 },
      { name: '屏息', duration: 4 },
      { name: '呼氣', duration: 4 },
      { name: '屏息', duration: 4 }
    ]
  },
  relaxing: {
    name: '放鬆呼吸',
    phases: [
      { name: '吸氣', duration: 4 },
      { name: '屏息', duration: 7 },
      { name: '呼氣', duration: 8 }
    ]
  },
  energizing: {
    name: '活力呼吸',
    phases: [
      { name: '深吸', duration: 6 },
      { name: '快呼', duration: 2 }
    ]
  },
  calming: {
    name: '平靜呼吸',
    phases: [
      { name: '吸氣', duration: 5 },
      { name: '屏息', duration: 5 },
      { name: '呼氣', duration: 5 },
      { name: '屏息', duration: 5 }
    ]
  }
};

class BreathingExercise {
  constructor() {
    this.selectedTechnique = 'box';
    this.isRunning = false;
    this.cycleCount = 0;
    this.currentPhaseIndex = 0;
    this.phaseTimer = null;
    this.countdownTimer = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.breathCircle = document.getElementById('breathCircle');
    this.breathInstruction = document.getElementById('breathInstruction');
    this.counter = document.getElementById('counter');
    this.cycleCountEl = document.getElementById('cycleCount');
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
  }

  bindEvents() {
    document.querySelectorAll('.technique-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isRunning) return;
        document.querySelectorAll('.technique-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedTechnique = btn.dataset.technique;
      });
    });

    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());
  }

  async loadData() {
    const result = await chrome.storage.local.get('breathingData');
    if (result.breathingData) {
      this.cycleCount = result.breathingData.totalCycles || 0;
    }
    this.updateCycleDisplay();
  }

  async saveData() {
    await chrome.storage.local.set({
      breathingData: { totalCycles: this.cycleCount }
    });
  }

  start() {
    this.isRunning = true;
    this.currentPhaseIndex = 0;

    this.startBtn.classList.add('hidden');
    this.stopBtn.classList.remove('hidden');

    document.querySelectorAll('.technique-btn').forEach(btn => {
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    });

    this.runPhase();
  }

  stop() {
    this.isRunning = false;

    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.startBtn.classList.remove('hidden');
    this.stopBtn.classList.add('hidden');

    document.querySelectorAll('.technique-btn').forEach(btn => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    });

    this.breathCircle.classList.remove('inhale', 'hold', 'exhale');
    this.breathCircle.style.animation = 'none';
    this.breathInstruction.textContent = '開始';
    this.counter.textContent = '-';

    this.saveData();
  }

  runPhase() {
    if (!this.isRunning) return;

    const technique = techniques[this.selectedTechnique];
    const phase = technique.phases[this.currentPhaseIndex];

    // Update UI
    this.breathInstruction.textContent = phase.name;
    this.counter.textContent = phase.duration;

    // Update circle animation
    this.breathCircle.classList.remove('inhale', 'hold', 'exhale');
    this.breathCircle.style.animation = 'none';
    void this.breathCircle.offsetWidth; // Trigger reflow

    if (phase.name.includes('吸')) {
      this.breathCircle.classList.add('inhale');
      this.breathCircle.style.animation = `expand ${phase.duration}s ease-in-out forwards`;
    } else if (phase.name.includes('呼')) {
      this.breathCircle.classList.add('exhale');
      this.breathCircle.style.animation = `contract ${phase.duration}s ease-in-out forwards`;
    } else {
      this.breathCircle.classList.add('hold');
    }

    // Countdown
    let remaining = phase.duration;
    this.countdownTimer = setInterval(() => {
      remaining--;
      this.counter.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.countdownTimer);
      }
    }, 1000);

    // Next phase
    this.phaseTimer = setTimeout(() => {
      this.currentPhaseIndex++;

      if (this.currentPhaseIndex >= technique.phases.length) {
        // Completed one cycle
        this.currentPhaseIndex = 0;
        this.cycleCount++;
        this.updateCycleDisplay();
      }

      if (this.isRunning) {
        this.runPhase();
      }
    }, phase.duration * 1000);
  }

  updateCycleDisplay() {
    this.cycleCountEl.textContent = this.cycleCount;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new BreathingExercise();
});
