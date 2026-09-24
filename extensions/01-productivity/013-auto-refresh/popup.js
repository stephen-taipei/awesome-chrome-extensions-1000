document.addEventListener('DOMContentLoaded', async () => {
  const byId = id => document.getElementById(id);
  const start = byId('startBtn'), stop = byId('stopBtn'), custom = byId('customSeconds');
  const buttons = document.querySelectorAll('.interval-btn');
  const status = byId('status'), text = status.querySelector('.status-text');
  let tabId = null, interval = 30, schedule = null, pending = false;
  start.disabled = true;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  function render() {
    start.disabled = pending || tabId === null || !!schedule;
    stop.disabled = pending || !schedule;
    custom.disabled = pending || !!schedule;
    buttons.forEach(button => {
      button.disabled = pending || !!schedule;
      button.classList.toggle('active', Number(button.dataset.seconds) === interval);
    });
    status.classList.toggle('active', !!schedule);
    status.querySelector('.status-icon').textContent = schedule ? '🔄' : '⏸️';
    text.textContent = schedule ? `Refreshing about every ${schedule.interval} seconds` : 'Not refreshing';
    countdown();
  }
  function countdown() {
    const remaining = schedule ? Math.ceil((schedule.nextRefresh - Date.now()) / 1000) : null;
    byId('countdownTime').textContent = remaining === null ? '--' : remaining > 0 ? `~${remaining}s` : 'Waiting for browser';
  }
  async function request(type) {
    return chrome.runtime.sendMessage({ type, tabId, interval });
  }
  async function act(type) {
    pending = true;
    render();
    let error;
    try {
      if (type === 'startRefresh' && (!Number.isInteger(interval) || interval < 30 || interval > 3600)) {
        throw new Error('Choose a whole number from 30 to 3600 seconds.');
      }
      const response = await request(type);
      if (!response?.ok) throw new Error(response?.error || 'The background service is unavailable.');
      schedule = response.schedule;
      if (schedule) interval = schedule.interval;
    } catch (failure) { error = failure.message; }
    pending = false;
    render();
    if (error) text.textContent = error;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    interval = Number(button.dataset.seconds);
    custom.value = '';
    render();
  }));
  custom.addEventListener('input', () => { interval = Number(custom.value); render(); });
  start.addEventListener('click', () => act('startRefresh'));
  stop.addEventListener('click', () => act('stopRefresh'));
  try {
    if (!globalThis.chrome?.tabs) throw new Error('Load this folder as an unpacked Chrome extension to use Auto Refresh.');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/^https?:\/\//i.test(tab.url || '')) throw new Error('Open an HTTP or HTTPS page first. Browser settings pages cannot be refreshed.');
    tabId = tab.id;
    byId('tabTitle').textContent = tab.title || tab.url;
    // Do not send browsing information to a third-party favicon service.
    byId('tabFavicon').hidden = true;
    await act('getRefresh');
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'session' || !changes.refreshSessions || pending) return;
      schedule = changes.refreshSessions.newValue?.[tabId] || null;
      if (schedule) interval = schedule.interval;
      render();
    });
    setInterval(countdown, 1000);
  } catch (error) {
    tabId = null;
    byId('tabTitle').textContent = 'No supported tab';
    render();
    text.textContent = error.message;
  }
});
