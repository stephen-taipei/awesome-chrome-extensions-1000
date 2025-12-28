// Lucky Wheel - Popup Script
class LuckyWheel {
  constructor() {
    this.prizes = ['🎁 Gift', '⭐ Star', '💎 Diamond', '🎯 Bullseye', '🏆 Trophy', '🎲 Dice', '🌟 Sparkle', '💰 Jackpot'];
    this.rotation = 0;
    this.spinning = false;
    this.init();
  }
  init() {
    document.getElementById('spinBtn').addEventListener('click', () => this.spin());
  }
  spin() {
    if (this.spinning) return;
    this.spinning = true;
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('result').textContent = '';
    const spins = 5 + Math.floor(Math.random() * 3);
    const extraDeg = Math.floor(Math.random() * 360);
    const totalRotation = this.rotation + (spins * 360) + extraDeg;
    const wheel = document.getElementById('wheel');
    wheel.style.transform = `rotate(${totalRotation}deg)`;
    this.rotation = totalRotation;
    setTimeout(() => {
      const finalAngle = totalRotation % 360;
      const segmentAngle = 360 / 8;
      const adjustedAngle = (360 - finalAngle + segmentAngle / 2) % 360;
      const prizeIdx = Math.floor(adjustedAngle / segmentAngle);
      document.getElementById('result').textContent = this.prizes[prizeIdx];
      this.spinning = false;
      document.getElementById('spinBtn').disabled = false;
    }, 4000);
  }
}
document.addEventListener('DOMContentLoaded', () => new LuckyWheel());
