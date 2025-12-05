document.addEventListener('DOMContentLoaded', () => {
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const fileInput = document.getElementById('file-input');
  const fileName = document.getElementById('file-name');
  const statusArea = document.getElementById('status-area');

  exportBtn.addEventListener('click', () => {
    statusArea.textContent = 'Preparing export...';
    
    // Mock data export
    const data = {
      timestamp: new Date().toISOString(),
      settings: {
        theme: 'dark',
        notifications: true
      },
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: 'extension-settings-backup.json',
      saveAs: true
    }, () => {
      statusArea.textContent = 'Export complete!';
      setTimeout(() => statusArea.textContent = '', 3000);
    });
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      fileName.textContent = e.target.files[0].name;
      importBtn.disabled = false;
    } else {
      fileName.textContent = 'No file chosen';
      importBtn.disabled = true;
    }
  });

  importBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return;

    statusArea.textContent = 'Importing...';
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        console.log('Imported data:', data);
        // Here we would actually apply the settings
        statusArea.textContent = 'Settings imported successfully!';
        statusArea.style.color = '#27ae60';
      } catch (err) {
        statusArea.textContent = 'Invalid file format.';
        statusArea.style.color = '#e74c3c';
      }
    };

    reader.readAsText(file);
  });
});
