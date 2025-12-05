document.addEventListener('DOMContentLoaded', () => {
  const themeCards = document.querySelectorAll('.theme-card');
  const applyBtn = document.getElementById('apply-btn');

  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      // Here we would load preset colors for the theme
      console.log(`Selected theme: ${card.dataset.theme}`);
    });
  });

  applyBtn.addEventListener('click', () => {
    const originalText = applyBtn.textContent;
    applyBtn.textContent = 'Applying...';
    
    // Simulate broadcasting theme change to other extensions
    setTimeout(() => {
      applyBtn.textContent = 'Applied!';
      chrome.storage.local.set({
        theme: document.querySelector('.theme-card.active').dataset.theme,
        colors: {
          primary: document.getElementById('color-primary').value,
          accent: document.getElementById('color-accent').value,
          bg: document.getElementById('color-bg').value
        }
      });
      
      setTimeout(() => {
        applyBtn.textContent = originalText;
      }, 1500);
    }, 800);
  });
});
