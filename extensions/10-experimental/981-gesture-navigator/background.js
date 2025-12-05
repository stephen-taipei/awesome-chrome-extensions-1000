// Background service worker for Gesture Navigator
chrome.runtime.onInstalled.addListener(() => {
  console.log('Gesture Navigator installed.');

  chrome.storage.local.set({
    gestureTrailEnabled: true,
    trailColor: '#3498db',
    sensitivity: 5,
    gestures: {
      'L': 'back',
      'R': 'forward',
      'U': 'scroll_top',
      'D': 'scroll_bottom',
      'DR': 'close_tab',
      'DL': 'new_tab',
      'UD': 'refresh',
      'LR': 'reopen_tab'
    }
  });
});

// Handle gesture execution
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXECUTE_GESTURE') {
    const action = message.action;

    switch (action) {
      case 'back':
        chrome.tabs.goBack();
        break;
      case 'forward':
        chrome.tabs.goForward();
        break;
      case 'close_tab':
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) chrome.tabs.remove(tabs[0].id);
        });
        break;
      case 'new_tab':
        chrome.tabs.create({});
        break;
      case 'refresh':
        chrome.tabs.reload();
        break;
      case 'reopen_tab':
        chrome.sessions.restore();
        break;
    }
    sendResponse({ success: true });
    return true;
  }
});
