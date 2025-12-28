// Flag Quiz - Popup Script
class FlagQuiz {
  constructor() {
    this.flags = [
      {emoji:'🇺🇸',name:'United States'},{emoji:'🇬🇧',name:'United Kingdom'},{emoji:'🇫🇷',name:'France'},{emoji:'🇩🇪',name:'Germany'},
      {emoji:'🇯🇵',name:'Japan'},{emoji:'🇨🇳',name:'China'},{emoji:'🇮🇹',name:'Italy'},{emoji:'🇪🇸',name:'Spain'},
      {emoji:'🇧🇷',name:'Brazil'},{emoji:'🇨🇦',name:'Canada'},{emoji:'🇦🇺',name:'Australia'},{emoji:'🇮🇳',name:'India'},
      {emoji:'🇲🇽',name:'Mexico'},{emoji:'🇰🇷',name:'South Korea'},{emoji:'🇷🇺',name:'Russia'},{emoji:'🇳🇱',name:'Netherlands'},
      {emoji:'🇸🇪',name:'Sweden'},{emoji:'🇳🇴',name:'Norway'},{emoji:'🇩🇰',name:'Denmark'},{emoji:'🇫🇮',name:'Finland'},
      {emoji:'🇵🇱',name:'Poland'},{emoji:'🇹🇷',name:'Turkey'},{emoji:'🇬🇷',name:'Greece'},{emoji:'🇵🇹',name:'Portugal'},
      {emoji:'🇦🇷',name:'Argentina'},{emoji:'🇨🇭',name:'Switzerland'},{emoji:'🇧🇪',name:'Belgium'},{emoji:'🇦🇹',name:'Austria'},
      {emoji:'🇮🇪',name:'Ireland'},{emoji:'🇳🇿',name:'New Zealand'},{emoji:'🇸🇬',name:'Singapore'},{emoji:'🇹🇭',name:'Thailand'}
    ];
    this.score = 0;
    this.total = 0;
    this.current = null;
    this.init();
  }
  init() {
    this.newQuestion();
  }
  newQuestion() {
    this.current = this.flags[Math.floor(Math.random() * this.flags.length)];
    const options = [this.current];
    while (options.length < 4) {
      const opt = this.flags[Math.floor(Math.random() * this.flags.length)];
      if (!options.find(o => o.name === opt.name)) options.push(opt);
    }
    options.sort(() => Math.random() - 0.5);
    document.getElementById('flag').textContent = this.current.emoji;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = options.map(o => `<button class="option" data-name="${o.name}">${o.name}</button>`).join('');
    optionsEl.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(btn.dataset.name));
    });
  }
  answer(name) {
    const buttons = document.querySelectorAll('.option');
    buttons.forEach(b => b.disabled = true);
    this.total++;
    const msg = document.getElementById('message');
    if (name === this.current.name) {
      this.score++;
      msg.textContent = 'Correct!';
      msg.className = 'message correct';
      document.querySelector(`[data-name="${name}"]`).classList.add('correct');
    } else {
      msg.textContent = `Wrong! It was ${this.current.name}`;
      msg.className = 'message wrong';
      document.querySelector(`[data-name="${name}"]`).classList.add('wrong');
      document.querySelector(`[data-name="${this.current.name}"]`).classList.add('correct');
    }
    document.getElementById('score').textContent = this.score;
    document.getElementById('total').textContent = this.total;
    setTimeout(() => this.newQuestion(), 1500);
  }
}
document.addEventListener('DOMContentLoaded', () => new FlagQuiz());
