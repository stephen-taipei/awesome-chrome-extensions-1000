const params = new URLSearchParams(window.location.search);
    const site = params.get('site') || 'this website';
    document.getElementById('siteName').textContent = site;
