document.addEventListener('DOMContentLoaded', () => {
  const listenBtn = document.getElementById('listen-btn');
  const commandText = document.getElementById('command-text');
  const commandResult = document.getElementById('command-result');
  const listeningIndicator = document.getElementById('listening-indicator');
  const micIcon = document.getElementById('mic-icon');

  let isListening = false;
  let recognition = null;

  // Check for speech recognition support
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      commandText.textContent = transcript;

      if (event.results[0].isFinal) {
        executeCommand(transcript);
      }
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.onerror = (event) => {
      commandResult.textContent = `Error: ${event.error}`;
      stopListening();
    };
  }

  function startListening() {
    if (recognition) {
      isListening = true;
      recognition.start();
      listenBtn.textContent = 'Stop Listening';
      listenBtn.classList.add('active');
      listeningIndicator.querySelector('span').textContent = 'Listening...';
      listeningIndicator.classList.add('active');
      micIcon.style.animation = 'pulse 0.5s infinite';
    }
  }

  function stopListening() {
    isListening = false;
    if (recognition) recognition.stop();
    listenBtn.textContent = 'Start Listening';
    listenBtn.classList.remove('active');
    listeningIndicator.querySelector('span').textContent = 'Ready to Listen';
    listeningIndicator.classList.remove('active');
    micIcon.style.animation = '';
  }

  function executeCommand(command) {
    chrome.runtime.sendMessage({ type: 'EXECUTE_COMMAND', command }, (response) => {
      if (response && response.success) {
        commandResult.textContent = `✓ Executed: ${response.action.replace('_', ' ')}`;
        commandResult.style.color = '#2ecc71';
      } else {
        commandResult.textContent = '✗ Command not recognized';
        commandResult.style.color = '#e74c3c';
      }
    });
  }

  listenBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  // Load settings
  chrome.storage.local.get(['continuousListening', 'voiceFeedback'], (data) => {
    document.getElementById('continuous-toggle').checked = data.continuousListening || false;
    document.getElementById('feedback-toggle').checked = data.voiceFeedback !== false;
  });

  // Save settings
  document.getElementById('continuous-toggle').addEventListener('change', (e) => {
    chrome.storage.local.set({ continuousListening: e.target.checked });
  });

  document.getElementById('feedback-toggle').addEventListener('change', (e) => {
    chrome.storage.local.set({ voiceFeedback: e.target.checked });
  });
});
