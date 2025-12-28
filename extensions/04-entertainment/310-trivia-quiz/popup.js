// Trivia Quiz - Popup Script
class TriviaQuiz {
  constructor() {
    this.questions = [
      {q:'What is the capital of France?',a:['Paris','London','Berlin','Madrid'],c:0},
      {q:'Which planet is known as the Red Planet?',a:['Venus','Mars','Jupiter','Saturn'],c:1},
      {q:'What is the largest ocean on Earth?',a:['Atlantic','Indian','Arctic','Pacific'],c:3},
      {q:'Who painted the Mona Lisa?',a:['Van Gogh','Picasso','Da Vinci','Rembrandt'],c:2},
      {q:'What year did World War II end?',a:['1943','1944','1945','1946'],c:2},
      {q:'What is the chemical symbol for gold?',a:['Ag','Fe','Au','Cu'],c:2},
      {q:'Which country has the most population?',a:['USA','India','China','Indonesia'],c:2},
      {q:'What is the smallest country in the world?',a:['Monaco','Vatican City','San Marino','Liechtenstein'],c:1},
      {q:'How many continents are there?',a:['5','6','7','8'],c:2},
      {q:'What is the hardest natural substance?',a:['Gold','Iron','Diamond','Platinum'],c:2},
      {q:'Which element has the atomic number 1?',a:['Helium','Hydrogen','Oxygen','Carbon'],c:1},
      {q:'What is the largest mammal?',a:['Elephant','Blue Whale','Giraffe','Hippo'],c:1},
      {q:'How many bones are in the human body?',a:['186','206','226','256'],c:1},
      {q:'What is the speed of light?',a:['300,000 km/s','150,000 km/s','500,000 km/s','1,000,000 km/s'],c:0},
      {q:'Who wrote Romeo and Juliet?',a:['Dickens','Hemingway','Shakespeare','Austen'],c:2}
    ];
    this.current = 0;
    this.score = 0;
    this.answered = false;
    this.shuffled = [];
    this.init();
  }
  init() {
    document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
    this.startQuiz();
  }
  startQuiz() {
    this.shuffled = [...this.questions].sort(() => Math.random() - 0.5).slice(0, 10);
    this.current = 0;
    this.score = 0;
    this.showQuestion();
  }
  showQuestion() {
    this.answered = false;
    const q = this.shuffled[this.current];
    document.getElementById('score').textContent = `Score: ${this.score} | Q: ${this.current + 1}/10`;
    document.getElementById('question').textContent = q.q;
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = 'result';
    document.getElementById('nextBtn').style.display = 'none';
    const answersEl = document.getElementById('answers');
    answersEl.innerHTML = q.a.map((a, i) => `<button class="answer" data-index="${i}">${a}</button>`).join('');
    answersEl.querySelectorAll('.answer').forEach(btn => {
      btn.addEventListener('click', () => this.checkAnswer(parseInt(btn.dataset.index)));
    });
  }
  checkAnswer(index) {
    if (this.answered) return;
    this.answered = true;
    const q = this.shuffled[this.current];
    const buttons = document.querySelectorAll('.answer');
    buttons.forEach(b => b.disabled = true);
    buttons[q.c].classList.add('correct');
    const resultEl = document.getElementById('result');
    if (index === q.c) {
      this.score++;
      resultEl.textContent = 'Correct!';
      resultEl.className = 'result correct';
    } else {
      buttons[index].classList.add('wrong');
      resultEl.textContent = 'Wrong!';
      resultEl.className = 'result wrong';
    }
    document.getElementById('score').textContent = `Score: ${this.score} | Q: ${this.current + 1}/10`;
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('nextBtn').textContent = this.current < 9 ? 'Next Question' : 'See Results';
  }
  nextQuestion() {
    this.current++;
    if (this.current < 10) {
      this.showQuestion();
    } else {
      this.showResults();
    }
  }
  showResults() {
    document.getElementById('question').innerHTML = `<div class="final"><h2>Quiz Complete!</h2><p>You scored ${this.score}/10</p></div>`;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('result').textContent = '';
    document.getElementById('nextBtn').textContent = 'Play Again';
    document.getElementById('nextBtn').onclick = () => this.startQuiz();
  }
}
document.addEventListener('DOMContentLoaded', () => new TriviaQuiz());
