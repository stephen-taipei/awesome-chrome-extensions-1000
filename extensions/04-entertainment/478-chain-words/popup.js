const validWords = ['cat','hat','bat','rat','sat','mat','pat','car','can','cap','cup','cut','cub','cab','bad','bag','ban','bar','bay','bed','bet','big','bit','box','boy','bug','bus','but','buy','day','dig','dog','dot','dry','eat','egg','end','eye','fan','far','fat','fed','few','fit','fix','fly','for','fox','fun','fur','gap','gas','get','god','got','gun','gut','guy','had','ham','has','hat','hay','hen','her','hid','him','hip','his','hit','hog','hop','hot','how','hug','ice','ill','ink','its','jam','jar','jaw','jet','job','jog','joy','jug','key','kid','kit','lab','lap','law','lay','led','leg','let','lid','lie','lip','lit','log','lot','low','mad','man','map','may','men','met','mid','mix','mob','mom','mop','mud','mug','nap','net','new','nod','nor','not','now','nut','oak','odd','off','oil','old','one','opt','our','out','owe','owl','own','pad','pan','pat','pay','pea','pen','per','pet','pie','pig','pin','pit','pod','pop','pot','pub','pup','put','ran','rat','raw','ray','red','rib','rid','rim','rip','rob','rod','rot','row','rub','rug','run','rut','sad','sat','saw','say','sea','set','sew','she','shy','sin','sip','sit','six','ski','sky','son','sow','spy','sub','sum','sun','tab','tag','tan','tap','tar','tax','tea','ten','the','tie','tin','tip','toe','ton','too','top','tow','toy','try','tub','tug','two','use','van','vat','vet','via','war','was','wax','way','web','wed','wet','who','why','wig','win','wit','woe','wok','won','wow','yes','yet','you','zip','zoo'];
const vowels = 'AEIOU', consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
let letters = [], selected = [], score = 0, best = 0;

function init() {
  chrome.storage.local.get(['chainWordsBest'], (r) => {
    best = r.chainWordsBest || 0;
    document.getElementById('best').textContent = best;
  });
  generateGrid();
}

function generateGrid() {
  letters = [];
  for (let i = 0; i < 4; i++) letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
  for (let i = 0; i < 12; i++) letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
  letters = letters.sort(() => Math.random() - 0.5);
  selected = [];
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  letters.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'letter' + (selected.includes(i) ? ' selected' : '');
    el.textContent = l;
    el.addEventListener('click', () => toggleLetter(i));
    grid.appendChild(el);
  });
  document.getElementById('word').textContent = selected.map(i => letters[i]).join('');
}

function toggleLetter(i) {
  const idx = selected.indexOf(i);
  if (idx >= 0) selected.splice(idx, 1);
  else selected.push(i);
  renderGrid();
}

function submit() {
  const word = selected.map(i => letters[i]).join('').toLowerCase();
  if (word.length >= 3 && validWords.includes(word)) {
    score += word.length * 10;
    document.getElementById('score').textContent = score;
    if (score > best) {
      best = score;
      chrome.storage.local.set({ chainWordsBest: best });
      document.getElementById('best').textContent = best;
    }
    selected.forEach(i => letters[i] = (Math.random() < 0.3 ? vowels : consonants)[Math.floor(Math.random() * (Math.random() < 0.3 ? 5 : 21))]);
    selected = [];
    renderGrid();
  } else {
    document.getElementById('word').textContent = 'Invalid!';
    setTimeout(() => { selected = []; renderGrid(); }, 500);
  }
}

document.getElementById('submit').addEventListener('click', submit);
document.getElementById('clear').addEventListener('click', () => { selected = []; renderGrid(); });
init();
