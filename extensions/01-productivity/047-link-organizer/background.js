// Link Organizer - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default folders
    chrome.storage.local.set({
      linkOrganizerData: [
        {
          id: '1',
          name: '工作',
          emoji: '💼',
          links: []
        },
        {
          id: '2',
          name: '學習',
          emoji: '📚',
          links: []
        },
        {
          id: '3',
          name: '娛樂',
          emoji: '🎮',
          links: []
        }
      ]
    });
    console.log('Link Organizer extension installed');
  }
});
