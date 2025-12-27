// Meeting Scheduler - Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ meetings: [] });
    console.log('Meeting Scheduler extension installed');
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBadge') {
    chrome.action.setBadgeText({ text: message.text });
    if (message.color) {
      chrome.action.setBadgeBackgroundColor({ color: message.color });
    }
  }
});

// Handle meeting reminder alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('meeting-')) {
    const meetingId = alarm.name.replace('meeting-', '');

    const result = await chrome.storage.local.get(['meetings']);
    const meetings = result.meetings || [];
    const meeting = meetings.find(m => m.id === meetingId);

    if (meeting) {
      const options = {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '📅 會議提醒',
        message: `${meeting.title} 即將開始`,
        priority: 2,
        requireInteraction: true
      };

      if (meeting.link) {
        options.buttons = [{ title: '🔗 加入會議' }];
      }

      chrome.notifications.create(`meeting-notify-${meetingId}`, options);
    }
  }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId.startsWith('meeting-notify-')) {
    const meetingId = notificationId.replace('meeting-notify-', '');

    const result = await chrome.storage.local.get(['meetings']);
    const meetings = result.meetings || [];
    const meeting = meetings.find(m => m.id === meetingId);

    if (meeting && meeting.link && buttonIndex === 0) {
      chrome.tabs.create({ url: meeting.link });
    }

    chrome.notifications.clear(notificationId);
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId.startsWith('meeting-notify-')) {
    const meetingId = notificationId.replace('meeting-notify-', '');

    const result = await chrome.storage.local.get(['meetings']);
    const meetings = result.meetings || [];
    const meeting = meetings.find(m => m.id === meetingId);

    if (meeting && meeting.link) {
      chrome.tabs.create({ url: meeting.link });
    }

    chrome.notifications.clear(notificationId);
  }
});

// Update badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['meetings']);
  const meetings = result.meetings || [];

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const todayMeetings = meetings.filter(m => {
    const meetingDate = m.datetime.split('T')[0];
    return meetingDate === today && new Date(m.datetime) > now;
  });

  const count = todayMeetings.length;
  chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });

  // Re-set alarms for upcoming meetings
  meetings.forEach(meeting => {
    const meetingTime = new Date(meeting.datetime).getTime();
    const reminderTime = meetingTime - (meeting.reminder * 60 * 1000);

    if (reminderTime > Date.now()) {
      chrome.alarms.create(`meeting-${meeting.id}`, {
        when: reminderTime
      });
    }
  });
});
