// Task Timer Background Service Worker

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'timerComplete') {
    const titles = {
      work: 'Work Session Complete!',
      short: 'Short Break Over',
      long: 'Long Break Over'
    };

    const bodies = {
      work: message.task ? `Great job on "${message.task}"! Time for a break.` : 'Great job! Time for a break.',
      short: 'Ready to get back to work?',
      long: 'Feeling refreshed? Let\'s continue!'
    };

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: titles[message.mode],
      message: bodies[message.mode],
      priority: 2
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Task Timer extension installed');
});
