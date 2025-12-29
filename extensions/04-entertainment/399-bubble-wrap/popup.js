// Bubble Wrap - Popup Script
class BubbleWrap {
  constructor() {
    this.total = 48;
    this.popped = 0;
    this.init();
  }
  init() {
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    this.reset();
  }
  reset() {
    this.popped = 0;
    document.getElementById('popped').textContent = '0';
    document.getElementById('total').textContent = this.total;
    this.render();
  }
  render() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    for (let i = 0; i < this.total; i++) {
      const bubble = document.createElement('button');
      bubble.className = 'bubble';
      bubble.addEventListener('click', () => this.pop(bubble));
      grid.appendChild(bubble);
    }
  }
  pop(bubble) {
    if (bubble.classList.contains('popped')) return;
    bubble.classList.add('popped');
    this.popped++;
    document.getElementById('popped').textContent = this.popped;
    // Play pop sound effect (visual feedback only)
    bubble.style.transform = 'scale(0.7)';
    setTimeout(() => {
      bubble.style.transform = 'scale(0.8)';
    }, 50);
    if (this.popped === this.total) {
      setTimeout(() => {
        document.getElementById('resetBtn').textContent = '🎉 All Popped! New Sheet';
      }, 200);
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new BubbleWrap());
