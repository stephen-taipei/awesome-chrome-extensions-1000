// Meeting Scheduler - Background Service Worker

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('meeting_')) {
    const meetingId = alarm.name.replace('meeting_', '');
    const result = await chrome.storage.local.get('meetingSchedulerData');

    if (result.meetingSchedulerData) {
      const meeting = result.meetingSchedulerData.meetings.find(m => m.id === meetingId);

      if (meeting) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '📅 會議提醒',
          message: `${meeting.title} 將在 ${meeting.reminder} 分鐘後開始`,
          priority: 2,
          buttons: meeting.link ? [{ title: '加入會議' }] : []
        });

        // Store meeting link for notification click
        if (meeting.link) {
          await chrome.storage.local.set({
            pendingMeetingLink: meeting.link
          });
        }
      }
    }
  }
});

// Handle notification button click
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    const result = await chrome.storage.local.get('pendingMeetingLink');
    if (result.pendingMeetingLink) {
      chrome.tabs.create({ url: result.pendingMeetingLink });
      await chrome.storage.local.remove('pendingMeetingLink');
    }
  }
});

// Re-register alarms on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get('meetingSchedulerData');

  if (result.meetingSchedulerData) {
    const now = Date.now();

    result.meetingSchedulerData.meetings.forEach(meeting => {
      const meetingTime = new Date(`${meeting.date}T${meeting.time}`);
      const reminderTime = meetingTime.getTime() - meeting.reminder * 60 * 1000;

      if (reminderTime > now) {
        chrome.alarms.create(`meeting_${meeting.id}`, {
          when: reminderTime
        });
      }
    });
  }
});
