/* ============================================================
   DINO CHROME GAME — script.js
   ============================================================ */

'use strict';

// ── Canvas setup ──────────────────────────────────────────────
const canvas  = document.getElementById('c');
const ctx     = canvas.getContext('2d');
const W       = 600;
const H       = 150;
const GROUND  = 118;
const GRAVITY = 0.6;
const JUMP_V  = -12;
const DUCK_H  = 26;

// ── Pixel-art helpers ─────────────────────────────────────────
function px(x, y, w, h) {
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawDino(x, y, frame, ducking) {
  const color = DinoPro.active ? '#00aa33' : '#535353';
  ctx.fillStyle = color;

  if (ducking) {
    px(x,      y + 14, 44, 14); // body
    px(x + 28, y + 6,  14, 12); // head
    // eye white
    ctx.fillStyle = '#f7f7f7'; px(x + 36, y + 8, 4, 4);
    // eye pupil
    ctx.fillStyle = color;      px(x + 38, y + 9, 2, 2);
    // legs (alternating)
    const lx = frame === 0 ? 2 : 12;
    ctx.fillStyle = color;
    px(x + lx,      y + 26, 8, 6);
    px(x + lx + 14, y + 26, 8, 6);
  } else {
    px(x + 4,  y + 4,  36, 34); // body
    px(x + 24, y,      20, 18); // head
    px(x + 24, y + 14, 14, 6);  // jaw
    // eye white
    ctx.fillStyle = '#f7f7f7'; px(x + 32, y + 3, 6, 6);
    // eye pupil
    ctx.fillStyle = color;      px(x + 34, y + 4, 3, 3);
    // arm / tail
    px(x + 16, y + 22, 10, 4);
    px(x,      y + 14, 10, 6);
    px(x - 4,  y + 20, 8,  4);
    // legs (alternating)
    const lx = frame === 0 ? 4 : 16;
    px(x + lx,      y + 36, 8, 12);
    px(x + lx + 12, y + 36, 8, 12);
  }
}

function drawCactus(x, y, type) {
  ctx.fillStyle = '#535353';
  if (type === 0) {
    // single
    px(x + 6, y,      8,  36);
    px(x,     y + 10, 6,  6);
    px(x + 14,y + 8,  6,  8);
    px(x,     y + 6,  6,  4);
    px(x + 14,y + 4,  6,  4);
  } else if (type === 1) {
    // double
    px(x + 6, y,      8,  36);
    px(x,     y + 10, 6,  6);
    px(x + 14,y + 8,  6,  8);
    px(x + 26,y + 4,  8,  32);
    px(x + 20,y + 14, 6,  6);
    px(x + 34,y + 12, 6,  6);
  } else {
    // triple
    px(x + 6, y + 6,  8,  30);
    px(x,     y + 16, 6,  6);
    px(x + 14,y + 14, 6,  6);
    px(x + 22,y,      8,  36);
    px(x + 16,y + 10, 6,  6);
    px(x + 30,y + 8,  6,  8);
    px(x + 38,y + 8,  8,  28);
    px(x + 32,y + 18, 6,  6);
    px(x + 46,y + 16, 6,  6);
  }
}

function drawBird(x, y, frame) {
  ctx.fillStyle = '#535353';
  px(x + 4,  y + 8, 28, 12); // body
  px(x + 26, y + 4, 12, 8);  // head
  px(x + 38, y + 6, 8,  4);  // beak
  // wings
  if (frame === 0) {
    px(x,      y,     12, 8);
    px(x + 12, y + 4, 8,  4);
  } else {
    px(x,      y + 14, 12, 8);
    px(x + 12, y + 14, 8,  4);
  }
  ctx.fillStyle = '#f7f7f7'; px(x + 30, y + 5, 4, 4);
  ctx.fillStyle = '#535353'; px(x + 31, y + 6, 2, 2);
}

function drawCloud(x, y) {
  ctx.fillStyle = '#e0e0e0';
  px(x + 10, y + 4, 30, 10);
  px(x + 4,  y + 8, 44, 8);
  px(x,      y + 10,54, 6);
  px(x + 14, y,     20, 6);
  px(x + 8,  y + 2, 20, 6);
}

// ── Utilities ─────────────────────────────────────────────────
function padScore(n) {
  return String(Math.floor(n)).padStart(5, '0');
}

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ── Game state ────────────────────────────────────────────────
let state         = 'idle'; // 'idle' | 'running' | 'dead'
let score         = 0;
let hiScore       = 0;
let speed         = 5;
let frame         = 0;
let animTick      = 0;
let dinoFrame     = 0;

let dino          = {};
let obstacles     = [];
let birds         = [];
let clouds        = [];
let groundX       = 0;
let groundX2      = W;
let nextObstacleIn = 80;
let nextBirdIn    = 200;
let nextCloudIn   = 60;

function resetGame() {
  score          = 0;
  speed          = 5;
  frame          = 0;
  animTick       = 0;
  dinoFrame      = 0;
  dino           = { x: 40, y: GROUND - 48, vy: 0, ducking: false, h: 48 };
  obstacles      = [];
  birds          = [];
  clouds         = [];
  groundX        = 0;
  groundX2       = W;
  nextObstacleIn = 80;
  nextBirdIn     = 200;
  nextCloudIn    = 60;
}

// ── Dino actions ──────────────────────────────────────────────
function jump() {
  if (dino.y >= GROUND - dino.h - 1) {
    dino.vy = JUMP_V;
  }
}

function duck(on) {
  dino.ducking = on;
  dino.h = on ? DUCK_H : 48;
  if (on && dino.y < GROUND - dino.h) {
    dino.y = GROUND - dino.h;
  }
}

// ── Spawners ──────────────────────────────────────────────────
function spawnObstacle() {
  const type    = Math.floor(Math.random() * 3);
  const widths  = [20, 48, 54];
  obstacles.push({ x: W + 10, type, w: widths[type], h: 36 });
  nextObstacleIn = 60 + Math.random() * 80 + Math.max(0, (10 - speed) * 8);
}

function spawnBird() {
  const heights = [GROUND - 60, GROUND - 80, GROUND - 48];
  const hy      = heights[Math.floor(Math.random() * heights.length)];
  birds.push({ x: W + 10, y: hy, frame: 0, tick: 0 });
  nextBirdIn = 150 + Math.random() * 120;
}

function spawnCloud() {
  clouds.push({ x: W + 10, y: 20 + Math.random() * 30 });
  nextCloudIn = 40 + Math.random() * 60;
}

// ── Collision detection ───────────────────────────────────────
function checkCollisions() {
  const dx = dino.x + 6;
  const dy = dino.y + 4;
  const dw = dino.ducking ? 38 : 28;
  const dh = dino.h - 6;

  for (const o of obstacles) {
    if (rectOverlap(dx, dy, dw, dh, o.x + 2, GROUND - o.h + 2, o.w - 4, o.h - 4)) return true;
  }
  for (const b of birds) {
    if (rectOverlap(dx, dy, dw, dh, b.x + 4, b.y + 4, 36, 16)) return true;
  }
  return false;
}

// ── Update ────────────────────────────────────────────────────
function update() {
  if (state !== 'running') return;

  frame++;
  score += speed / 10;
  speed  = Math.min(5 + score / 500, 14);

  // Dino physics
  dino.vy += GRAVITY;
  dino.y  += dino.vy;
  if (dino.y >= GROUND - dino.h) {
    dino.y  = GROUND - dino.h;
    dino.vy = 0;
  }

  // Leg animation
  animTick++;
  if (animTick % 8 === 0) dinoFrame = 1 - dinoFrame;

  // Ground scroll
  groundX  -= speed;
  groundX2 -= speed;
  if (groundX  < -W) groundX  += W * 2;
  if (groundX2 < -W) groundX2 += W * 2;

  // Obstacles
  nextObstacleIn--;
  if (nextObstacleIn <= 0) spawnObstacle();
  for (const o of obstacles) o.x -= speed;
  obstacles = obstacles.filter(o => o.x + o.w > -10);

  // Birds (appear after score 200)
  nextBirdIn--;
  if (nextBirdIn <= 0 && score > 200) spawnBird();
  for (const b of birds) {
    b.x -= speed;
    b.tick++;
    if (b.tick % 10 === 0) b.frame = 1 - b.frame;
  }
  birds = birds.filter(b => b.x + 50 > -10);

  // Clouds
  nextCloudIn--;
  if (nextCloudIn <= 0) spawnCloud();
  for (const c of clouds) c.x -= speed * 0.3;
  clouds = clouds.filter(c => c.x + 60 > -10);

  // Death check
  if (!DinoPro.isImmortal() && checkCollisions()) {
    state = 'dead';
    if (score > hiScore) hiScore = score;
    setMessage('GAME OVER — APPUYER SUR ESPACE POUR REJOUER');
    updateScoreDisplay();
  }
}

// ── Draw ──────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#f7f7f7';
  ctx.fillRect(0, 0, W, H);

  // Clouds
  for (const c of clouds) drawCloud(c.x, c.y);

  // Ground line
  ctx.fillStyle = '#535353';
  ctx.fillRect(0, GROUND, W, 2);
  // Ground texture
  ctx.fillStyle = '#aaa';
  for (let gx = groundX  % 20; gx < W; gx += 20) ctx.fillRect(gx,      GROUND + 2, 4, 2);
  for (let gx = groundX2 % 20; gx < W; gx += 20) ctx.fillRect(gx + 10, GROUND + 6, 6, 2);

  // Cacti
  for (const o of obstacles) drawCactus(o.x, GROUND - o.h, o.type);

  // Birds
  for (const b of birds) drawBird(b.x, b.y, b.frame);

  // Dino
  drawDino(dino.x, dino.y, state === 'running' ? dinoFrame : 0, dino.ducking);

  // Idle: wink eye
  if (state === 'idle') {
    ctx.fillStyle = '#535353';
    px(dino.x + 34, dino.y + 4, 3, 3);
  }

  // Dead: X eyes
  if (state === 'dead') {
    ctx.strokeStyle = '#535353';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(dino.x + 32, dino.y + 3); ctx.lineTo(dino.x + 37, dino.y + 8);
    ctx.moveTo(dino.x + 37, dino.y + 3); ctx.lineTo(dino.x + 32, dino.y + 8);
    ctx.stroke();
  }

  // HUD
  document.getElementById('cur-score').textContent = padScore(score);
  document.getElementById('hi-score').textContent  = padScore(hiScore);
}

// ── Main loop ─────────────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ── Game control ──────────────────────────────────────────────
function setMessage(txt) {
  document.getElementById('message').textContent = txt;
}

function startGame() {
  if (state === 'idle' || state === 'dead') {
    resetGame();
    state = 'running';
    setMessage('');
    if (DinoPro.active) DinoPro._startAutoJump();
  }
}

// ── DINO-PRO (easter egg: double-tap SPACE) ───────────────────
const DinoPro = {
  active:        false,
  _autoInterval: null,

  init() {
    console.log('%c [DinoPro] Système activé !', 'color:#00ff00;font-weight:bold;');
    this.active = true;
    document.getElementById('pro-badge').classList.add('on');
    setMessage('⚡ DINO-PRO ACTIVÉ — Tu es immortel');
    setTimeout(() => { if (state === 'running') setMessage(''); }, 2000);
    this._startAutoJump();
  },

  deactivate() {
    console.log('%c [DinoPro] Désactivé.', 'color:#ff4444;font-weight:bold;');
    this.active = false;
    document.getElementById('pro-badge').classList.remove('on');
    setMessage('⚡ DINO-PRO DÉSACTIVÉ');
    setTimeout(() => { if (state === 'running') setMessage(''); }, 1500);
    if (this._autoInterval) { clearInterval(this._autoInterval); this._autoInterval = null; }
  },

  toggle() { this.active ? this.deactivate() : this.init(); },

  isImmortal() { return this.active; },

  _startAutoJump() {
    if (this._autoInterval) clearInterval(this._autoInterval);
    this._autoInterval = setInterval(() => {
      if (!this.active || state !== 'running') return;

      let nearest = null;
      let minX    = Infinity;

      for (const o of obstacles) {
        const dist = o.x - (dino.x + 40);
        if (dist > 0 && dist < minX) { minX = dist; nearest = o; }
      }
      for (const b of birds) {
        const dist = b.x - (dino.x + 40);
        if (dist > 0 && dist < minX) { minX = dist; nearest = b; }
      }

      if (nearest) {
        const threshold = 35 + speed * 0.5;
        // low bird → duck instead of jump
        if (nearest.y !== undefined && nearest.y > GROUND - 55 && minX < threshold + 10) {
          duck(true);
          setTimeout(() => duck(false), 300);
          return;
        }
        if (minX < threshold) jump();
      }
    }, 5);
  },
};

// ── Input handling ────────────────────────────────────────────
let _lastSpaceTime = 0;

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();

    // Double-Space → toggle DinoPro
    if (e.code === 'Space') {
      const now = Date.now();
      if (now - _lastSpaceTime < 400) {
        _lastSpaceTime = 0;
        if (state === 'idle' || state === 'dead') startGame();
        DinoPro.toggle();
        return;
      }
      _lastSpaceTime = now;
    }

    if (state === 'running') jump();
    else startGame();
  }

  if (e.code === 'ArrowDown' && state === 'running') {
    e.preventDefault();
    duck(true);
  }
});

document.addEventListener('keyup', e => {
  if (e.code === 'ArrowDown') duck(false);
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (state === 'running') jump();
  else startGame();
}, { passive: false });

canvas.addEventListener('click', () => {
  if (state === 'running') jump();
  else startGame();
});

// ── Leaderboard data ──────────────────────────────────────────
const dailyScores = [
  { name: 'Antoine',   pts: 107142 },
  { name: 'Liloue',    pts: 105106 },
  { name: 'Yuki',      pts: 5529   },
  { name: 'Timothée',  pts: 4191   },
  { name: 'Anonymous', pts: 4095   },
];

const alltimeScores = [
  { name: 'Thomasptz', pts: 107142 },
  { name: 'Drak',      pts: 105106 },
  { name: 'Kerozen',   pts: 105097 },
  { name: 'Nikita',    pts: 41647  },
  { name: 'Spike',     pts: 29252  },
];

function renderList(id, data) {
  const ul = document.getElementById(id);
  ul.innerHTML = data
    .map((s, i) =>
      `<li>
        <span class="rank">#${i + 1}</span>
        <span class="name">${s.name}</span>
        <span class="pts">${s.pts.toLocaleString('fr-FR')}</span>
      </li>`
    )
    .join('');
}

function updateScoreDisplay() {
  renderList('daily-list',   dailyScores);
  renderList('alltime-list', alltimeScores);
}

// ── Boot ──────────────────────────────────────────────────────
resetGame();
updateScoreDisplay();
loop();
