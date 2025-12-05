document.addEventListener('DOMContentLoaded', () => {
  const meterFill = document.getElementById('meter-fill');
  const sentimentText = document.getElementById('sentiment-text');
  const moodIcon = document.getElementById('mood-icon');
  const btns = document.querySelectorAll('.response-btn');

  // Simulate analysis
  setTimeout(() => {
    // Random sentiment for demo
    const sentiment = Math.random();
    const percent = Math.round(sentiment * 100);
    
    meterFill.style.width = `${percent}%`;
    
    if (percent < 33) {
      sentimentText.textContent = 'Negative';
      moodIcon.textContent = '😟';
    } else if (percent < 66) {
      sentimentText.textContent = 'Neutral';
      moodIcon.textContent = '😐';
    } else {
      sentimentText.textContent = 'Positive';
      moodIcon.textContent = '🙂';
    }
  }, 500);

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      console.log(`Mode switched to: ${btn.dataset.mode}`);
    });
  });
});
