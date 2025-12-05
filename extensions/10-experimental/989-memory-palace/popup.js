document.addEventListener('DOMContentLoaded', () => {
  const memoryObjects = document.querySelectorAll('.memory-object');
  const vrBtn = document.getElementById('enter-vr');

  memoryObjects.forEach(obj => {
    obj.addEventListener('click', () => {
      alert(`You recalled: ${obj.title}`);
    });
  });

  vrBtn.addEventListener('click', () => {
    const originalText = vrBtn.textContent;
    vrBtn.textContent = 'Loading VR Environment...';
    
    setTimeout(() => {
      alert('VR Mode requires a compatible headset. (Simulation)');
      vrBtn.textContent = originalText;
    }, 1000);
  });
});
