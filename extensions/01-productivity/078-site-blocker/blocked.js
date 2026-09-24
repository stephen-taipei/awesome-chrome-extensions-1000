const params = new URLSearchParams(window.location.search);
    const site = params.get('site');
    if (site) {
      document.getElementById('siteName').textContent = site;
    }
document.getElementById('backButton').addEventListener('click', () => history.back());
