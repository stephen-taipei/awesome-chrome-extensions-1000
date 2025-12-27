// Voice Memo - Popup Script

class VoiceMemo {
  constructor() {
    this.memos = [];
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
    this.timerInterval = null;
    this.currentBlob = null;
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.visualizer = document.getElementById('visualizer');
    this.timerEl = document.getElementById('timer');
    this.recordBtn = document.getElementById('recordBtn');
    this.recordLabel = document.querySelector('.record-label');
    this.currentSection = document.getElementById('currentRecording');
    this.audioPlayer = document.getElementById('audioPlayer');
    this.memoNameEl = document.getElementById('memoName');
    this.saveBtn = document.getElementById('saveMemo');
    this.discardBtn = document.getElementById('discardMemo');
    this.listEl = document.getElementById('memosList');
  }

  bindEvents() {
    this.recordBtn.addEventListener('click', () => this.toggleRecording());
    this.saveBtn.addEventListener('click', () => this.saveMemo());
    this.discardBtn.addEventListener('click', () => this.discardMemo());
  }

  async loadData() {
    const result = await chrome.storage.local.get('voiceMemos');
    if (result.voiceMemos) {
      this.memos = result.voiceMemos;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ voiceMemos: this.memos });
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.currentBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(this.currentBlob);
        this.audioPlayer.src = audioUrl;
        this.currentSection.style.display = 'block';
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.startTime = Date.now();
      this.updateTimer();
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);

      this.recordBtn.classList.add('recording');
      this.visualizer.classList.add('recording');
      this.recordLabel.textContent = 'Recording...';
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please grant permission.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      clearInterval(this.timerInterval);

      this.recordBtn.classList.remove('recording');
      this.visualizer.classList.remove('recording');
      this.recordLabel.textContent = 'Tap to Record';
    }
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    this.timerEl.textContent = `${mins}:${secs}`;
  }

  async saveMemo() {
    if (!this.currentBlob) return;

    const name = this.memoNameEl.value.trim() || `Memo ${this.memos.length + 1}`;
    const duration = this.timerEl.textContent;

    // Convert blob to base64 for storage
    const reader = new FileReader();
    reader.onloadend = async () => {
      this.memos.unshift({
        id: Date.now(),
        name,
        duration,
        audioData: reader.result,
        createdAt: Date.now()
      });

      // Keep only last 10 memos to save storage space
      if (this.memos.length > 10) {
        this.memos.pop();
      }

      await this.saveData();
      this.discardMemo();
      this.render();
    };
    reader.readAsDataURL(this.currentBlob);
  }

  discardMemo() {
    this.currentBlob = null;
    this.audioPlayer.src = '';
    this.memoNameEl.value = '';
    this.timerEl.textContent = '00:00';
    this.currentSection.style.display = 'none';
  }

  deleteMemo(id) {
    this.memos = this.memos.filter(m => m.id !== id);
    this.saveData();
    this.render();
  }

  render() {
    if (this.memos.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved memos yet</div>';
      return;
    }

    this.listEl.innerHTML = this.memos.map(memo => `
      <div class="memo-item">
        <div class="memo-header">
          <span class="memo-name">${this.escapeHtml(memo.name)}</span>
          <span class="memo-duration">${memo.duration}</span>
        </div>
        <audio controls src="${memo.audioData}"></audio>
        <div class="memo-actions">
          <button class="delete-memo-btn" data-delete="${memo.id}">Delete</button>
        </div>
      </div>
    `).join('');

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteMemo(parseInt(btn.dataset.delete)));
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => new VoiceMemo());
