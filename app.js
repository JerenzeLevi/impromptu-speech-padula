// ===== CONFIG =====
// Box decorations (image or video) live in assets/media/<n>.<ext> - set the file per relic below.
// The revealed pictures are NOT in the repo: the operator uploads them on the day via the
// PIN-gated "Upload" button (stored in this browser's IndexedDB), so nobody can peek beforehand.
const STORAGE_KEY = 'impromtu-opened-v1';
const SLOT_COUNT = 10;

// INTENTIONAL: the PIN is hard-coded on the client on purpose. It is only a casual
// "not-before-the-event" gate for the operator; there is no sensitive data protected here.
const ADMIN_PIN = '0000';

const RELICS = [
  { label: 'Sorting Hat',        media: 'assets/media/1.png',  c1: '#7a4a1e', c2: '#1c0e05' },
  { label: 'Elder Wand',         media: 'assets/media/2.png',  c1: '#4a2a8a', c2: '#120a2a' },
  { label: 'Golden Snitch',      media: 'assets/media/3.mp4',  c1: '#8a6d1a', c2: '#241a04' },
  { label: 'Invisibility Cloak', media: 'assets/media/4.mp4',  c1: '#2a4a8a', c2: '#0a1228' },
  { label: 'House Scarf',        media: 'assets/media/5.mp4',  c1: '#7a1f2a', c2: '#20060a' },
  { label: 'Hogwarts Letter',    media: 'assets/media/6.png',  c1: '#5a3a1a', c2: '#150c04' },
  { label: 'Potion',             media: 'assets/media/7.png',  c1: '#1f7a4a', c2: '#06200f' },
  { label: "Marauder's Map",     media: 'assets/media/8.jpg',  c1: '#6a4a2a', c2: '#1a1004' },
  { label: 'Nimbus 2000',        media: 'assets/media/9.jpg',  c1: '#8a8a1f', c2: '#222204' },
  { label: 'Glasses & Scar',     media: 'assets/media/10.jpg', c1: '#1f6a6a', c2: '#041a1a' },
];

// ===== SLOT STORAGE (IndexedDB): slot number -> uploaded image Blob =====
const DB_NAME = 'impromtu-slots';
function openDB() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open(DB_NAME, 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('slots');
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
async function dbTx(mode, fn) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('slots', mode);
    const out = fn(tx.objectStore('slots'));
    tx.oncomplete = () => { db.close(); res(out && out.result); };
    tx.onerror = tx.onabort = () => { db.close(); rej(tx.error); };
  });
}
const getSlot = n => dbTx('readonly', s => s.get(n)).catch(() => null);
// Replace ALL slots in one transaction so every image lives in exactly one slot.
const putAllSlots = blobs => dbTx('readwrite', s => { s.clear(); blobs.forEach((b, i) => s.put(b, i + 1)); });

// ===== STATE (persisted so a refresh can't be used to redo) =====
let opened = new Set();
try { opened = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch (e) {}
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...opened])); } catch (e) {} };

// ===== BUILD GRID =====
const grid = document.getElementById('grid');
RELICS.forEach((r, i) => {
  const n = i + 1;
  const btn = document.createElement('button');
  btn.className = 'box' + (opened.has(n) ? ' opened' : '');
  btn.style.setProperty('--c1', r.c1);
  btn.style.setProperty('--c2', r.c2);
  btn.style.setProperty('--d', (i * 0.37) % 3 + 's');
  btn.setAttribute('aria-label', r.label);
  btn.disabled = opened.has(n);

  const inner = document.createElement('div');
  inner.className = 'inner';
  inner.innerHTML = `<span class="num">${['I','II','III','IV','V','VI','VII','VIII','IX','X'][i]}</span>`;

  const isVideo = /\.(mp4|webm|mov)$/i.test(r.media);
  const el = document.createElement(isVideo ? 'video' : 'img');
  el.className = 'relic';
  if (isVideo) {
    el.muted = true; el.loop = true; el.autoplay = true; el.playsInline = true;
    el.setAttribute('muted', '');
  } else {
    el.alt = '';
  }
  el.src = r.media;
  inner.appendChild(el);

  const lab = document.createElement('div');
  lab.className = 'label';
  lab.textContent = r.label;
  inner.appendChild(lab);

  btn.appendChild(inner);
  btn.addEventListener('click', e => reveal(n, btn, e));
  grid.appendChild(btn);
});

// ===== REVEAL =====
const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewerImg');

function placeholder(n) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'>
    <rect width='100%' height='100%' fill='#0b0618'/>
    <text x='50%' y='45%' text-anchor='middle' font-size='220' fill='#e8c26a' font-family='serif'>${n}</text>
    <text x='50%' y='62%' text-anchor='middle' font-size='56' fill='#a37a2c' font-family='serif'>No image uploaded for slot ${n}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

let viewerUrl = null;
async function reveal(n, btn, ev) {
  if (opened.has(n)) return;              // one shot only
  opened.add(n); save();
  btn.disabled = true;
  burst(ev.clientX, ev.clientY, 90);
  btn.classList.add('poof');
  setTimeout(() => btn.classList.add('opened'), 350);

  const blob = await getSlot(n);           // slot n -> its own image only (1:1)
  if (viewerUrl) URL.revokeObjectURL(viewerUrl);
  viewerUrl = blob ? URL.createObjectURL(blob) : null;
  viewerImg.src = viewerUrl || placeholder(n);
  setTimeout(() => { viewer.hidden = false; }, 450);
}

function closeViewer() {
  viewer.hidden = true;
  viewerImg.removeAttribute('src');
  if (viewerUrl) { URL.revokeObjectURL(viewerUrl); viewerUrl = null; }
}
document.getElementById('closeBtn').addEventListener('click', closeViewer);

// ===== ADMIN: PIN -> UPLOAD =====
const $ = id => document.getElementById(id);
const pinModal = $('pinModal'), pinInput = $('pinInput'), pinErr = $('pinErr');
const upModal = $('uploadModal'), fileInput = $('fileInput'), upMsg = $('upMsg'), upList = $('upList');
const show = (m, on) => { m.hidden = !on; };

$('adminBtn').addEventListener('click', () => { pinInput.value = ''; pinErr.textContent = ''; show(pinModal, true); pinInput.focus(); });
$('pinCancel').addEventListener('click', () => show(pinModal, false));
$('upClose').addEventListener('click', () => show(upModal, false));
// Credits are only reachable from the PIN-unlocked panel.
const creditsModal = $('creditsModal');
$('creditsBtn').addEventListener('click', () => show(creditsModal, true));
$('creditsClose').addEventListener('click', () => show(creditsModal, false));
$('pinForm').addEventListener('submit', e => {
  e.preventDefault();
  if (pinInput.value === ADMIN_PIN) {
    show(pinModal, false);
    upMsg.textContent = ''; upMsg.className = ''; upList.innerHTML = '';
    show(upModal, true);
  } else {
    pinErr.textContent = 'Wrong PIN'; pinInput.value = ''; pinInput.focus();
  }
});

// Fingerprint by content so the same picture can never occupy two slots.
async function fingerprint(file) {
  try {
    const h = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) { return `${file.size}|${file.name}|${file.lastModified}`; }
}

fileInput.addEventListener('change', async () => {
  const files = [...fileInput.files].filter(f => f.type.startsWith('image/'));
  fileInput.value = '';
  upList.innerHTML = '';
  const fail = t => { upMsg.textContent = t; upMsg.className = 'err'; };

  if (files.length < SLOT_COUNT) return fail(`Pick at least ${SLOT_COUNT} images (you picked ${files.length}).`);

  const seen = new Set(), unique = [];
  for (const f of files) {
    const fp = await fingerprint(f);
    if (!seen.has(fp)) { seen.add(fp); unique.push(f); }
  }
  if (unique.length < SLOT_COUNT)
    return fail(`Only ${unique.length} different images - duplicates were removed. Need ${SLOT_COUNT}.`);

  const chosen = unique.slice(0, SLOT_COUNT);   // slot i <- image i, one image per slot
  try { await putAllSlots(chosen); }
  catch (e) { return fail('Could not save images in this browser (storage blocked?).'); }

  chosen.forEach((f, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${RELICS[i].label} - ${f.name}`;
    upList.appendChild(li);
  });
  const extra = files.length - chosen.length;
  upMsg.className = 'ok';
  upMsg.textContent = `Saved ${SLOT_COUNT} images to slots 1-${SLOT_COUNT}.` + (extra > 0 ? ` (${extra} extra/duplicate file(s) ignored.)` : '');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { show(pinModal, false); show(upModal, false); show(creditsModal, false); if (!viewer.hidden) closeViewer(); }
  // Operator-only reset (makes every container clickable again; uploaded images are kept):
  // Ctrl+Shift+K, or Ctrl+Alt+Shift+R
  const k = e.key.toLowerCase();
  if (e.ctrlKey && e.shiftKey && (k === 'k' || (e.altKey && k === 'r'))) {
    e.preventDefault();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    location.reload();
  }
});

// ===== WAND SPARKLE TRAIL =====
const cv = document.getElementById('sparks');
const ctx = cv.getContext('2d');
let parts = [];
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
fit(); addEventListener('resize', fit);

function burst(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 6;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, size: 2 + Math.random() * 3, hue: 38 + Math.random() * 20 });
  }
}
addEventListener('pointermove', e => {
  for (let i = 0; i < 2; i++)
    parts.push({ x: e.clientX + 2, y: e.clientY + 2, vx: (Math.random() - .5) * 1.2, vy: Math.random() * 1.2 + .2,
      life: 1, size: 1.5 + Math.random() * 2.5, hue: 40 + Math.random() * 15 });
});
(function loop() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = 'lighter';
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.02;
    ctx.fillStyle = `hsla(${p.hue},100%,70%,${Math.max(p.life, 0)})`;
    ctx.shadowColor = `hsl(${p.hue},100%,60%)`; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life + .3, 0, 7); ctx.fill();
  }
  requestAnimationFrame(loop);
})();
