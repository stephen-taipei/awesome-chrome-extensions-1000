const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const SIZE = 280, CELL = 40;
let level = 1, solved = 0, mirrors = [], laser = null, target = null, laserPath = [];

const levels = [
  { laser: {x:0,y:2,dir:'right'}, target: {x:6,y:2}, mirrors: [{x:3,y:2,type:'/'}] },
  { laser: {x:0,y:1,dir:'right'}, target: {x:6,y:5}, mirrors: [{x:3,y:1,type:'\\'},{x:3,y:3,type:'/'}] },
  { laser: {x:0,y:3,dir:'right'}, target: {x:0,y:0}, mirrors: [{x:4,y:3,type:'/'},{x:4,y:1,type:'\\'},{x:2,y:1,type:'/'}] }
];

function init() {
  chrome.storage.local.get(['laserSolved'], (r) => { solved = r.laserSolved || 0; document.getElementById('solved').textContent = solved; });
  loadLevel();
}

function loadLevel() {
  const l = levels[(level - 1) % levels.length];
  laser = {...l.laser}; target = {...l.target};
  mirrors = l.mirrors.map(m => ({...m}));
  laserPath = [];
  document.getElementById('level').textContent = level;
  draw();
}

function draw() {
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i <= 7; i++) {
    ctx.strokeStyle = '#2d2d44'; ctx.beginPath();
    ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE);
    ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff0040'; ctx.beginPath();
  ctx.arc(laser.x * CELL + 20, laser.y * CELL + 20, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#00ff88'; ctx.beginPath();
  ctx.arc(target.x * CELL + 20, target.y * CELL + 20, 12, 0, Math.PI * 2); ctx.fill();
  mirrors.forEach(m => {
    ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 4;
    ctx.beginPath();
    if (m.type === '/') { ctx.moveTo(m.x*CELL+5, m.y*CELL+35); ctx.lineTo(m.x*CELL+35, m.y*CELL+5); }
    else { ctx.moveTo(m.x*CELL+5, m.y*CELL+5); ctx.lineTo(m.x*CELL+35, m.y*CELL+35); }
    ctx.stroke();
  });
  if (laserPath.length > 1) {
    ctx.strokeStyle = '#ff0040'; ctx.lineWidth = 3; ctx.shadowColor = '#ff0040'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(laserPath[0].x, laserPath[0].y);
    laserPath.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function fireLaser() {
  laserPath = [{x: laser.x*CELL+20, y: laser.y*CELL+20}];
  let x = laser.x, y = laser.y, dir = laser.dir;
  const dirs = { right:[1,0], left:[-1,0], up:[0,-1], down:[0,1] };
  for (let i = 0; i < 20; i++) {
    x += dirs[dir][0]; y += dirs[dir][1];
    if (x < 0 || x > 6 || y < 0 || y > 6) break;
    laserPath.push({x: x*CELL+20, y: y*CELL+20});
    if (x === target.x && y === target.y) { win(); break; }
    const mirror = mirrors.find(m => m.x === x && m.y === y);
    if (mirror) {
      if (mirror.type === '/') dir = {right:'up',left:'down',up:'right',down:'left'}[dir];
      else dir = {right:'down',left:'up',up:'left',down:'right'}[dir];
    }
  }
  draw();
}

function win() {
  solved++; chrome.storage.local.set({ laserSolved: solved });
  document.getElementById('solved').textContent = solved;
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL), y = Math.floor((e.clientY - rect.top) / CELL);
  const mi = mirrors.findIndex(m => m.x === x && m.y === y);
  if (mi >= 0) mirrors[mi].type = mirrors[mi].type === '/' ? '\\' : '/';
  laserPath = []; draw();
});

document.getElementById('fire').addEventListener('click', fireLaser);
document.getElementById('next').addEventListener('click', () => { level++; loadLevel(); });
init();
