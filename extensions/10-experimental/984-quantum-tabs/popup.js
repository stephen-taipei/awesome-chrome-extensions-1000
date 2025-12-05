document.addEventListener('DOMContentLoaded', () => {
  const tabCountEl = document.getElementById('tab-count');
  const entangleBtn = document.getElementById('entangle-btn');
  const superposeBtn = document.getElementById('superpose-btn');
  const collapseBtn = document.getElementById('collapse-btn');
  const particles = document.querySelectorAll('.state-particle');

  // Get current tab count
  chrome.tabs.query({}, (tabs) => {
    tabCountEl.textContent = tabs.length;
  });

  // Animate quantum particles
  function animateParticles() {
    particles.forEach((p, i) => {
      const angle = (Date.now() / 1000 + i * 2) % (Math.PI * 2);
      const x = Math.cos(angle) * 30 + 50;
      const y = Math.sin(angle) * 30 + 50;
      p.style.left = `${x}%`;
      p.style.top = `${y}%`;
      p.style.opacity = 0.5 + Math.sin(Date.now() / 500 + i) * 0.5;
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // Entangle tabs
  entangleBtn.addEventListener('click', () => {
    chrome.tabs.query({ highlighted: true }, (tabs) => {
      const tabIds = tabs.map(t => t.id);
      chrome.runtime.sendMessage({ type: 'ENTANGLE_TABS', tabIds }, (response) => {
        if (response.success) {
          entangleBtn.textContent = 'Entangled!';
          setTimeout(() => {
            entangleBtn.innerHTML = '<span class="btn-icon">🔗</span>Entangle Selected';
          }, 1500);
        }
      });
    });
  });

  // Create superposition
  superposeBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Creating superposition for tab:', tabs[0].id);
      superposeBtn.innerHTML = '<span class="btn-icon">✨</span>Superposed!';
      setTimeout(() => {
        superposeBtn.innerHTML = '<span class="btn-icon">📚</span>Create Superposition';
      }, 1500);
    });
  });

  // Collapse state
  collapseBtn.addEventListener('click', () => {
    console.log('Collapsing quantum state...');
    collapseBtn.innerHTML = '<span class="btn-icon">💫</span>Collapsed!';
    setTimeout(() => {
      collapseBtn.innerHTML = '<span class="btn-icon">🎯</span>Collapse to State';
    }, 1500);
  });
});
