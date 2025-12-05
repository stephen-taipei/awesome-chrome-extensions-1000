// Background service worker for Context Aware
chrome.runtime.onInstalled.addListener(() => {
  console.log('Context Aware installed.');
});

// Alarm for time-based context checks
chrome.alarms.create('checkContext', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkContext') {
    console.log('Checking context rules...');
    // Logic to check time/date would go here
  }
});
