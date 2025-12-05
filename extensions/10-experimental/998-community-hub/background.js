// Background service worker for Community Hub
chrome.runtime.onInstalled.addListener(() => {
  console.log('Community Hub installed.');
  
  // Mock checking for updates periodically
  chrome.alarms.create('checkUpdates', { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkUpdates') {
    // In a real app, fetch from an API
    // For now, just log
    console.log('Checking for community updates...');
  }
});
