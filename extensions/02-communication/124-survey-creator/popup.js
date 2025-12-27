// Survey Creator - Popup Script

class SurveyCreator {
  constructor() {
    this.currentSurvey = {
      title: '',
      questions: []
    };
    this.savedSurveys = [];
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.titleEl = document.getElementById('surveyTitle');
    this.questionEl = document.getElementById('questionText');
    this.addBtn = document.getElementById('addQuestion');
    this.countEl = document.getElementById('questionCount');
    this.questionsListEl = document.getElementById('questionsList');
    this.copyBtn = document.getElementById('copySurvey');
    this.clearBtn = document.getElementById('clearSurvey');
    this.surveysListEl = document.getElementById('surveysList');
  }

  bindEvents() {
    this.titleEl.addEventListener('input', () => {
      this.currentSurvey.title = this.titleEl.value.trim();
    });
    this.addBtn.addEventListener('click', () => this.addQuestion());
    this.questionEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addQuestion();
    });
    this.copyBtn.addEventListener('click', () => this.copySurvey());
    this.clearBtn.addEventListener('click', () => this.clearSurvey());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedSurveys');
    if (result.savedSurveys) {
      this.savedSurveys = result.savedSurveys;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedSurveys: this.savedSurveys });
  }

  addQuestion() {
    const text = this.questionEl.value.trim();
    if (!text) return;

    this.currentSurvey.questions.push(text);
    this.questionEl.value = '';
    this.renderQuestions();
  }

  removeQuestion(index) {
    this.currentSurvey.questions.splice(index, 1);
    this.renderQuestions();
  }

  clearSurvey() {
    this.currentSurvey = { title: '', questions: [] };
    this.titleEl.value = '';
    this.questionEl.value = '';
    this.renderQuestions();
  }

  async copySurvey() {
    const title = this.currentSurvey.title || 'Survey';
    const questions = this.currentSurvey.questions;

    if (questions.length === 0) return;

    let output = `${title.toUpperCase()}\n${'═'.repeat(35)}\n\n`;
    questions.forEach((q, i) => {
      output += `${i + 1}. ${q}\n   [ ] Option A\n   [ ] Option B\n   [ ] Option C\n\n`;
    });
    output += `${'═'.repeat(35)}`;

    await navigator.clipboard.writeText(output);

    // Save survey
    if (this.currentSurvey.title && questions.length > 0) {
      this.savedSurveys.unshift({
        id: Date.now(),
        title: this.currentSurvey.title,
        questions: [...questions]
      });

      if (this.savedSurveys.length > 10) {
        this.savedSurveys.pop();
      }

      this.saveData();
      this.renderSurveys();
    }

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  loadSurvey(id) {
    const survey = this.savedSurveys.find(s => s.id === id);
    if (survey) {
      this.currentSurvey = {
        title: survey.title,
        questions: [...survey.questions]
      };
      this.titleEl.value = survey.title;
      this.renderQuestions();
    }
  }

  deleteSurvey(id) {
    this.savedSurveys = this.savedSurveys.filter(s => s.id !== id);
    this.saveData();
    this.renderSurveys();
  }

  render() {
    this.renderQuestions();
    this.renderSurveys();
  }

  renderQuestions() {
    this.countEl.textContent = this.currentSurvey.questions.length;

    if (this.currentSurvey.questions.length === 0) {
      this.questionsListEl.innerHTML = '<div class="empty-state">No questions added</div>';
      return;
    }

    this.questionsListEl.innerHTML = this.currentSurvey.questions.map((q, i) => `
      <div class="question-item">
        <span class="question-num">${i + 1}.</span>
        <span class="question-text">${this.escapeHtml(q)}</span>
        <button class="remove-q-btn" data-index="${i}">&times;</button>
      </div>
    `).join('');

    this.questionsListEl.querySelectorAll('[data-index]').forEach(btn => {
      btn.addEventListener('click', () => this.removeQuestion(parseInt(btn.dataset.index)));
    });
  }

  renderSurveys() {
    if (this.savedSurveys.length === 0) {
      this.surveysListEl.innerHTML = '<div class="empty-state">No saved surveys</div>';
      return;
    }

    this.surveysListEl.innerHTML = this.savedSurveys.map(s => `
      <div class="survey-item">
        <div class="survey-info">
          <div class="survey-title">${this.escapeHtml(s.title)}</div>
          <div class="survey-count">${s.questions.length} questions</div>
        </div>
        <div class="survey-actions">
          <button class="load-btn" data-load="${s.id}">Load</button>
          <button class="delete-btn" data-delete="${s.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.surveysListEl.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => this.loadSurvey(parseInt(btn.dataset.load)));
    });

    this.surveysListEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSurvey(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new SurveyCreator());
