// Greeting Cards - Popup Script

const GREETINGS = {
  birthday: [
    "🎂 Happy Birthday, {name}! May your special day be filled with love, laughter, and all the things that make you happy!",
    "🎈 Wishing you a wonderful birthday, {name}! May this year bring you endless joy and amazing adventures!",
    "🎁 Happy Birthday to someone truly special! {name}, may all your dreams come true today and always!",
    "🎉 Another year wiser, another year more amazing! Happy Birthday, {name}!",
    "🌟 {name}, on your birthday, I wish you a year filled with happiness, success, and beautiful moments!"
  ],
  thanks: [
    "🙏 Dear {name}, thank you so much for everything you do. Your kindness means the world to me!",
    "💝 {name}, I'm so grateful to have you in my life. Thank you for being amazing!",
    "✨ A heartfelt thank you to you, {name}! Your support and kindness never go unnoticed.",
    "🌸 {name}, words can't express how thankful I am. You're truly wonderful!",
    "💫 Thank you, {name}, for making a difference in my life. You're appreciated more than you know!"
  ],
  congrats: [
    "🎉 Congratulations, {name}! You did it! So proud of your amazing achievement!",
    "🏆 {name}, your hard work has paid off! Congratulations on this well-deserved success!",
    "🌟 Bravo, {name}! You're a superstar! Congratulations on reaching this milestone!",
    "🎊 {name}, you've earned every bit of this success! Congratulations!",
    "🥳 Way to go, {name}! Your dedication and talent have led to this amazing moment!"
  ],
  love: [
    "💕 {name}, you make every day brighter just by being you. Thinking of you with love!",
    "💖 To my dear {name}, you hold a special place in my heart. Sending you all my love!",
    "🌹 {name}, you're amazing in every way. Just wanted you to know how much you mean to me!",
    "💗 Every moment with you is special, {name}. You're loved more than words can say!",
    "💝 {name}, you're my favorite person. Sending you a big warm hug and all my love!"
  ]
};

class GreetingCards {
  constructor() {
    this.currentCategory = 'birthday';
    this.currentIndex = 0;
    this.initElements();
    this.bindEvents();
    this.updateCard();
  }

  initElements() {
    this.catBtns = document.querySelectorAll('.cat-btn');
    this.messageEl = document.getElementById('cardMessage');
    this.recipientEl = document.getElementById('recipientName');
    this.senderEl = document.getElementById('senderName');
    this.randomBtn = document.getElementById('randomBtn');
    this.copyBtn = document.getElementById('copyBtn');
  }

  bindEvents() {
    this.catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.currentIndex = 0;
        this.updateCard();
      });
    });

    this.recipientEl.addEventListener('input', () => this.updateCard());
    this.senderEl.addEventListener('input', () => this.updateCard());
    this.randomBtn.addEventListener('click', () => this.randomCard());
    this.copyBtn.addEventListener('click', () => this.copyCard());
  }

  updateCard() {
    const messages = GREETINGS[this.currentCategory];
    let message = messages[this.currentIndex];

    const recipientName = this.recipientEl.value.trim() || 'Friend';
    message = message.replace(/{name}/g, recipientName);

    const senderName = this.senderEl.value.trim();
    if (senderName) {
      message += `\n\nWith love,\n${senderName}`;
    }

    this.messageEl.textContent = message;
  }

  randomCard() {
    const messages = GREETINGS[this.currentCategory];
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * messages.length);
    } while (newIndex === this.currentIndex && messages.length > 1);

    this.currentIndex = newIndex;
    this.updateCard();
  }

  async copyCard() {
    const message = this.messageEl.textContent;
    await navigator.clipboard.writeText(message);

    const originalText = this.copyBtn.textContent;
    this.copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      this.copyBtn.textContent = originalText;
    }, 1500);
  }
}

document.addEventListener('DOMContentLoaded', () => new GreetingCards());
