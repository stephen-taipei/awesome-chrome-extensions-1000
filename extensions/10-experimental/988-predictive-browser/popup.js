document.addEventListener('DOMContentLoaded', () => {
  const goBtn = document.querySelector('.go-btn');
  const suggestionBtns = document.querySelectorAll('.s-btn');

  goBtn.addEventListener('click', () => {
    // Mock navigation
    chrome.tabs.create({ url: 'https://github.com' });
  });

  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item');
      const name = item.querySelector('.s-name').textContent;
      
      // Simple map for demo
      const urlMap = {
        'Gmail': 'https://mail.google.com',
        'Stack Overflow': 'https://stackoverflow.com'
      };
      
      if (urlMap[name]) {
        chrome.tabs.create({ url: urlMap[name] });
      }
    });
  });
});
