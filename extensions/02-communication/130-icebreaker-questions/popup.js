// Icebreaker Questions - Popup Script

const DEFAULT_QUESTIONS = {
  fun: [
    "If you could have any superpower, what would it be?",
    "What's the most unusual food you've ever tried?",
    "If you could travel anywhere tomorrow, where would you go?",
    "What's your go-to karaoke song?",
    "What's the best concert you've ever been to?"
  ],
  work: [
    "What's the best career advice you've ever received?",
    "What skill would you most like to develop?",
    "What's your favorite productivity hack?",
    "What does your ideal work day look like?",
    "Who has been the most influential mentor in your career?"
  ],
  deep: [
    "What's a belief you held strongly that you've since changed?",
    "What's something you wish more people understood about you?",
    "What would you do if you knew you couldn't fail?",
    "What's the most valuable lesson you've learned?",
    "What legacy do you want to leave behind?"
  ],
  creative: [
    "If you could have dinner with anyone from history, who would it be?",
    "What would be the title of your autobiography?",
    "If you had to teach a class on anything, what would it be?",
    "What's an invention you wish existed?",
    "If you started a business tomorrow, what would it be?"
  ]
};

class IcebreakerQuestions {
  constructor() {
    this.questions = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.filterEl = document.getElementById('categoryFilter');
    this.randomBtn = document.getElementById('randomBtn');
    this.resultEl = document.getElementById('questionResult');
    this.categoryEl = document.getElementById('category');
    this.questionEl = document.getElementById('question');
    this.addBtn = document.getElementById('addBtn');
    this.listEl = document.getElementById('questionsList');
  }

  bindEvents() {
    this.randomBtn.addEventListener('click', () => this.showRandom());
    this.addBtn.addEventListener('click', () => this.addQuestion());
    this.questionEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addQuestion();
    });
  }

  async loadData() {
    const result = await chrome.storage.local.get('customIcebreakers');
    if (result.customIcebreakers) {
      this.questions = result.customIcebreakers;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ customIcebreakers: this.questions });
  }

  getAllQuestions(category) {
    let all = [];

    if (category === 'all') {
      Object.values(DEFAULT_QUESTIONS).forEach(arr => all.push(...arr));
      all.push(...this.questions.map(q => q.text));
    } else {
      all.push(...(DEFAULT_QUESTIONS[category] || []));
      all.push(...this.questions.filter(q => q.category === category).map(q => q.text));
    }

    return all;
  }

  showRandom() {
    const category = this.filterEl.value;
    const questions = this.getAllQuestions(category);

    if (questions.length === 0) {
      this.resultEl.innerHTML = 'No questions available';
      this.resultEl.classList.remove('hidden');
      return;
    }

    const random = questions[Math.floor(Math.random() * questions.length)];
    this.resultEl.innerHTML = `
      ${random}
      <br><button id="copyQuestion">Copy</button>
    `;
    this.resultEl.classList.remove('hidden');

    document.getElementById('copyQuestion').addEventListener('click', async () => {
      await navigator.clipboard.writeText(random);
      document.getElementById('copyQuestion').textContent = 'Copied!';
    });
  }

  addQuestion() {
    const category = this.categoryEl.value;
    const text = this.questionEl.value.trim();

    if (!text) return;

    this.questions.unshift({
      id: Date.now(),
      category,
      text
    });

    if (this.questions.length > 50) {
      this.questions.pop();
    }

    this.questionEl.value = '';
    this.saveData();
    this.render();
  }

  deleteQuestion(id) {
    this.questions = this.questions.filter(q => q.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.questions.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No custom questions added</div>';
      return;
    }

    this.listEl.innerHTML = this.questions.map(q => `
      <div class="question-item">
        <span class="question-category">${q.category}</span>
        <span class="question-text">${this.escapeHtml(q.text)}</span>
        <button class="delete-btn" data-id="${q.id}">Delete</button>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteQuestion(parseInt(btn.dataset.id)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new IcebreakerQuestions());
