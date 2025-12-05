document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const badges = document.querySelectorAll('.badge');
  const brainIcon = document.getElementById('brain-icon');

  // Simulate intent detection on input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    // Simple intent detection simulation
    badges.forEach(b => b.classList.remove('active'));

    if (query.includes('how') || query.includes('what') || query.includes('why')) {
      document.querySelector('[data-intent="informational"]').classList.add('active');
    } else if (query.includes('buy') || query.includes('price') || query.includes('order')) {
      document.querySelector('[data-intent="transactional"]').classList.add('active');
    } else if (query.includes('.com') || query.includes('go to') || query.includes('open')) {
      document.querySelector('[data-intent="navigational"]').classList.add('active');
    } else {
      document.querySelector('[data-intent="informational"]').classList.add('active');
    }

    // Animate brain
    brainIcon.style.transform = 'scale(1.2)';
    setTimeout(() => brainIcon.style.transform = 'scale(1)', 200);
  });

  // Search button click
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value;
    if (query) {
      // Get enabled engines
      const engines = [];
      document.querySelectorAll('[data-engine]:checked').forEach(cb => {
        engines.push(cb.dataset.engine);
      });

      console.log('Searching:', query, 'Engines:', engines);

      // Open search in first enabled engine
      if (engines.includes('google')) {
        chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(query)}` });
      }
    }
  });

  // Enter key search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });
});
