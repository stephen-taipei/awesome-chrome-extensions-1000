document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('action-btn');
  const content = document.getElementById('content');

  btn.addEventListener('click', () => {
    content.innerHTML = '<p>Action completed!</p>';
    chrome.storage.local.set({ data: 'active' });
  });

  chrome.storage.local.get(['data'], (result) => {
    if (result.data) {
      content.innerHTML = `<p>Status: ${result.data}</p>`;
    } else {
      content.innerHTML = '<p>Click the button to start.</p>';
    }
  });
});
