// Weekly Planner - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ weeklyPlannerData: {} });
    console.log('Weekly Planner extension installed');
  }
});

// Clean up old week data (older than 4 weeks)
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['weeklyPlannerData']);
  const data = result.weeklyPlannerData || {};

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  fourWeeksAgo.setHours(0, 0, 0, 0);

  const cleanedData = {};
  for (const weekKey of Object.keys(data)) {
    const weekDate = new Date(weekKey);
    if (weekDate >= fourWeeksAgo) {
      cleanedData[weekKey] = data[weekKey];
    }
  }

  if (Object.keys(cleanedData).length !== Object.keys(data).length) {
    await chrome.storage.local.set({ weeklyPlannerData: cleanedData });
  }
});
