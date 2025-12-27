// Meditation Timer - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      meditationData: {
        todaySessions: 0,
        totalMinutes: 0,
        streak: 0,
        lastDate: new Date().toDateString()
      }
    });
    console.log('Meditation Timer extension installed');
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'meditationComplete') {
    showNotification(message.minutes);
  }
});

function showNotification(minutes) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🧘 冥想完成！',
    message: `太棒了！你完成了 ${minutes} 分鐘的冥想。感覺更放鬆了嗎？`,
    requireInteraction: false
  });
}
