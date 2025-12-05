document.addEventListener('DOMContentLoaded', () => {
  const outputArea = document.getElementById('output-area');
  const copyBtn = document.getElementById('copy-btn');

  // Generators
  document.getElementById('gen-manifest').addEventListener('click', () => {
    const manifest = {
      "manifest_version": 3,
      "name": "New Extension",
      "version": "1.0.0",
      "description": "Description here",
      "permissions": [],
      "action": {
        "default_popup": "popup.html"
      }
    };
    outputArea.value = JSON.stringify(manifest, null, 2);
  });

  document.getElementById('gen-readme').addEventListener('click', () => {
    const readme = `# Extension Name\n\n## Description\nBrief description of the extension.\n\n## Features\n- Feature 1\n- Feature 2\n\n## Permissions\n- 	exttt{storage}: Description
`;
    outputArea.value = readme;
  });
  
  document.getElementById('gen-icons').addEventListener('click', () => {
    outputArea.value = "Icon generation scripts would go here, or links to resources.";
  });

  // Utilities
  document.getElementById('reload-ext').addEventListener('click', () => {
    chrome.runtime.reload();
  });
  
  document.getElementById('clear-storage').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      outputArea.value = "Local storage cleared.";
    });
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    outputArea.select();
    document.execCommand('copy');
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = original, 1500);
  });
});
