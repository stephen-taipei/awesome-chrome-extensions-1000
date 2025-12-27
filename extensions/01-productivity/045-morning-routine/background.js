// Morning Routine - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default morning routine items
    chrome.storage.local.set({
      morningRoutineItems: [
        { id: '1', text: '喝一杯水' },
        { id: '2', text: '伸展運動' },
        { id: '3', text: '冥想5分鐘' },
        { id: '4', text: '吃早餐' },
        { id: '5', text: '檢視今日計劃' }
      ],
      morningRoutineHistory: {}
    });
    console.log('Morning Routine extension installed');
  }
});

// Clean up old history (older than 30 days)
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['morningRoutineHistory']);
  const history = result.morningRoutineHistory || {};

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

  const cleanedHistory = {};
  for (const [date, data] of Object.entries(history)) {
    if (date >= cutoffDate) {
      cleanedHistory[date] = data;
    }
  }

  if (Object.keys(cleanedHistory).length !== Object.keys(history).length) {
    await chrome.storage.local.set({ morningRoutineHistory: cleanedHistory });
  }
});
