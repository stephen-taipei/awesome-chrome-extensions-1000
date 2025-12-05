document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-rule-btn');

  addBtn.addEventListener('click', () => {
    // Placeholder for rule creation UI
    const ruleName = prompt('Enter rule name (e.g., "Meeting Mode"):');
    if (ruleName) {
      alert(`Rule "${ruleName}" created! (Configuration logic simulated)`);
    }
  });

  // Request Geolocation (just to trigger permission prompt in a real scenario)
  // navigator.geolocation.getCurrentPosition(pos => console.log(pos), err => console.error(err));
});
