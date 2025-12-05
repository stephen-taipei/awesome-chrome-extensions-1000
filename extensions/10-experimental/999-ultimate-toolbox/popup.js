document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const toolsGrid = document.getElementById('tools-grid');
  const categoryBtns = document.querySelectorAll('.category-btn');
  
  let allExtensions = [];
  let currentCategory = 'all';

  // Initialize
  loadExtensions();

  // Event Listeners
  searchInput.addEventListener('input', handleSearch);
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter
      currentCategory = btn.dataset.category;
      renderTools();
    });
  });

  function loadExtensions() {
    chrome.management.getAll((extensions) => {
      // Filter only enabled extensions and exclude self
      allExtensions = extensions.filter(ext => 
        ext.enabled && 
        ext.type === 'extension' && 
        ext.id !== chrome.runtime.id
      );
      renderTools();
    });
  }

  function handleSearch(e) {
    renderTools(e.target.value.toLowerCase());
  }

  function renderTools(searchTerm = '') {
    toolsGrid.innerHTML = '';
    
    const filtered = allExtensions.filter(ext => {
      const matchesSearch = ext.name.toLowerCase().includes(searchTerm) || 
                          (ext.description && ext.description.toLowerCase().includes(searchTerm));
      
      // In a real app, we would have real categories. 
      // For this demo, we'll just return true for 'all' or mock random logic
      const matchesCategory = currentCategory === 'all' ? true : true; 

      return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
      toolsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">No tools found</div>';
      return;
    }

    filtered.forEach(ext => {
      const item = document.createElement('div');
      item.className = 'tool-item';
      item.title = ext.description || ext.name;
      
      // Attempt to get the largest icon available
      const iconUrl = ext.icons ? ext.icons[ext.icons.length - 1].url : '';
      
      const iconDiv = document.createElement('div');
      if (iconUrl) {
          const img = document.createElement('img');
          img.src = iconUrl;
          img.style.width = '32px';
          img.style.height = '32px';
          iconDiv.appendChild(img);
      } else {
          iconDiv.className = 'tool-icon';
          iconDiv.textContent = ext.name.charAt(0).toUpperCase();
      }
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'tool-name';
      nameDiv.textContent = ext.name; // Truncate if too long in CSS

      item.appendChild(iconDiv);
      item.appendChild(nameDiv);
      
      // On click, maybe we can launch it or show options? 
      // Since we can't easily "launch" a browser action of another extension, 
      // we'll just open its options page if available, or focus it.
      item.addEventListener('click', () => {
        if (ext.optionsUrl) {
            chrome.tabs.create({ url: ext.optionsUrl });
        } else {
            // Just show a message or something
            alert(`Selected: ${ext.name}\nID: ${ext.id}`);
        }
      });

      toolsGrid.appendChild(item);
    });
  });
