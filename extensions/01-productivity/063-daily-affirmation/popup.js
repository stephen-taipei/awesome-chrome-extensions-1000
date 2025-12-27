// Daily Affirmation - Popup Script

const affirmations = {
  motivation: [
    '我有能力實現所有目標',
    '每一天都是新的開始',
    '我正在成為更好的自己',
    '挑戰讓我變得更強大',
    '我相信自己的潛力無限',
    '今天的努力是明天的成就',
    '我值得擁有成功和幸福',
    '困難只是暫時的，成長是永恆的',
    '我選擇積極面對每一天',
    '每一步都在帶我走向目標'
  ],
  'self-love': [
    '我愛並接受真實的自己',
    '我值得被愛和被尊重',
    '我對自己充滿耐心和理解',
    '我的價值不取決於他人的看法',
    '我允許自己休息和放鬆',
    '我感謝自己的身體和心靈',
    '我每天都在學習愛自己更多',
    '我的感受是重要且有效的',
    '我選擇善待自己',
    '我是獨一無二且珍貴的'
  ],
  success: [
    '成功正在向我走來',
    '我創造自己想要的生活',
    '我的付出終將得到回報',
    '機會總是青睞有準備的人',
    '我正在建造夢想中的未來',
    '我的決心比任何障礙都強大',
    '我吸引著豐盛和成功',
    '每個失敗都是成功的墊腳石',
    '我已經擁有成功所需的一切',
    '我的故事正在書寫精彩篇章'
  ],
  peace: [
    '我選擇平靜與和諧',
    '我釋放所有不再服務於我的事物',
    '此刻，我是安全的',
    '我允許自己活在當下',
    '我的心充滿寧靜與感恩',
    '我接受生命的流動',
    '我選擇放下過去，擁抱現在',
    '平靜就在我的每一次呼吸中',
    '我與宇宙的節奏和諧共振',
    '今天我選擇喜悅和平靜'
  ]
};

class DailyAffirmation {
  constructor() {
    this.data = {
      favorites: [],
      totalViewed: 0,
      daysStreak: 0,
      lastDate: null,
      currentAffirmation: null,
      category: 'motivation'
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.currentDateEl = document.getElementById('currentDate');
    this.affirmationText = document.getElementById('affirmationText');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.favoriteBtn = document.getElementById('favoriteBtn');
    this.favoriteIcon = document.getElementById('favoriteIcon');
    this.shareBtn = document.getElementById('shareBtn');
    this.favoritesList = document.getElementById('favoritesList');
    this.favoriteCount = document.getElementById('favoriteCount');
    this.daysStreakEl = document.getElementById('daysStreak');
    this.totalViewedEl = document.getElementById('totalViewed');
  }

  bindEvents() {
    this.refreshBtn.addEventListener('click', () => this.showNewAffirmation());
    this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
    this.shareBtn.addEventListener('click', () => this.copyToClipboard());

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.data.category = btn.dataset.category;
        this.showNewAffirmation();
        this.saveData();
      });
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('affirmationData');
    if (result.affirmationData) {
      this.data = { ...this.data, ...result.affirmationData };
    }

    // Check streak
    const today = new Date().toDateString();
    if (this.data.lastDate !== today) {
      if (this.data.lastDate) {
        const lastDate = new Date(this.data.lastDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() === yesterday.toDateString()) {
          this.data.daysStreak++;
        } else if (lastDate.toDateString() !== today) {
          this.data.daysStreak = 1;
        }
      } else {
        this.data.daysStreak = 1;
      }
      this.data.lastDate = today;
      this.data.currentAffirmation = null;
    }

    this.updateUI();

    // Set category button
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.category === this.data.category);
    });

    if (!this.data.currentAffirmation) {
      this.showNewAffirmation();
    } else {
      this.affirmationText.textContent = this.data.currentAffirmation;
      this.updateFavoriteButton();
    }

    await this.saveData();
  }

  async saveData() {
    await chrome.storage.local.set({ affirmationData: this.data });
  }

  showNewAffirmation() {
    const categoryAffirmations = affirmations[this.data.category];
    const randomIndex = Math.floor(Math.random() * categoryAffirmations.length);
    this.data.currentAffirmation = categoryAffirmations[randomIndex];
    this.data.totalViewed++;

    this.affirmationText.textContent = this.data.currentAffirmation;
    this.updateFavoriteButton();
    this.updateUI();
    this.saveData();
  }

  toggleFavorite() {
    const current = this.data.currentAffirmation;
    const index = this.data.favorites.indexOf(current);

    if (index === -1) {
      this.data.favorites.push(current);
    } else {
      this.data.favorites.splice(index, 1);
    }

    this.updateFavoriteButton();
    this.updateUI();
    this.saveData();
  }

  updateFavoriteButton() {
    const isFavorited = this.data.favorites.includes(this.data.currentAffirmation);
    this.favoriteIcon.textContent = isFavorited ? '❤️' : '🤍';
    this.favoriteBtn.classList.toggle('favorited', isFavorited);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.data.currentAffirmation).then(() => {
      this.shareBtn.querySelector('span:last-child').textContent = '已複製！';
      setTimeout(() => {
        this.shareBtn.querySelector('span:last-child').textContent = '複製';
      }, 2000);
    });
  }

  removeFavorite(text) {
    this.data.favorites = this.data.favorites.filter(f => f !== text);
    this.updateFavoriteButton();
    this.updateUI();
    this.saveData();
  }

  updateUI() {
    // Date
    const now = new Date();
    this.currentDateEl.textContent = now.toLocaleDateString('zh-TW', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    // Stats
    this.daysStreakEl.textContent = this.data.daysStreak;
    this.totalViewedEl.textContent = this.data.totalViewed;

    // Favorites
    this.favoriteCount.textContent = this.data.favorites.length;
    this.favoritesList.innerHTML = '';

    this.data.favorites.slice(-3).reverse().forEach(text => {
      const item = document.createElement('div');
      item.className = 'favorite-item';
      item.innerHTML = `
        <span>${text.substring(0, 20)}${text.length > 20 ? '...' : ''}</span>
        <button class="remove-favorite" title="移除">✕</button>
      `;
      item.querySelector('.remove-favorite').addEventListener('click', () => {
        this.removeFavorite(text);
      });
      this.favoritesList.appendChild(item);
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new DailyAffirmation();
});
