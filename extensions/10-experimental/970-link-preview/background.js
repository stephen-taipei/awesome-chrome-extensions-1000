// Background service worker for Link Preview
chrome.runtime.onInstalled.addListener(() => {
  console.log('Link Preview installed.');

  chrome.storage.local.set({
    enabled: true,
    previewSize: 'medium',
    delay: 500,
    blacklist: ['localhost', 'chrome://', 'chrome-extension://'],
    showImages: true
  });
});

// Handle preview requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PREVIEW') {
    fetchPreview(message.url).then(preview => {
      sendResponse({ success: true, preview });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (message.type === 'CHECK_BLACKLIST') {
    chrome.storage.local.get(['blacklist'], (data) => {
      const blacklist = data.blacklist || [];
      const isBlacklisted = blacklist.some(domain => message.url.includes(domain));
      sendResponse({ blacklisted: isBlacklisted });
    });
    return true;
  }
});

async function fetchPreview(url) {
  try {
    const response = await fetch(url, { method: 'GET', mode: 'cors' });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.content ||
                       doc.querySelector('meta[property="og:description"]')?.content || '';
    const image = doc.querySelector('meta[property="og:image"]')?.content || '';
    const favicon = new URL('/favicon.ico', url).href;

    return { title, description, image, favicon, url };
  } catch (e) {
    return {
      title: new URL(url).hostname,
      description: 'Preview not available',
      image: '',
      favicon: '',
      url
    };
  }
}
