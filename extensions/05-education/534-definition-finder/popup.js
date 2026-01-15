document.addEventListener('DOMContentLoaded', () => {
  const captureTermBtn = document.getElementById('captureTermBtn');
  const termCapture = document.getElementById('termCapture');
  const capturedTerm = document.getElementById('capturedTerm');
  const definitionInput = document.getElementById('definitionInput');
  const categorySelect = document.getElementById('categorySelect');
  const saveTermBtn = document.getElementById('saveTermBtn');
  const searchTerms = document.getElementById('searchTerms');
  const filterCategory = document.getElementById('filterCategory');
  const termsList = document.getElementById('termsList');
  const termCount = document.getElementById('termCount');

  let currentTerm = '';

  loadTerms();

  captureTermBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    }, (results) => {
      if (results && results[0] && results[0].result) {
        currentTerm = results[0].result;
        capturedTerm.textContent = currentTerm;
        termCapture.style.display = 'block';
        definitionInput.value = '';
        categorySelect.value = '';
        definitionInput.focus();
      } else {
        alert('Please select a term on the page first');
      }
    });
  });

  saveTermBtn.addEventListener('click', () => {
    const definition = definitionInput.value.trim();
    if (!definition) {
      alert('Please enter a definition');
      return;
    }

    chrome.storage.local.get(['vocabulary'], (result) => {
      const vocabulary = result.vocabulary || [];

      const existing = vocabulary.findIndex(v =>
        v.term.toLowerCase() === currentTerm.toLowerCase()
      );

      const termData = {
        id: Date.now(),
        term: currentTerm,
        definition: definition,
        category: categorySelect.value,
        date: new Date().toISOString()
      };

      if (existing >= 0) {
        vocabulary[existing] = termData;
      } else {
        vocabulary.unshift(termData);
      }

      chrome.storage.local.set({ vocabulary }, () => {
        termCapture.style.display = 'none';
        currentTerm = '';
        loadTerms();
      });
    });
  });

  searchTerms.addEventListener('input', loadTerms);
  filterCategory.addEventListener('change', loadTerms);

  function loadTerms() {
    chrome.storage.local.get(['vocabulary'], (result) => {
      let vocabulary = result.vocabulary || [];
      termCount.textContent = vocabulary.length;

      const search = searchTerms.value.trim().toLowerCase();
      const category = filterCategory.value;

      if (search) {
        vocabulary = vocabulary.filter(v =>
          v.term.toLowerCase().includes(search) ||
          v.definition.toLowerCase().includes(search)
        );
      }

      if (category) {
        vocabulary = vocabulary.filter(v => v.category === category);
      }

      if (vocabulary.length === 0) {
        termsList.innerHTML = '<p class="empty-message">No terms found</p>';
        return;
      }

      termsList.innerHTML = vocabulary.map(v => `
        <div class="term-item">
          <button class="delete-btn" data-id="${v.id}">&times;</button>
          <div class="term">${escapeHtml(v.term)}</div>
          <div class="definition">${escapeHtml(v.definition)}</div>
          <div class="meta">
            ${v.category ? `<span class="category">${v.category}</span>` : '<span></span>'}
            <span>${new Date(v.date).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');

      termsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTerm(parseInt(btn.dataset.id)));
      });
    });
  }

  function deleteTerm(id) {
    chrome.storage.local.get(['vocabulary'], (result) => {
      const vocabulary = (result.vocabulary || []).filter(v => v.id !== id);
      chrome.storage.local.set({ vocabulary }, loadTerms);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
