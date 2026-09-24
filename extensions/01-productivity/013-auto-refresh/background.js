// Alarms survive service-worker suspension. Tab IDs live in session storage only:
// restoring numeric IDs across a browser restart could reload an unrelated tab.
const PREFIX = 'auto-refresh:';
let queue = Promise.resolve();
function enqueue(task) {
  const result = queue.then(task);
  queue = result.catch(error => console.warn('Auto Refresh:', error.message));
  return result;
}
const load = async () => (await chrome.storage.session.get({ refreshSessions: {} })).refreshSessions;
const save = refreshSessions => chrome.storage.session.set({ refreshSessions });
function originOf(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.origin : null;
  } catch { return null; }
}
function validId(id) { return Number.isSafeInteger(id) && id >= 0; }
function validInterval(value) { return Number.isInteger(value) && value >= 30 && value <= 3600; }
async function remove(tabId) {
  await chrome.alarms.clear(PREFIX + tabId);
  const sessions = await load();
  delete sessions[tabId];
  await save(sessions);
}
async function reconcile() {
  const sessions = await load();
  for (const alarm of await chrome.alarms.getAll()) {
    if (alarm.name.startsWith(PREFIX) && !sessions[alarm.name.slice(PREFIX.length)]) {
      await chrome.alarms.clear(alarm.name);
    }
  }
  for (const [id, schedule] of Object.entries(sessions)) {
    let tab;
    try { tab = await chrome.tabs.get(Number(id)); } catch { /* closed tab */ }
    if (!validId(Number(id)) || !validInterval(schedule?.interval) || !tab || !schedule.origin || originOf(tab.url) !== schedule.origin) {
      await chrome.alarms.clear(PREFIX + id);
      delete sessions[id];
      continue;
    }
    let alarm = await chrome.alarms.get(PREFIX + id);
    if (!alarm) {
      await chrome.alarms.create(PREFIX + id, { delayInMinutes: schedule.interval / 60, periodInMinutes: schedule.interval / 60 });
      alarm = await chrome.alarms.get(PREFIX + id);
    }
    schedule.nextRefresh = alarm.scheduledTime;
  }
  await save(sessions);
}
async function handle(message) {
  if (!validId(message.tabId)) throw new Error('No valid tab is selected.');
  const tabId = message.tabId;
  if (message.type === 'stopRefresh') {
    await remove(tabId);
    return { ok: true, schedule: null };
  }
  if (message.type === 'getRefresh') {
    const sessions = await load();
    return { ok: true, schedule: sessions[tabId] || null };
  }
  if (!validInterval(message.interval)) throw new Error('Choose a whole number from 30 to 3600 seconds.');
  const tab = await chrome.tabs.get(tabId);
  const origin = originOf(tab.url);
  if (!origin) throw new Error('Auto Refresh works on HTTP and HTTPS pages only.');
  const sessions = await load();
  sessions[tabId] = { interval: message.interval, origin, nextRefresh: Date.now() + message.interval * 1000 };
  await save(sessions);
  try {
    await chrome.alarms.create(PREFIX + tabId, { delayInMinutes: message.interval / 60, periodInMinutes: message.interval / 60 });
    sessions[tabId].nextRefresh = (await chrome.alarms.get(PREFIX + tabId)).scheduledTime;
    await save(sessions);
  } catch (error) {
    await remove(tabId);
    throw error;
  }
  return { ok: true, schedule: sessions[tabId] };
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('popup.html')) return false;
  if (!message || !['startRefresh', 'stopRefresh', 'getRefresh'].includes(message.type)) return false;
  enqueue(() => handle(message)).then(sendResponse, error => sendResponse({ ok: false, error: error.message }));
  return true;
});
chrome.alarms.onAlarm.addListener(alarm => {
  if (!alarm.name.startsWith(PREFIX)) return;
  enqueue(async () => {
    const tabId = Number(alarm.name.slice(PREFIX.length));
    const sessions = await load();
    const schedule = sessions[tabId];
    if (!validId(tabId) || !schedule) return remove(tabId);
    let tab;
    try { tab = await chrome.tabs.get(tabId); } catch { return remove(tabId); }
    if (originOf(tab.url) !== schedule.origin) return remove(tabId);
    await chrome.tabs.reload(tabId);
    const next = await chrome.alarms.get(alarm.name);
    schedule.nextRefresh = next?.scheduledTime || Date.now() + schedule.interval * 1000;
    await save(sessions);
  });
});
chrome.tabs.onRemoved.addListener(tabId => enqueue(() => remove(tabId)));
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (!change.url) return;
  enqueue(async () => {
    const schedule = (await load())[tabId];
    if (schedule && originOf(change.url) !== schedule.origin) await remove(tabId);
  });
});
// Runs on every worker start, without resetting an existing alarm's deadline.
enqueue(reconcile);
