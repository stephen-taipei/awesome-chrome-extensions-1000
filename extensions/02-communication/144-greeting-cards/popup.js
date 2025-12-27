// Greeting Cards - Popup Script

class GreetingCards {
  constructor() {
    this.cards = [];
    this.currentOccasion = 'birthday';
    this.occasions = {
      birthday: { icon: '🎂', name: 'Birthday', border: '🎈' },
      holiday: { icon: '🎄', name: 'Holiday', border: '❄️' },
      congrats: { icon: '🎉', name: 'Congratulations', border: '⭐' },
      thanks: { icon: '💝', name: 'Thank You', border: '💕' },
      sympathy: { icon: '💐', name: 'Sympathy', border: '🕊️' },
      love: { icon: '❤️', name: 'Love', border: '💗' }
    };
    this.initElements();
    this.bindEvents();
    this.loadData();
  }

  initElements() {
    this.occasionBtns = document.querySelectorAll('.occasion-btn');
    this.recipientEl = document.getElementById('recipient');
    this.messageEl = document.getElementById('message');
    this.senderEl = document.getElementById('sender');
    this.copyBtn = document.getElementById('copyCard');
    this.saveBtn = document.getElementById('saveCard');
    this.listEl = document.getElementById('cardList');
  }

  bindEvents() {
    this.occasionBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setOccasion(btn.dataset.occasion));
    });
    this.copyBtn.addEventListener('click', () => this.copyCard());
    this.saveBtn.addEventListener('click', () => this.saveCard());
  }

  async loadData() {
    const result = await chrome.storage.local.get('savedGreetingCards');
    if (result.savedGreetingCards) {
      this.cards = result.savedGreetingCards;
    }
    this.render();
  }

  async saveData() {
    await chrome.storage.local.set({ savedGreetingCards: this.cards });
  }

  setOccasion(occasion) {
    this.currentOccasion = occasion;
    this.occasionBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.occasion === occasion);
    });
  }

  formatCard() {
    const occasion = this.occasions[this.currentOccasion];
    const recipient = this.recipientEl.value.trim();
    const message = this.messageEl.value.trim();
    const sender = this.senderEl.value.trim();

    if (!recipient && !message) return '';

    const border = (occasion.border + ' ').repeat(10);
    let card = `${border}\n\n`;
    card += `${occasion.icon} ${occasion.name.toUpperCase()} ${occasion.icon}\n\n`;

    if (recipient) {
      card += `Dear ${recipient},\n\n`;
    }

    if (message) {
      card += `${message}\n\n`;
    } else {
      card += `Wishing you all the best!\n\n`;
    }

    if (sender) {
      card += `With love,\n${sender}\n\n`;
    }

    card += border;

    return card;
  }

  async copyCard() {
    const card = this.formatCard();
    if (!card) return;

    await navigator.clipboard.writeText(card);

    const original = this.copyBtn.textContent;
    this.copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = original;
    }, 1500);
  }

  saveCard() {
    const recipient = this.recipientEl.value.trim();
    const message = this.messageEl.value.trim();
    if (!recipient && !message) return;

    const card = {
      id: Date.now(),
      occasion: this.currentOccasion,
      recipient: recipient,
      message: message,
      sender: this.senderEl.value.trim()
    };

    this.cards.unshift(card);
    if (this.cards.length > 10) {
      this.cards.pop();
    }

    this.saveData();
    this.render();

    const original = this.saveBtn.textContent;
    this.saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.saveBtn.textContent = original;
    }, 1500);
  }

  useCard(id) {
    const card = this.cards.find(c => c.id === id);
    if (card) {
      this.setOccasion(card.occasion);
      this.recipientEl.value = card.recipient || '';
      this.messageEl.value = card.message || '';
      this.senderEl.value = card.sender || '';
    }
  }

  deleteCard(id) {
    this.cards = this.cards.filter(c => c.id !== id);
    this.saveData();
    this.render();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    if (this.cards.length === 0) {
      this.listEl.innerHTML = '<div class="empty-state">No saved cards</div>';
      return;
    }

    this.listEl.innerHTML = this.cards.map(c => {
      const occasion = this.occasions[c.occasion];
      return `
        <div class="card-item">
          <div class="card-info">
            <div class="card-occasion">${occasion.icon} ${occasion.name}</div>
            <div class="card-preview">To: ${this.escapeHtml(c.recipient || 'Unknown')}</div>
          </div>
          <div class="card-actions">
            <button class="use-btn" data-use="${c.id}">Use</button>
            <button class="delete-btn" data-delete="${c.id}">Del</button>
          </div>
        </div>
      `;
    }).join('');

    this.listEl.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => this.useCard(parseInt(btn.dataset.use)));
    });

    this.listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCard(parseInt(btn.dataset.delete)));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new GreetingCards());
