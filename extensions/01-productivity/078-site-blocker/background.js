// Site Blocker - Background Service Worker

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame

  const result = await chrome.storage.local.get('siteBlockerData');
  const data = result.siteBlockerData;

  if (!data || !data.enabled) return;

  // Check schedule
  if (data.schedule?.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = data.schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = data.schedule.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Check if current time is within schedule
    let isInSchedule;
    if (startTime <= endTime) {
      isInSchedule = currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight schedule (e.g., 22:00 - 06:00)
      isInSchedule = currentTime >= startTime || currentTime <= endTime;
    }

    if (!isInSchedule) return;
  }

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace('www.', '');

    // Check if site is blocked
    const isBlocked = data.sites.some(site => {
      return hostname === site || hostname.endsWith('.' + site);
    });

    if (isBlocked) {
      const blockedUrl = chrome.runtime.getURL('blocked.html') + '?site=' + encodeURIComponent(hostname);
      chrome.tabs.update(details.tabId, { url: blockedUrl });
    }
  } catch (err) {
    console.error('Error checking site:', err);
  }
});
