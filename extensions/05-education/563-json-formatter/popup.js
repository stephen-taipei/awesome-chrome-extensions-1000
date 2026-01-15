document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('jsonInput');
  const jsonOutput = document.getElementById('jsonOutput');
  const formatBtn = document.getElementById('formatBtn');
  const minifyBtn = document.getElementById('minifyBtn');
  const validateBtn = document.getElementById('validateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const indentSize = document.getElementById('indentSize');
  const sortKeys = document.getElementById('sortKeys');
  const statusMessage = document.getElementById('statusMessage');
  const sizeInfo = document.getElementById('sizeInfo');
  const keyCount = document.getElementById('keyCount');

  // Show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    setTimeout(() => {
      statusMessage.className = 'status-message';
    }, 3000);
  }

  // Count keys in object
  function countKeys(obj) {
    let count = 0;
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach(item => count += countKeys(item));
      } else {
        count += Object.keys(obj).length;
        Object.values(obj).forEach(val => count += countKeys(val));
      }
    }
    return count;
  }

  // Sort object keys recursively
  function sortObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);

    return Object.keys(obj).sort().reduce((sorted, key) => {
      sorted[key] = sortObject(obj[key]);
      return sorted;
    }, {});
  }

  // Syntax highlight JSON
  function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  // Get indent value
  function getIndent() {
    const value = indentSize.value;
    return value === 'tab' ? '\t' : parseInt(value);
  }

  // Format JSON
  function formatJSON() {
    try {
      let parsed = JSON.parse(jsonInput.value);

      if (sortKeys.checked) {
        parsed = sortObject(parsed);
      }

      const formatted = JSON.stringify(parsed, null, getIndent());
      jsonOutput.innerHTML = syntaxHighlight(formatted);

      sizeInfo.textContent = `Size: ${new Blob([formatted]).size} bytes`;
      keyCount.textContent = `Keys: ${countKeys(parsed)}`;

      showStatus('JSON formatted successfully!', 'success');
    } catch (e) {
      showStatus(`Error: ${e.message}`, 'error');
    }
  }

  // Minify JSON
  function minifyJSON() {
    try {
      const parsed = JSON.parse(jsonInput.value);
      const minified = JSON.stringify(parsed);
      jsonOutput.innerHTML = syntaxHighlight(minified);

      sizeInfo.textContent = `Size: ${new Blob([minified]).size} bytes`;
      keyCount.textContent = `Keys: ${countKeys(parsed)}`;

      showStatus('JSON minified successfully!', 'success');
    } catch (e) {
      showStatus(`Error: ${e.message}`, 'error');
    }
  }

  // Validate JSON
  function validateJSON() {
    try {
      const parsed = JSON.parse(jsonInput.value);
      showStatus('Valid JSON!', 'success');

      sizeInfo.textContent = `Size: ${new Blob([jsonInput.value]).size} bytes`;
      keyCount.textContent = `Keys: ${countKeys(parsed)}`;
    } catch (e) {
      showStatus(`Invalid JSON: ${e.message}`, 'error');
    }
  }

  // Copy to clipboard
  function copyOutput() {
    const text = jsonOutput.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        showStatus('Copied to clipboard!', 'success');
      });
    }
  }

  // Clear all
  function clearAll() {
    jsonInput.value = '';
    jsonOutput.innerHTML = '';
    statusMessage.className = 'status-message';
    sizeInfo.textContent = 'Size: 0 bytes';
    keyCount.textContent = 'Keys: 0';
  }

  // Event listeners
  formatBtn.addEventListener('click', formatJSON);
  minifyBtn.addEventListener('click', minifyJSON);
  validateBtn.addEventListener('click', validateJSON);
  copyBtn.addEventListener('click', copyOutput);
  clearBtn.addEventListener('click', clearAll);

  // Load saved preferences
  chrome.storage.local.get(['jsonIndent', 'jsonSortKeys'], (result) => {
    if (result.jsonIndent) indentSize.value = result.jsonIndent;
    if (result.jsonSortKeys) sortKeys.checked = result.jsonSortKeys;
  });

  // Save preferences
  indentSize.addEventListener('change', () => {
    chrome.storage.local.set({ jsonIndent: indentSize.value });
  });

  sortKeys.addEventListener('change', () => {
    chrome.storage.local.set({ jsonSortKeys: sortKeys.checked });
  });
});
