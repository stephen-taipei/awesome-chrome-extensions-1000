// Word Ladder - Popup Script
class WordLadder {
  constructor() {
    this.words = ['COLD', 'WARM', 'FISH', 'BIRD', 'LOVE', 'HATE', 'DARK', 'LIGHT', 'FAST', 'SLOW'];
    this.dictionary = ['COLD', 'CORD', 'CARD', 'CARE', 'DARE', 'DARK', 'WARM', 'WORM', 'WORD', 'WARD', 'HARD', 'HARE', 'HAVE', 'HATE', 'LATE', 'LANE', 'LINE', 'FINE', 'FIND', 'FOND', 'FOOD', 'FOOT', 'BOOT', 'BOAT', 'COAT', 'COST', 'LOST', 'LOSE', 'LOVE', 'LIVE', 'GIVE', 'GAVE', 'CAVE', 'COME', 'COME', 'HOME', 'HOLE', 'HOLD', 'GOLD', 'BOLD', 'BALD', 'BALL', 'CALL', 'CALM', 'PALM', 'PALE', 'TALE', 'TALL', 'TALK', 'WALK', 'WALL', 'WILL', 'WILD', 'MILD', 'MIND', 'MINT', 'HINT', 'HUNT', 'HURT', 'BURN', 'BORN', 'TORN', 'TURN', 'TUNE', 'TONE', 'BONE', 'BORE', 'MORE', 'MOVE', 'MAKE', 'TAKE', 'FAKE', 'FACE', 'RACE', 'RICE', 'RISE', 'WISE', 'WINE', 'WIPE', 'PIPE', 'PILE', 'FILE', 'FILL', 'FILM', 'FIRM', 'FIRE', 'FISH', 'FIST', 'MIST', 'MISS', 'MASS', 'PASS', 'PAST', 'FAST', 'LAST', 'CAST', 'CASE', 'BASE', 'BARE', 'BARK', 'BACK', 'PACK', 'PICK', 'PINK', 'SINK', 'SING', 'RING', 'KING', 'KIND', 'BIND', 'BIRD', 'WORD', 'WORK', 'FORK', 'FORM', 'FARM', 'HARM', 'HARP', 'HARD', 'HAND', 'LAND', 'SAND', 'BAND', 'BEND', 'SEND', 'SENT', 'RENT', 'REST', 'BEST', 'WEST', 'TEST', 'TEXT', 'NEXT', 'NEST', 'PEST', 'POST', 'PORT', 'PART', 'PARK', 'MARK', 'MARS', 'CARS', 'CARD', 'CART', 'PART', 'DART', 'DATE', 'GATE', 'LATE', 'LAKE', 'LIKE', 'LIFE', 'LIFT', 'LEFT', 'LOFT', 'SOFT', 'SORT', 'SORE', 'SURE', 'PURE', 'CURE', 'CORE', 'COME', 'CODE', 'MODE', 'MADE', 'MALE', 'MALL', 'MEAL', 'MEAN', 'MEAT', 'SEAT', 'SEAL', 'REAL', 'READ', 'ROAD', 'ROAR', 'BOAR', 'BEAR', 'BEAN', 'BEEN', 'BEER', 'DEER', 'DEEP', 'KEEP', 'KEEN', 'SEEN', 'SEED', 'NEED', 'FEED', 'FEEL', 'FEET', 'MEET', 'MELT', 'BELT', 'BELL', 'WELL', 'SELL', 'CELL', 'FELL', 'FEEL', 'PEEL', 'PEER', 'FEAR', 'HEAR', 'HEAT', 'HEAD', 'DEAD', 'DEAL', 'HEAL', 'HEAP', 'LEAP', 'LEAN', 'LEAD', 'LOAD', 'LOAN', 'MOON', 'NOON', 'SOON', 'SOUP', 'SOUL', 'FOUL', 'FOUR', 'POUR', 'TOUR', 'SOUR', 'HOUR', 'YOUR'];
    this.score = 0;
    this.moves = 0;
    this.start = '';
    this.current = '';
    this.target = '';
    this.history = [];
    this.init();
  }
  init() {
    chrome.storage.local.get(['wordLadderScore'], (r) => {
      this.score = r.wordLadderScore || 0;
      document.getElementById('score').textContent = this.score;
    });
    document.getElementById('submitBtn').addEventListener('click', () => this.submit());
    document.getElementById('input').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.submit(); });
    this.newGame();
  }
  newGame() {
    const pairs = [['COLD', 'WARM'], ['LOVE', 'HATE'], ['FISH', 'BIRD'], ['DARK', 'GOLD'], ['FAST', 'SLOW']];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    this.start = pair[0];
    this.current = pair[0];
    this.target = pair[1];
    this.moves = 0;
    this.history = [];
    document.getElementById('startWord').textContent = this.start;
    document.getElementById('currentWord').textContent = this.current;
    document.getElementById('targetWord').textContent = this.target;
    document.getElementById('moves').textContent = '0';
    document.getElementById('input').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('history').textContent = '';
  }
  isOneLetterDiff(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) diff++;
    }
    return diff === 1;
  }
  submit() {
    const input = document.getElementById('input').value.toUpperCase().trim();
    const fb = document.getElementById('feedback');
    if (input.length !== 4) {
      fb.textContent = 'Must be 4 letters!';
      fb.className = 'feedback wrong';
      return;
    }
    if (!this.dictionary.includes(input)) {
      fb.textContent = 'Not a valid word!';
      fb.className = 'feedback wrong';
      return;
    }
    if (!this.isOneLetterDiff(this.current, input)) {
      fb.textContent = 'Change only 1 letter!';
      fb.className = 'feedback wrong';
      return;
    }
    this.history.push(this.current);
    this.current = input;
    this.moves++;
    document.getElementById('currentWord').textContent = this.current;
    document.getElementById('moves').textContent = this.moves;
    document.getElementById('history').textContent = this.history.join(' → ');
    document.getElementById('input').value = '';
    if (this.current === this.target) {
      const bonus = Math.max(10, 50 - this.moves * 5);
      this.score += bonus;
      chrome.storage.local.set({ wordLadderScore: this.score });
      document.getElementById('score').textContent = this.score;
      fb.textContent = `🎉 Solved in ${this.moves} moves! +${bonus}`;
      fb.className = 'feedback correct';
      setTimeout(() => this.newGame(), 2000);
    } else {
      fb.textContent = '✓ Good move!';
      fb.className = 'feedback correct';
    }
  }
}
document.addEventListener('DOMContentLoaded', () => new WordLadder());
