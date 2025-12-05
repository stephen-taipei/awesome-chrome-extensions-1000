document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('input[type="checkbox"]');

  toggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const card = e.target.closest('.experiment-card');
      const featureName = card.querySelector('h3').textContent;
      
      if (e.target.checked) {
        console.log(`Feature enabled: ${featureName}`);
        // In a real app, we would enable the feature logic
      } else {
        console.log(`Feature disabled: ${featureName}`);
      }
    });
  });
});
