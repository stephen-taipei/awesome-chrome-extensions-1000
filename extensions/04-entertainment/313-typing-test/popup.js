// Typing Test - Popup Script
class TypingTest {
  constructor() {
    this.words = ['the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us'];
    this.text = '';
    this.typed = '';
    this.startTime = null;
    this.timer = null;
    this.timeLeft = 30;
    this.init();
  }
  init() {
    document.getElementById('input').addEventListener('input', (e) => this.handleInput(e));
    document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    this.restart();
  }
  generateText() {
    const shuffled = [...this.words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 25).join(' ');
  }
  restart() {
    clearInterval(this.timer);
    this.text = this.generateText();
    this.typed = '';
    this.startTime = null;
    this.timeLeft = 30;
    document.getElementById('input').value = '';
    document.getElementById('input').disabled = false;
    document.getElementById('input').focus();
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100%';
    document.getElementById('time').textContent = '30s';
    this.renderText();
  }
  handleInput(e) {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.startTimer();
    }
    this.typed = e.target.value;
    this.renderText();
    this.updateStats();
  }
  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('time').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        document.getElementById('input').disabled = true;
      }
    }, 1000);
  }
  renderText() {
    let html = '';
    for (let i = 0; i < this.text.length; i++) {
      if (i < this.typed.length) {
        html += this.typed[i] === this.text[i]
          ? `<span class="correct">${this.text[i]}</span>`
          : `<span class="wrong">${this.text[i]}</span>`;
      } else if (i === this.typed.length) {
        html += `<span class="current">${this.text[i]}</span>`;
      } else {
        html += this.text[i];
      }
    }
    document.getElementById('text').innerHTML = html;
  }
  updateStats() {
    const elapsed = (Date.now() - this.startTime) / 1000 / 60;
    const words = this.typed.trim().split(/\s+/).filter(w => w).length;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    document.getElementById('wpm').textContent = wpm;
    let correct = 0;
    for (let i = 0; i < this.typed.length; i++) {
      if (this.typed[i] === this.text[i]) correct++;
    }
    const accuracy = this.typed.length > 0 ? Math.round((correct / this.typed.length) * 100) : 100;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
  }
}
document.addEventListener('DOMContentLoaded', () => new TypingTest());
