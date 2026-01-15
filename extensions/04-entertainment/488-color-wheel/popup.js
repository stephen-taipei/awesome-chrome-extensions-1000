document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const targetEl = document.getElementById('target-color');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const bestEl = document.getElementById('best');
  const spinBtn = document.getElementById('spin-btn');

  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#5f27cd', '#ff9f43', '#00d2d3'];
  const colorNames = ['Red', 'Yellow', 'Blue', 'Pink', 'Green', 'Purple', 'Orange', 'Cyan'];
  let score = 0, streak = 0, best = 0, rotation = 0, spinning = false, targetColor = 0;

  const loadBest = () => chrome.storage.local.get(['colorWheelBest'], r => { best = r.colorWheelBest || 0; bestEl.textContent = best; });
  const saveBest = () => { if (score > best) { best = score; chrome.storage.local.set({ colorWheelBest: best }); bestEl.textContent = best; } };

  const drawWheel = () => {
    const cx = 125, cy = 125, r = 120;
    const sliceAngle = (Math.PI * 2) / colors.length;
    ctx.clearRect(0, 0, 250, 250);
    colors.forEach((color, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, rotation + i * sliceAngle, rotation + (i + 1) * sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    });
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#2c3e50'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
  };

  const setTarget = () => {
    targetColor = Math.floor(Math.random() * colors.length);
    targetEl.style.background = colors[targetColor];
    targetEl.title = `Match: ${colorNames[targetColor]}`;
  };

  const getSelectedColor = () => {
    const sliceAngle = (Math.PI * 2) / colors.length;
    let normalizedRotation = (-rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const pointerAngle = Math.PI * 1.5;
    const adjustedAngle = (pointerAngle - normalizedRotation + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(adjustedAngle / sliceAngle) % colors.length;
  };

  const spin = () => {
    if (spinning) return;
    spinning = true; spinBtn.disabled = true;
    const spinAmount = Math.PI * 4 + Math.random() * Math.PI * 4;
    const duration = 3000;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      rotation = startRotation + spinAmount * eased;
      drawWheel();
      if (progress < 1) requestAnimationFrame(animate);
      else {
        spinning = false; spinBtn.disabled = false;
        const selected = getSelectedColor();
        if (selected === targetColor) {
          streak++; score += 10 * streak;
          scoreEl.textContent = score; streakEl.textContent = streak;
          saveBest();
        } else { streak = 0; streakEl.textContent = 0; }
        setTarget();
      }
    };
    animate();
  };

  spinBtn.addEventListener('click', spin);
  loadBest(); drawWheel(); setTarget();
});
