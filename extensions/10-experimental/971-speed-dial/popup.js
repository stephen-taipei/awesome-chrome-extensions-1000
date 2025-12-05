document.addEventListener('DOMContentLoaded', () => {
  const dialGrid = document.getElementById('dial-grid');
  const addForm = document.getElementById('add-form');
  const dialCount = document.getElementById('dial-count');

  loadSpeedDials();

  // Add new dial
  document.getElementById('add-dial').addEventListener('click', () => {
    addForm.style.display = 'block';
  });

  document.getElementById('cancel-dial').addEventListener('click', () => {
    addForm.style.display = 'none';
    document.getElementById('dial-title').value = '';
    document.getElementById('dial-url').value = '';
  });

  document.getElementById('save-dial').addEventListener('click', () => {
    const title = document.getElementById('dial-title').value;
    const url = document.getElementById('dial-url').value;

    if (title && url) {
      chrome.runtime.sendMessage({
        type: 'ADD_SPEED_DIAL',
        title,
        url
      }, () => {
        addForm.style.display = 'none';
        document.getElementById('dial-title').value = '';
        document.getElementById('dial-url').value = '';
        loadSpeedDials();
      });
    }
  });

  // Import bookmarks
  document.getElementById('import-bookmarks').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'IMPORT_BOOKMARKS' }, (response) => {
      if (response.success) {
        response.bookmarks.slice(0, 4).forEach(bookmark => {
          chrome.runtime.sendMessage({
            type: 'ADD_SPEED_DIAL',
            title: bookmark.title,
            url: bookmark.url
          });
        });
        setTimeout(loadSpeedDials, 500);
      }
    });
  });

  // Import top sites
  document.getElementById('import-top-sites').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_TOP_SITES' }, (response) => {
      if (response.success) {
        response.sites.slice(0, 4).forEach(site => {
          chrome.runtime.sendMessage({
            type: 'ADD_SPEED_DIAL',
            title: site.title,
            url: site.url
          });
        });
        setTimeout(loadSpeedDials, 500);
      }
    });
  });

  // Settings
  chrome.storage.local.get(['showClock', 'showWeather', 'searchEngine'], (data) => {
    document.getElementById('show-clock').checked = data.showClock !== false;
    document.getElementById('show-weather').checked = data.showWeather || false;
    document.getElementById('search-engine').value = data.searchEngine || 'google';
  });

  document.getElementById('show-clock').addEventListener('change', (e) => {
    chrome.storage.local.set({ showClock: e.target.checked });
  });

  document.getElementById('show-weather').addEventListener('change', (e) => {
    chrome.storage.local.set({ showWeather: e.target.checked });
  });

  document.getElementById('search-engine').addEventListener('change', (e) => {
    chrome.storage.local.set({ searchEngine: e.target.value });
  });

  function loadSpeedDials() {
    chrome.storage.local.get(['speedDials'], (data) => {
      const dials = data.speedDials || [];
      dialCount.textContent = dials.length;

      dialGrid.innerHTML = dials.map(dial => `
        <div class="dial-item" style="--color: ${dial.color};" data-url="${dial.url}" data-id="${dial.id}">
          <span class="dial-icon-letter">${dial.title.charAt(0).toUpperCase()}</span>
          <span class="dial-title">${dial.title}</span>
          <button class="remove-dial" data-id="${dial.id}">×</button>
        </div>
      `).join('') + `
        <div class="dial-item add-new" id="add-dial-btn">
          <span class="dial-icon-letter">+</span>
          <span class="dial-title">Add New</span>
        </div>
      `;

      // Click to open
      dialGrid.querySelectorAll('.dial-item:not(.add-new)').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('remove-dial')) {
            chrome.tabs.create({ url: item.dataset.url });
          }
        });
      });

      // Remove button
      dialGrid.querySelectorAll('.remove-dial').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          chrome.runtime.sendMessage({
            type: 'REMOVE_SPEED_DIAL',
            id: parseInt(btn.dataset.id)
          }, () => loadSpeedDials());
        });
      });

      // Re-attach add button
      document.getElementById('add-dial-btn').addEventListener('click', () => {
        addForm.style.display = 'block';
      });
    });
  }
});
