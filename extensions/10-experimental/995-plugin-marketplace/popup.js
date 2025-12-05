document.addEventListener('DOMContentLoaded', () => {
  const installBtns = document.querySelectorAll('.install-btn:not(.installed)');
  const getBtn = document.querySelector('.get-btn');

  function handleInstall(btn) {
    const originalText = btn.textContent;
    btn.textContent = 'Installing...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = 'Installed';
      btn.classList.add('installed');
      // In a real app, this would trigger the actual installation or enable the feature
      console.log('Plugin installed');
    }, 1000);
  }

  installBtns.forEach(btn => {
    btn.addEventListener('click', () => handleInstall(btn));
  });

  if (getBtn) {
    getBtn.addEventListener('click', () => handleInstall(getBtn));
  }
});
