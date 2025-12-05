document.addEventListener('DOMContentLoaded', () => {
  const bookmarkCountEl = document.getElementById('bookmark-count');
  const holoSearch = document.getElementById('holo-search');
  const depthRange = document.getElementById('depth-range');
  const viewBtns = document.querySelectorAll('.view-btn');
  const bookmarkCards = document.querySelectorAll('.bookmark-card');

  // Get bookmark count
  chrome.bookmarks.getTree((tree) => {
    let count = 0;
    function countBookmarks(nodes) {
      nodes.forEach(node => {
        if (node.url) count++;
        if (node.children) countBookmarks(node.children);
      });
    }
    countBookmarks(tree);
    bookmarkCountEl.textContent = count;
  });

  // Holographic hover effect
  bookmarkCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `
        perspective(1000px)
        rotateY(${x * 20}deg)
        rotateX(${-y * 20}deg)
        scale(1.05)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Search filtering
  holoSearch.addEventListener('input', () => {
    const query = holoSearch.value.toLowerCase();
    bookmarkCards.forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      if (title.includes(query) || query === '') {
        card.style.opacity = '1';
        card.classList.add('highlight');
      } else {
        card.style.opacity = '0.3';
        card.classList.remove('highlight');
      }
    });
  });

  // Depth focus slider
  depthRange.addEventListener('input', () => {
    const depth = depthRange.value;
    bookmarkCards.forEach(card => {
      const cardDepth = parseInt(getComputedStyle(card).getPropertyValue('--depth'));
      const distance = Math.abs(cardDepth - depth / 3);
      card.style.filter = `blur(${distance * 2}px)`;
      card.style.opacity = 1 - distance * 0.3;
    });
  });

  // View mode switching
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      console.log('View mode:', btn.dataset.view);
    });
  });
});
