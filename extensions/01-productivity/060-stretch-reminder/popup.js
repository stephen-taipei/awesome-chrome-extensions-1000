// Stretch Reminder - Popup Script

const stretches = {
  neck: [
    { name: '頸部左傾', desc: '慢慢將頭向左傾斜，感受右側頸部伸展', icon: '🦒', duration: 15 },
    { name: '頸部右傾', desc: '慢慢將頭向右傾斜，感受左側頸部伸展', icon: '🦒', duration: 15 },
    { name: '頸部前傾', desc: '下巴靠近胸口，感受頸部後側伸展', icon: '🦒', duration: 15 },
    { name: '頸部旋轉', desc: '順時針緩慢旋轉頭部一圈', icon: '🔄', duration: 20 }
  ],
  shoulders: [
    { name: '肩膀聳起', desc: '雙肩向上聳起靠近耳朵，保持 5 秒後放鬆', icon: '💪', duration: 15 },
    { name: '肩膀後拉', desc: '雙手在背後交握，挺胸將肩膀向後拉', icon: '🙆', duration: 20 },
    { name: '手臂交叉', desc: '右手橫過胸前，左手輕壓右肘', icon: '🤗', duration: 15 }
  ],
  back: [
    { name: '貓牛式', desc: '雙手撐桌，背部先拱起再下沉', icon: '🐱', duration: 20 },
    { name: '脊椎扭轉', desc: '坐直，身體向右轉，左手放右膝', icon: '🔄', duration: 20 },
    { name: '前彎伸展', desc: '站立，慢慢彎腰讓手臂自然下垂', icon: '🙇', duration: 20 }
  ],
  wrists: [
    { name: '手腕旋轉', desc: '雙手握拳，緩慢旋轉手腕', icon: '🖐️', duration: 15 },
    { name: '手腕伸展', desc: '伸直右手，用左手輕壓手指向下', icon: '✋', duration: 15 },
    { name: '手指伸展', desc: '張開雙手，用力張開手指 5 秒', icon: '🖐️', duration: 10 }
  ],
  legs: [
    { name: '腿部伸展', desc: '站立，抬起右腳放椅上，輕壓膝蓋', icon: '🦵', duration: 20 },
    { name: '小腿伸展', desc: '雙手扶牆，一腳在前彎曲，後腳伸直', icon: '🏃', duration: 20 },
    { name: '大腿拉伸', desc: '站立抓右腳踝，腳跟靠近臀部', icon: '🦵', duration: 20 }
  ],
  full: [
    { name: '全身伸展', desc: '雙手高舉過頭，踮腳尖向上伸展', icon: '🙆', duration: 15 },
    { name: '側身伸展', desc: '雙手上舉，身體向右側彎', icon: '🤸', duration: 15 },
    { name: '深呼吸', desc: '深吸氣 4 秒，憋氣 4 秒，呼氣 4 秒', icon: '🧘', duration: 20 }
  ]
};

class StretchReminder {
  constructor() {
    this.data = {
      enabled: true,
      interval: 30,
      categories: ['neck', 'shoulders', 'back'],
      todayStretches: 0,
      totalStretches: 0,
      streak: 0,
      nextStretchTime: null,
      lastDate: null
    };
    this.currentStretches = [];
    this.currentIndex = 0;
    this.timer = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
    this.startCountdown();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.mainView = document.getElementById('mainView');
    this.stretchView = document.getElementById('stretchView');
    this.statusEmoji = document.getElementById('statusEmoji');
    this.nextStretch = document.getElementById('nextStretch');
    this.stretchNowBtn = document.getElementById('stretchNowBtn');
    this.backBtn = document.getElementById('backBtn');
    this.stretchProgress = document.getElementById('stretchProgress');
    this.stretchIcon = document.getElementById('stretchIcon');
    this.stretchName = document.getElementById('stretchName');
    this.stretchDesc = document.getElementById('stretchDesc');
    this.stretchTimer = document.getElementById('stretchTimer');
    this.skipBtn = document.getElementById('skipBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.todayStretchesEl = document.getElementById('todayStretches');
    this.totalStretchesEl = document.getElementById('totalStretches');
    this.streakEl = document.getElementById('streak');
  }

  bindEvents() {
    this.enableToggle.addEventListener('change', () => {
      this.data.enabled = this.enableToggle.checked;
      if (this.data.enabled) {
        this.scheduleNextStretch();
      }
      this.saveData();
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        this.data.categories = Array.from(document.querySelectorAll('.category-btn.selected'))
          .map(b => b.dataset.category);
        this.saveData();
      });
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.data.interval = parseInt(btn.dataset.minutes);
        this.scheduleNextStretch();
        this.saveData();
      });
    });

    this.stretchNowBtn.addEventListener('click', () => this.startStretchSession());
    this.backBtn.addEventListener('click', () => this.endSession());
    this.skipBtn.addEventListener('click', () => this.nextStretchExercise());
    this.nextBtn.addEventListener('click', () => this.nextStretchExercise());
  }

  async loadData() {
    const result = await chrome.storage.local.get('stretchReminderData');
    if (result.stretchReminderData) {
      this.data = { ...this.data, ...result.stretchReminderData };
    }

    const today = new Date().toDateString();
    if (this.data.lastDate !== today) {
      if (this.data.lastDate && this.data.todayStretches > 0) {
        this.data.streak++;
      }
      this.data.todayStretches = 0;
      this.data.lastDate = today;
    }

    this.updateUI();
    this.saveData();
  }

  async saveData() {
    await chrome.storage.local.set({
      stretchReminderData: this.data
    });
    chrome.runtime.sendMessage({
      action: 'updateData',
      data: this.data
    });
  }

  scheduleNextStretch() {
    this.data.nextStretchTime = Date.now() + (this.data.interval * 60 * 1000);
  }

  updateUI() {
    this.enableToggle.checked = this.data.enabled;

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('selected', this.data.categories.includes(btn.dataset.category));
    });

    document.querySelectorAll('.interval-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.minutes) === this.data.interval);
    });

    this.todayStretchesEl.textContent = this.data.todayStretches;
    this.totalStretchesEl.textContent = this.data.totalStretches;
    this.streakEl.textContent = this.data.streak;
  }

  startCountdown() {
    if (!this.data.nextStretchTime) {
      this.scheduleNextStretch();
    }

    setInterval(() => {
      if (!this.data.enabled) {
        this.nextStretch.textContent = '提醒已暫停';
        return;
      }

      const remaining = Math.max(0, this.data.nextStretchTime - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      if (remaining > 0) {
        this.nextStretch.textContent = `下次伸展：${minutes} 分 ${seconds} 秒後`;
      } else {
        this.nextStretch.textContent = '該伸展了！';
      }
    }, 1000);
  }

  startStretchSession() {
    this.currentStretches = [];
    this.data.categories.forEach(cat => {
      if (stretches[cat]) {
        this.currentStretches.push(...stretches[cat]);
      }
    });

    // Shuffle and take 5
    this.currentStretches = this.currentStretches
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    if (this.currentStretches.length === 0) {
      alert('請先選擇至少一個伸展部位！');
      return;
    }

    this.currentIndex = 0;
    this.mainView.classList.add('hidden');
    this.stretchView.classList.remove('hidden');
    this.showCurrentStretch();
  }

  showCurrentStretch() {
    const stretch = this.currentStretches[this.currentIndex];
    this.stretchProgress.textContent = `${this.currentIndex + 1}/${this.currentStretches.length}`;
    this.stretchIcon.textContent = stretch.icon;
    this.stretchName.textContent = stretch.name;
    this.stretchDesc.textContent = stretch.desc;
    this.stretchTimer.textContent = stretch.duration;

    if (this.timer) clearInterval(this.timer);

    let remaining = stretch.duration;
    this.timer = setInterval(() => {
      remaining--;
      this.stretchTimer.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.timer);
        this.nextStretchExercise();
      }
    }, 1000);
  }

  nextStretchExercise() {
    if (this.timer) clearInterval(this.timer);

    this.currentIndex++;
    if (this.currentIndex >= this.currentStretches.length) {
      this.completeSession();
    } else {
      this.showCurrentStretch();
    }
  }

  async completeSession() {
    this.data.todayStretches++;
    this.data.totalStretches++;
    this.scheduleNextStretch();
    await this.saveData();
    this.updateUI();
    this.endSession();
  }

  endSession() {
    if (this.timer) clearInterval(this.timer);
    this.stretchView.classList.add('hidden');
    this.mainView.classList.remove('hidden');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new StretchReminder();
});
