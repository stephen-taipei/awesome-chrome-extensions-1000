document.addEventListener('DOMContentLoaded', () => {
  const totalExtensionsEl = document.getElementById('total-extensions');
  const extensionsListEl = document.getElementById('extensions-list');
  const scanBtn = document.getElementById('scan-btn');

  // Load cached data
  loadData();

  scanBtn.addEventListener('click', () => {
    scanExtensions();
  });

  function loadData() {
    chrome.storage.local.get(['knownExtensions'], (result) => {
      if (result.knownExtensions) {
        renderExtensions(result.knownExtensions);
      } else {
        scanExtensions();
      }
    });
  }

  function scanExtensions() {
    totalExtensionsEl.textContent = 'Scanning...';
    extensionsListEl.innerHTML = '';
    
    chrome.management.getAll((extensions) => {
      // In a real scenario, we would filter for extensions from this specific project.
      // For now, we'll list all enabled extensions as a demo of the "Universe".
      // Or we could filter by specific naming convention if one existed.
      
      const activeExtensions = extensions.filter(ext => ext.enabled && ext.type === 'extension');
      
      chrome.storage.local.set({ knownExtensions: activeExtensions });
      renderExtensions(activeExtensions);
    });
  }

  function renderExtensions(extensions) {
    totalExtensionsEl.textContent = extensions.length;
    extensionsListEl.innerHTML = '';

    if (extensions.length === 0) {
      const li = document.createElement('li');
      li.className = 'extension-item';
      li.textContent = 'No extensions found.';
      extensionsListEl.appendChild(li);
      return;
    }

    extensions.forEach(ext => {
      const li = document.createElement('li');
      li.className = 'extension-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'extension-name';
      nameSpan.textContent = ext.name;
      
      const statusSpan = document.createElement('span');
      statusSpan.className = 'extension-status';
      statusSpan.textContent = 'Active';
      
      li.appendChild(nameSpan);
      li.appendChild(statusSpan);
      extensionsListEl.appendChild(li);
    });
  }
});
