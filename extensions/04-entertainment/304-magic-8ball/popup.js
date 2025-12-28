// Magic 8 Ball - Popup Script
class Magic8Ball {
  constructor() {
    this.answers = [
      'It is certain', 'It is decidedly so', 'Without a doubt', 'Yes definitely', 'You may rely on it',
      'As I see it, yes', 'Most likely', 'Outlook good', 'Yes', 'Signs point to yes',
      'Reply hazy, try again', 'Ask again later', 'Better not tell you now', 'Cannot predict now', 'Concentrate and ask again',
      'Don\'t count on it', 'My reply is no', 'My sources say no', 'Outlook not so good', 'Very doubtful'
    ];
    this.init();
  }
  init() {
    document.getElementById('askBtn').addEventListener('click', () => this.shake());
    document.getElementById('question').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.shake();
    });
  }
  shake() {
    const ball = document.getElementById('ball');
    const answer = document.getElementById('answer');
    const question = document.getElementById('question').value.trim();
    if (!question) {
      answer.textContent = 'Ask a question first!';
      return;
    }
    ball.classList.add('shaking');
    answer.textContent = '...';
    setTimeout(() => {
      ball.classList.remove('shaking');
      const randomAnswer = this.answers[Math.floor(Math.random() * this.answers.length)];
      answer.textContent = randomAnswer;
    }, 500);
  }
}
document.addEventListener('DOMContentLoaded', () => new Magic8Ball());
