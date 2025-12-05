document.addEventListener('DOMContentLoaded', () => {
  const activateBtns = document.querySelectorAll('.activate-btn');
  const profileItems = document.querySelectorAll('.profile-item');

  activateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.profile-item');
      switchProfile(item);
    });
  });

  function switchProfile(newItem) {
    // Reset UI
    profileItems.forEach(item => {
      item.classList.remove('active');
      const badge = item.querySelector('.active-badge');
      if (badge) badge.remove();
      
      if (!item.querySelector('.activate-btn')) {
        const btn = document.createElement('button');
        btn.className = 'activate-btn';
        btn.textContent = 'Switch';
        btn.addEventListener('click', (e) => switchProfile(e.target.closest('.profile-item')));
        item.appendChild(btn);
      }
    });

    // Set new active
    newItem.classList.add('active');
    newItem.querySelector('.activate-btn').remove();
    
    const badge = document.createElement('span');
    badge.className = 'active-badge';
    badge.textContent = 'Active';
    newItem.appendChild(badge);
    
    // Logic to actually switch profiles would go here
    console.log(`Switched to profile: ${newItem.dataset.id}`);
  }
});
