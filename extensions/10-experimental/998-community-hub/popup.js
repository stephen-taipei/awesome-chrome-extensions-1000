document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  const submitBtn = document.querySelector('.submit-btn');
  const feedbackText = document.querySelector('textarea');

  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      // Reset active states
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      // Set new active state
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  // Mock Feedback Submission
  submitBtn.addEventListener('click', () => {
    const text = feedbackText.value.trim();
    if (text) {
      // In a real app, this would send data to a server
      console.log('Feedback submitted:', text);
      feedbackText.value = '';
      
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sent!';
      submitBtn.style.backgroundColor = '#27ae60';
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
      }, 2000);
    }
  });

  // Initialize Notifications Check
  chrome.storage.local.get(['lastReadNews'], (result) => {
    // Could use this to show a "new" badge on the News tab
  });
});
