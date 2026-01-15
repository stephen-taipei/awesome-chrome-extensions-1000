document.addEventListener('DOMContentLoaded', () => {
  const mapTitle = document.getElementById('mapTitle');
  const conceptText = document.getElementById('conceptText');
  const parentConcept = document.getElementById('parentConcept');
  const relationLabel = document.getElementById('relationLabel');
  const addConceptBtn = document.getElementById('addConceptBtn');
  const mapContainer = document.getElementById('mapContainer');
  const saveMapBtn = document.getElementById('saveMapBtn');
  const clearMapBtn = document.getElementById('clearMapBtn');
  const savedMaps = document.getElementById('savedMaps');

  let concepts = [];

  loadSavedMaps();

  addConceptBtn.addEventListener('click', addConcept);
  conceptText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addConcept();
  });

  function addConcept() {
    const text = conceptText.value.trim();
    if (!text) return;

    const newConcept = {
      id: Date.now(),
      text: text,
      parentId: parentConcept.value ? parseInt(parentConcept.value) : null,
      relation: relationLabel.value.trim()
    };

    concepts.push(newConcept);
    conceptText.value = '';
    relationLabel.value = '';

    updateParentDropdown();
    renderMap();
  }

  saveMapBtn.addEventListener('click', () => {
    const title = mapTitle.value.trim() || 'Untitled Map';

    chrome.storage.local.get(['conceptMaps'], (result) => {
      const maps = result.conceptMaps || [];
      maps.unshift({
        id: Date.now(),
        title: title,
        concepts: [...concepts],
        date: new Date().toISOString()
      });
      chrome.storage.local.set({ conceptMaps: maps.slice(0, 20) }, loadSavedMaps);
    });
  });

  clearMapBtn.addEventListener('click', () => {
    if (concepts.length > 0 && confirm('Clear current map?')) {
      concepts = [];
      mapTitle.value = '';
      updateParentDropdown();
      renderMap();
    }
  });

  function updateParentDropdown() {
    parentConcept.innerHTML = '<option value="">No parent (root)</option>' +
      concepts.map(c => `<option value="${c.id}">${escapeHtml(c.text)}</option>`).join('');
  }

  function renderMap() {
    saveMapBtn.disabled = concepts.length === 0;

    if (concepts.length === 0) {
      mapContainer.innerHTML = '<p class="empty-message">Add concepts to build your map</p>';
      return;
    }

    const rootConcepts = concepts.filter(c => c.parentId === null);
    mapContainer.innerHTML = rootConcepts.map(c => renderNode(c)).join('');

    mapContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteConcept(parseInt(btn.dataset.id)));
    });
  }

  function renderNode(concept) {
    const children = concepts.filter(c => c.parentId === concept.id);
    const isRoot = concept.parentId === null;

    let html = `
      <div class="concept-node">
        <div class="node-content">
          <span class="connector">${isRoot ? '' : '&#8594;'}</span>
          <div class="node-box ${isRoot ? 'root' : ''}">
            ${escapeHtml(concept.text)}
            <button class="delete-btn" data-id="${concept.id}">&times;</button>
          </div>
        </div>
        ${concept.relation ? `<div class="relation">${escapeHtml(concept.relation)}</div>` : ''}
    `;

    if (children.length > 0) {
      html += `<div class="children">${children.map(c => renderNode(c)).join('')}</div>`;
    }

    html += '</div>';
    return html;
  }

  function deleteConcept(id) {
    const deleteIds = [id];
    const findChildren = (parentId) => {
      concepts.filter(c => c.parentId === parentId).forEach(c => {
        deleteIds.push(c.id);
        findChildren(c.id);
      });
    };
    findChildren(id);

    concepts = concepts.filter(c => !deleteIds.includes(c.id));
    updateParentDropdown();
    renderMap();
  }

  function loadSavedMaps() {
    chrome.storage.local.get(['conceptMaps'], (result) => {
      const maps = result.conceptMaps || [];

      if (maps.length === 0) {
        savedMaps.innerHTML = '<p class="empty-message">No saved maps</p>';
        return;
      }

      savedMaps.innerHTML = maps.map(m => `
        <div class="saved-item" data-id="${m.id}">
          <button class="delete-btn" data-id="${m.id}">&times;</button>
          <div class="title">${escapeHtml(m.title)}</div>
          <div class="meta">${m.concepts.length} concepts - ${new Date(m.date).toLocaleDateString()}</div>
        </div>
      `).join('');

      savedMaps.querySelectorAll('.saved-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-btn')) return;
          loadMap(parseInt(item.dataset.id));
        });
      });

      savedMaps.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteMap(parseInt(btn.dataset.id));
        });
      });
    });
  }

  function loadMap(id) {
    chrome.storage.local.get(['conceptMaps'], (result) => {
      const maps = result.conceptMaps || [];
      const map = maps.find(m => m.id === id);
      if (map) {
        mapTitle.value = map.title;
        concepts = [...map.concepts];
        updateParentDropdown();
        renderMap();
      }
    });
  }

  function deleteMap(id) {
    chrome.storage.local.get(['conceptMaps'], (result) => {
      const maps = (result.conceptMaps || []).filter(m => m.id !== id);
      chrome.storage.local.set({ conceptMaps: maps }, loadSavedMaps);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
