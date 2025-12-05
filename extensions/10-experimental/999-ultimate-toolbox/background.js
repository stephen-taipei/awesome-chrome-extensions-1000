// Background service worker for Ultimate Toolbox
chrome.runtime.onInstalled.addListener(() => {
  console.log('Ultimate Toolbox installed.');
});

// We could listen for commands to quick launch specific tools
chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);
});
