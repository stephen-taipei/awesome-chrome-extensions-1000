// Emoji Quiz - Popup Script
class EmojiQuiz {
  constructor() {
    this.puzzles = [
      {emojis:'🦁👑',answer:'The Lion King'},{emojis:'🕷️🦸‍♂️',answer:'Spider-Man'},
      {emojis:'❄️👸',answer:'Frozen'},{emojis:'🧙‍♂️💍',answer:'Lord of the Rings'},
      {emojis:'🦇🦸‍♂️',answer:'Batman'},{emojis:'⭐🔫',answer:'Star Wars'},
      {emojis:'🦖🌴',answer:'Jurassic Park'},{emojis:'🚢❄️💔',answer:'Titanic'},
      {emojis:'🧙‍♂️⚡',answer:'Harry Potter'},{emojis:'🤖❤️',answer:'Wall-E'},
      {emojis:'🎃👻',answer:'Halloween'},{emojis:'🦈🏊',answer:'Jaws'},
      {emojis:'👻👻👻',answer:'Ghostbusters'},{emojis:'🏃‍♂️🏃‍♂️🏃‍♂️',answer:'Running Man'},
      {emojis:'🍿🎬',answer:'Movie Night'},{emojis:'🎄🎅',answer:'Christmas'},
      {emojis:'🌙🐺',answer:'Werewolf'},{emojis:'🧟‍♂️🧟‍♀️',answer:'Zombies'},
      {emojis:'👽🛸',answer:'Aliens'},{emojis:'🏰👸',answer:'Cinderella'}
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
    this.current = this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    const options = [this.current.answer];
    while (options.length < 4) {
      const opt = this.puzzles[Math.floor(Math.random() * this.puzzles.length)].answer;
      if (!options.includes(opt)) options.push(opt);
    }
    options.sort(() => Math.random() - 0.5);
    document.getElementById('emojis').textContent = this.current.emojis;
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = options.map(o => `<button class="option" data-answer="${o}">${o}</button>`).join('');
    optionsEl.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(btn.dataset.answer));
    });
  }
  answer(answer) {
    const buttons = document.querySelectorAll('.option');
    buttons.forEach(b => b.disabled = true);
    const msg = document.getElementById('message');
    if (answer === this.current.answer) {
      this.score++;
      this.updateScore();
      msg.textContent = 'Correct!';
      msg.className = 'message correct';
      document.querySelector(`[data-answer="${answer}"]`).classList.add('correct');
    } else {
      msg.textContent = `Wrong! It's ${this.current.answer}`;
      msg.className = 'message wrong';
      document.querySelector(`[data-answer="${answer}"]`).classList.add('wrong');
      document.querySelector(`[data-answer="${this.current.answer}"]`).classList.add('correct');
    }
    setTimeout(() => this.newQuestion(), 1500);
  }
  updateScore() {
    document.getElementById('score').textContent = this.score;
    this.saveScore();
  }
  saveScore() { chrome.storage.local.set({ emojiScore: this.score }); }
  loadScore() {
    chrome.storage.local.get(['emojiScore'], (r) => {
      this.score = r.emojiScore || 0;
      this.updateScore();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => new EmojiQuiz());
