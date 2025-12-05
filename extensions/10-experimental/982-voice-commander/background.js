// Background service worker for Voice Commander
chrome.runtime.onInstalled.addListener(() => {
  console.log('Voice Commander installed.');

  chrome.storage.local.set({
    wakeWord: 'hey browser',
    continuousListening: false,
    voiceFeedback: true,
    customCommands: []
  });
});

// Handle voice command execution
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXECUTE_COMMAND') {
    const command = message.command.toLowerCase();

    if (command.includes('new tab')) {
      chrome.tabs.create({});
      sendResponse({ success: true, action: 'new_tab' });
    } else if (command.includes('close tab')) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.remove(tabs[0].id);
      });
      sendResponse({ success: true, action: 'close_tab' });
    } else if (command.includes('go back')) {
      chrome.tabs.goBack();
      sendResponse({ success: true, action: 'go_back' });
    } else if (command.includes('go forward')) {
      chrome.tabs.goForward();
      sendResponse({ success: true, action: 'go_forward' });
    } else if (command.includes('refresh')) {
      chrome.tabs.reload();
      sendResponse({ success: true, action: 'refresh' });
    } else {
      sendResponse({ success: false, action: 'unknown' });
    }
    return true;
  }
});
