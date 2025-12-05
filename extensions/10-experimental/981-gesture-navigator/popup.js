document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gesture-canvas');
  const ctx = canvas.getContext('2d');
  const gestureHint = document.querySelector('.gesture-hint');

  let isDrawing = false;
  let path = [];
  let trailColor = '#3498db';

  // Load settings
  chrome.storage.local.get(['gestureTrailEnabled', 'trailColor'], (data) => {
    document.getElementById('trail-toggle').checked = data.gestureTrailEnabled !== false;
    if (data.trailColor) {
      trailColor = data.trailColor;
      document.getElementById('trail-color').value = trailColor;
    }
  });

  // Canvas drawing
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    path = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gestureHint.style.opacity = '0';
    const rect = canvas.getBoundingClientRect();
    path.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    path.push({ x, y });

    // Draw trail
    ctx.strokeStyle = trailColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (path.length > 1) {
      ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', () => {
    if (!isDrawing) return;
    isDrawing = false;
    const gesture = recognizeGesture(path);
    if (gesture) {
      showGestureResult(gesture);
    }
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      gestureHint.style.opacity = '1';
    }, 1000);
  });

  canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
  });

  function recognizeGesture(path) {
    if (path.length < 5) return null;

    const start = path[0];
    const end = path[path.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    let direction = '';
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'R' : 'L';
    } else {
      direction = dy > 0 ? 'D' : 'U';
    }

    const gestures = {
      'L': 'Go Back',
      'R': 'Go Forward',
      'U': 'Scroll Top',
      'D': 'Scroll Bottom'
    };

    return { direction, action: gestures[direction] || 'Unknown' };
  }

  function showGestureResult(gesture) {
    ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${gesture.action}`, canvas.width / 2, canvas.height / 2);
  }

  // Settings
  document.getElementById('trail-toggle').addEventListener('change', (e) => {
    chrome.storage.local.set({ gestureTrailEnabled: e.target.checked });
  });

  document.getElementById('trail-color').addEventListener('change', (e) => {
    trailColor = e.target.value;
    chrome.storage.local.set({ trailColor });
  });
});
