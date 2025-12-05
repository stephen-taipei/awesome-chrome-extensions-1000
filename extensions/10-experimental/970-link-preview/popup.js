document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enable-toggle');
  const delaySlider = document.getElementById('delay-slider');
  const delayValue = document.getElementById('delay-value');
  const sizeBtns = document.querySelectorAll('.size-btn');
  const blacklistEl = document.getElementById('blacklist');

  // Load settings
  chrome.storage.local.get(['enabled', 'previewSize', 'delay', 'blacklist', 'showImages'], (data) => {
    enableToggle.checked = data.enabled !== false;
    delaySlider.value = data.delay || 500;
    delayValue.textContent = `${delaySlider.value}ms`;
    document.getElementById('show-images').checked = data.showImages !== false;

    sizeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === (data.previewSize || 'medium'));
    });

    renderBlacklist(data.blacklist || []);
  });

  // Enable toggle
  enableToggle.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: enableToggle.checked });
  });

  // Delay slider
  delaySlider.addEventListener('input', () => {
    delayValue.textContent = `${delaySlider.value}ms`;
    chrome.storage.local.set({ delay: parseInt(delaySlider.value) });
  });

  // Size buttons
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.storage.local.set({ previewSize: btn.dataset.size });
    });
  });

  // Show images toggle
  document.getElementById('show-images').addEventListener('change', (e) => {
    chrome.storage.local.set({ showImages: e.target.checked });
  });

  // Add to blacklist
  document.getElementById('add-blacklist-btn').addEventListener('click', () => {
    const input = document.getElementById('blacklist-input');
    const domain = input.value.trim();
    if (domain) {
      chrome.storage.local.get(['blacklist'], (data) => {
        const blacklist = data.blacklist || [];
        if (!blacklist.includes(domain)) {
          blacklist.push(domain);
          chrome.storage.local.set({ blacklist });
          renderBlacklist(blacklist);
        }
        input.value = '';
      });
    }
  });

  function renderBlacklist(blacklist) {
    blacklistEl.innerHTML = blacklist.map(domain =>
      `<span class="blacklist-item">${domain} <button class="remove-btn" data-domain="${domain}">×</button></span>`
    ).join('');

    blacklistEl.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        chrome.storage.local.get(['blacklist'], (data) => {
          const newList = data.blacklist.filter(d => d !== btn.dataset.domain);
          chrome.storage.local.set({ blacklist: newList });
          renderBlacklist(newList);
        });
      });
    });
  }
});
