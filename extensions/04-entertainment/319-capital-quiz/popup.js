// Capital Quiz - Popup Script
class CapitalQuiz {
  constructor() {
    this.data = [
      {country:'France',capital:'Paris'},{country:'Germany',capital:'Berlin'},{country:'Italy',capital:'Rome'},
      {country:'Spain',capital:'Madrid'},{country:'Portugal',capital:'Lisbon'},{country:'Netherlands',capital:'Amsterdam'},
      {country:'Belgium',capital:'Brussels'},{country:'Austria',capital:'Vienna'},{country:'Poland',capital:'Warsaw'},
      {country:'Sweden',capital:'Stockholm'},{country:'Norway',capital:'Oslo'},{country:'Denmark',capital:'Copenhagen'},
      {country:'Finland',capital:'Helsinki'},{country:'Greece',capital:'Athens'},{country:'Turkey',capital:'Ankara'},
      {country:'Russia',capital:'Moscow'},{country:'Ukraine',capital:'Kyiv'},{country:'Switzerland',capital:'Bern'},
      {country:'Japan',capital:'Tokyo'},{country:'China',capital:'Beijing'},{country:'South Korea',capital:'Seoul'},
      {country:'India',capital:'New Delhi'},{country:'Thailand',capital:'Bangkok'},{country:'Vietnam',capital:'Hanoi'},
      {country:'Australia',capital:'Canberra'},{country:'Brazil',capital:'Brasília'},{country:'Argentina',capital:'Buenos Aires'},
      {country:'Mexico',capital:'Mexico City'},{country:'Canada',capital:'Ottawa'},{country:'Egypt',capital:'Cairo'}
    ];
    this.score = 0;
    this.current = null;
    this.init();
  }
  init() {
    this.loadScore();
    this.newQuestion();
  }
  newQuestion() {
    this.current = this.data[Math.floor(Math.random() * this.data.length)];
    const options = [this.current.capital];
    while (options.length < 4) {
      const opt = this.data[Math.floor(Math.random() * this.data.length)].capital;
      if (!options.includes(opt)) options.push(opt);
    }
    options.sort(() => Math.random() - 0.5);
    document.getElementById('country').textContent = this.current.country;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = options.map(o => `<button class="option" data-capital="${o}">${o}</button>`).join('');
    optionsEl.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(btn.dataset.capital));
    });
  }
  answer(capital) {
    const buttons = document.querySelectorAll('.option');
    buttons.forEach(b => b.disabled = true);
    const msg = document.getElementById('message');
    if (capital === this.current.capital) {
      this.score++;
      this.updateScore();
      msg.textContent = 'Correct!';
      msg.className = 'message correct';
      document.querySelector(`[data-capital="${capital}"]`).classList.add('correct');
    } else {
      msg.textContent = `Wrong! It's ${this.current.capital}`;
      msg.className = 'message wrong';
      document.querySelector(`[data-capital="${capital}"]`).classList.add('wrong');
      document.querySelector(`[data-capital="${this.current.capital}"]`).classList.add('correct');
    }
    setTimeout(() => this.newQuestion(), 1500);
  }
  updateScore() {
    document.getElementById('score').textContent = this.score;
    this.saveScore();
  }
  saveScore() { chrome.storage.local.set({ capitalScore: this.score }); }
  loadScore() {
    chrome.storage.local.get(['capitalScore'], (r) => {
      this.score = r.capitalScore || 0;
      this.updateScore();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new CapitalQuiz());
