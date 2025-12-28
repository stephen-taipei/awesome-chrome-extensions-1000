// Request Logger - Background Script
let requests = [];
const MAX_REQUESTS = 100;

chrome.webRequest.onCompleted.addListener(
  (details) => {
    requests.unshift({
      id: details.requestId,
      url: details.url,
      method: details.method || 'GET',
      type: details.type,
      status: details.statusCode,
      time: Date.now()
    });
    if (requests.length > MAX_REQUESTS) requests.pop();
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getRequests') sendResponse(requests);
  if (msg.action === 'clearRequests') { requests = []; sendResponse(true); }
  return true;
});
