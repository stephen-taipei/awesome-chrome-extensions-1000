document.addEventListener('DOMContentLoaded', () => {
  // Animate bars on load
  setTimeout(() => {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
      const targetHeight = bar.style.height;
      bar.style.height = '0';
      setTimeout(() => {
        bar.style.height = targetHeight;
      }, 50);
    });
  }, 100);

  // In a real extension, we would fetch real data from chrome.storage
  // and populate the UI dynamically.
});
