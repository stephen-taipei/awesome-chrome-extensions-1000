// Voice Note - Popup Script
// Uses Web Speech API for voice-to-text conversion

class VoiceNote {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.transcript = '';
    this.notes = [];

    this.initElements();
    this.checkBrowserSupport();
    this.loadNotes();
    this.loadSettings();
    this.bindEvents();
  }

  initElements() {
    this.recordBtn = document.getElementById('recordBtn');
    this.statusText = this.recordBtn.querySelector('.status-text');
    this.waveform = document.getElementById('waveform');
    this.currentTranscript = document.getElementById('currentTranscript');
    this.languageSelect = document.getElementById('language');
    this.copyBtn = document.getElementById('copyBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.notesList = document.getElementById('notesList');
    this.toast = document.getElementById('toast');
  }

  checkBrowserSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      document.querySelector('.container').innerHTML = `
        <div class="unsupported-warning">
          <h2>瀏覽器不支援</h2>
          <p>您的瀏覽器不支援 Web Speech API。</p>
          <p>請使用 Chrome、Edge 或其他支援的瀏覽器。</p>
        </div>
      `;
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
    return true;
  }

  setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.languageSelect?.value || 'zh-TW';

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.recordBtn.classList.add('recording');
      this.statusText.textContent = '錄音中...';
      this.waveform.classList.remove('hidden');
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        // Auto restart if still recording
        try {
          this.recognition.start();
        } catch (e) {
          this.stopRecording();
        }
      }
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = this.transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += this.addPunctuation(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      this.transcript = finalTranscript;
      this.currentTranscript.value = finalTranscript + interimTranscript;
      this.currentTranscript.scrollTop = this.currentTranscript.scrollHeight;
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors, just continue
        return;
      }
      this.showToast(`錯誤：${event.error}`, 'error');
      this.stopRecording();
    };
  }

  addPunctuation(text) {
    // Add basic punctuation based on pauses
    let result = text.trim();

    if (result.length > 0) {
      // Add period if ends with common ending patterns
      const endings = ['了', '的', '嗎', '呢', '吧', '啊', '喔', '耶'];
      const lastChar = result[result.length - 1];

      if (!['。', '！', '？', '，', '.', '!', '?', ','].includes(lastChar)) {
        if (endings.includes(lastChar)) {
          result += '。';
        } else {
          result += '，';
        }
      }

      result += ' ';
    }

    return result;
  }

  startRecording() {
    try {
      this.recognition.lang = this.languageSelect.value;
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.showToast('無法開始錄音', 'error');
    }
  }

  stopRecording() {
    this.isRecording = false;
    this.recordBtn.classList.remove('recording');
    this.statusText.textContent = '點擊開始錄音';
    this.waveform.classList.add('hidden');

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  async loadNotes() {
    try {
      const result = await chrome.storage.local.get(['voiceNotes']);
      this.notes = result.voiceNotes || [];
      this.renderNotes();
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  async saveNote() {
    const text = this.currentTranscript.value.trim();
    if (!text) {
      this.showToast('沒有可儲存的內容', 'error');
      return;
    }

    const note = {
      id: Date.now(),
      text: text,
      timestamp: new Date().toISOString(),
      language: this.languageSelect.value
    };

    this.notes.unshift(note);

    // Keep only last 100 notes
    if (this.notes.length > 100) {
      this.notes = this.notes.slice(0, 100);
    }

    try {
      await chrome.storage.local.set({ voiceNotes: this.notes });
      this.renderNotes();
      this.clearTranscript();
      this.showToast('已儲存', 'success');
    } catch (error) {
      console.error('Failed to save note:', error);
      this.showToast('儲存失敗', 'error');
    }
  }

  async deleteNote(id) {
    this.notes = this.notes.filter(note => note.id !== id);

    try {
      await chrome.storage.local.set({ voiceNotes: this.notes });
      this.renderNotes();
      this.showToast('已刪除', 'success');
    } catch (error) {
      console.error('Failed to delete note:', error);
      this.showToast('刪除失敗', 'error');
    }
  }

  async clearAllNotes() {
    if (!confirm('確定要清除所有筆記嗎？')) {
      return;
    }

    this.notes = [];

    try {
      await chrome.storage.local.set({ voiceNotes: [] });
      this.renderNotes();
      this.showToast('已清除所有筆記', 'success');
    } catch (error) {
      console.error('Failed to clear notes:', error);
      this.showToast('清除失敗', 'error');
    }
  }

  renderNotes() {
    if (this.notes.length === 0) {
      this.notesList.innerHTML = '<p class="empty-message">尚無儲存的筆記</p>';
      return;
    }

    this.notesList.innerHTML = this.notes.map(note => `
      <div class="note-item" data-id="${note.id}">
        <div class="note-text">${this.escapeHtml(note.text)}</div>
        <div class="note-meta">
          <span class="note-time">${this.formatTime(note.timestamp)}</span>
          <div class="note-actions">
            <button class="copy-note-btn" data-text="${this.escapeAttr(note.text)}">複製</button>
            <button class="delete-btn" data-id="${note.id}">刪除</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeAttr(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '剛剛';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分鐘前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小時前`;
    } else {
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('已複製到剪貼簿', 'success');
    }).catch(() => {
      this.showToast('複製失敗', 'error');
    });
  }

  clearTranscript() {
    this.transcript = '';
    this.currentTranscript.value = '';
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['voiceNoteLanguage']);
      if (result.voiceNoteLanguage) {
        this.languageSelect.value = result.voiceNoteLanguage;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.local.set({
        voiceNoteLanguage: this.languageSelect.value
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  showToast(message, type = '') {
    this.toast.textContent = message;
    this.toast.className = 'toast';
    if (type) {
      this.toast.classList.add(type);
    }

    setTimeout(() => {
      this.toast.classList.add('hidden');
    }, 2000);
  }

  bindEvents() {
    this.recordBtn.addEventListener('click', () => this.toggleRecording());

    this.languageSelect.addEventListener('change', () => {
      this.saveSettings();
      if (this.recognition) {
        this.recognition.lang = this.languageSelect.value;
      }
    });

    this.copyBtn.addEventListener('click', () => {
      const text = this.currentTranscript.value.trim();
      if (text) {
        this.copyToClipboard(text);
      } else {
        this.showToast('沒有可複製的內容', 'error');
      }
    });

    this.saveBtn.addEventListener('click', () => this.saveNote());
    this.clearBtn.addEventListener('click', () => this.clearTranscript());
    this.clearAllBtn.addEventListener('click', () => this.clearAllNotes());

    this.notesList.addEventListener('click', (e) => {
      const target = e.target;

      if (target.classList.contains('copy-note-btn')) {
        const text = target.dataset.text;
        this.copyToClipboard(text);
      } else if (target.classList.contains('delete-btn')) {
        const id = parseInt(target.dataset.id);
        this.deleteNote(id);
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new VoiceNote();
});
