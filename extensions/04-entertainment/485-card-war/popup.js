document.addEventListener('DOMContentLoaded', () => {
  const playerCard = document.getElementById('player-card');
  const cpuCard = document.getElementById('cpu-card');
  const playerScoreEl = document.getElementById('player-score');
  const cpuScoreEl = document.getElementById('cpu-score');
  const winsEl = document.getElementById('wins');
  const messageEl = document.getElementById('message');
  const drawBtn = document.getElementById('draw-btn');

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const suitSymbols = { hearts: '\u2665', diamonds: '\u2666', clubs: '\u2663', spades: '\u2660' };
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  let playerScore = 0, cpuScore = 0, wins = 0, deck = [], round = 0;

  const loadStats = () => chrome.storage.local.get(['cardWarWins'], r => { wins = r.cardWarWins || 0; winsEl.textContent = wins; });
  const saveStats = () => chrome.storage.local.set({ cardWarWins: wins });

  const createDeck = () => {
    deck = [];
    suits.forEach(suit => values.forEach(value => deck.push({ suit, value, rank: values.indexOf(value) })));
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  };

  const displayCard = (card, element) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    element.className = `card ${isRed ? 'red' : 'black'}`;
    element.innerHTML = `<span>${card.value}</span><span class="suit">${suitSymbols[card.suit]}</span>`;
  };

  const drawCards = () => {
    if (deck.length < 2) {
      if (playerScore > cpuScore) { wins++; saveStats(); winsEl.textContent = wins; messageEl.textContent = 'You won the game!'; }
      else if (cpuScore > playerScore) messageEl.textContent = 'CPU won the game!';
      else messageEl.textContent = "It's a tie game!";
      drawBtn.textContent = 'New Game'; return;
    }
    const pCard = deck.pop(), cCard = deck.pop();
    displayCard(pCard, playerCard); displayCard(cCard, cpuCard);
    round++;
    if (pCard.rank > cCard.rank) { playerScore++; messageEl.textContent = 'You win this round!'; }
    else if (cCard.rank > pCard.rank) { cpuScore++; messageEl.textContent = 'CPU wins this round!'; }
    else messageEl.textContent = "It's a tie!";
    playerScoreEl.textContent = playerScore; cpuScoreEl.textContent = cpuScore;
    if (deck.length < 2) { drawBtn.textContent = 'See Result'; }
  };

  const startGame = () => {
    createDeck(); playerScore = 0; cpuScore = 0; round = 0;
    playerScoreEl.textContent = 0; cpuScoreEl.textContent = 0;
    playerCard.className = 'card'; playerCard.innerHTML = '';
    cpuCard.className = 'card'; cpuCard.innerHTML = '';
    messageEl.textContent = 'Click Draw to play!';
    drawBtn.textContent = 'Draw Card';
  };

  drawBtn.addEventListener('click', () => { if (drawBtn.textContent === 'New Game') startGame(); else drawCards(); });
  loadStats(); startGame();
});
