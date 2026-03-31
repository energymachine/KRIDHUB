// KRID — hi‑tech psy front-end

// ---------- SAMPLE DATA ----------
const sampleArtists = [
  { id:1, name:'Spectral Circuit', bio:'Hi‑tech architect bending micro‑frequencies.' },
  { id:2, name:'Vexion',          bio:'Dark, angular and surgical night textures.' },
  { id:3, name:'NexuSphere',      bio:'Crystalline layers and elastic bass scripts.' }
];

const sampleReleases = [
  { id:1, title:'Pulse Protocol',  artist:'Spectral Circuit' },
  { id:2, title:'Fractal Bloom',   artist:'NexuSphere' },
  { id:3, title:'CyberSeed',       artist:'Vexion' }
];

const sampleProducts = [
  { id:1, cat:'hoodies',     title:'Lumina Hoodie',    price:'₹6,999', desc:'UV‑reactive fractal grid print.' },
  { id:2, cat:'tees',        title:'Frequency Tee',    price:'₹1,999', desc:'Geometric wave‑field in iridescent ink.' },
  { id:3, cat:'tapestries',  title:'Nebula Tapestry',  price:'₹4,299', desc:'Hi‑resolution psy nebula wall‑portal.' },
  { id:4, cat:'accessories', title:'Pulse Cap',        price:'₹1,499', desc:'Reflective trims and KRID sigil.' }
];

// ---------- INTRO FRACTAL CANVAS ----------
const introCanvas = document.getElementById('fractalCanvas');
const introCtx = introCanvas.getContext('2d');

function resizeIntro() {
  introCanvas.width = innerWidth;
  introCanvas.height = innerHeight;
}
window.addEventListener('resize', resizeIntro);
resizeIntro();

let t = 0;
function drawFractal() {
  const w = introCanvas.width, h = introCanvas.height;
  const img = introCtx.createImageData(w, h);
  const data = img.data;

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const nx = (x - w / 2) / Math.min(w, h);
      const ny = (y - h / 2) / Math.min(w, h);
      const r = Math.sqrt(nx * nx + ny * ny);
      const ang = Math.atan2(ny, nx);

      const v = Math.sin(12 * r * r - t * 0.04 + Math.cos(ang * 6));
      const hue = 200 + 90 * v;
      const sat = 80 + 20 * v;
      const val = 8 + 40 * (1 - r);

      const c = hsvToRgb(hue, sat / 100, Math.max(0, val / 100));
      const idx = (y * w + x) * 4;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const id2 = ((y + dy) * w + (x + dx)) * 4;
          data[id2] = c.r;
          data[id2 + 1] = c.g;
          data[id2 + 2] = c.b;
          data[id2 + 3] = 255;
        }
      }
    }
  }
  introCtx.putImageData(img, 0, 0);
  t += 1.1;
  requestAnimationFrame(drawFractal);
}
requestAnimationFrame(drawFractal);

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1, g1, b1;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

// intro button
document.getElementById('enterSite').addEventListener('click', () => {
  const intro = document.getElementById('intro');
  intro.style.transition = 'opacity 0.8s ease';
  intro.style.opacity = '0';
  setTimeout(() => {
    intro.style.display = 'none';
    document.getElementById('mainContent').classList.remove('hidden');
  }, 900);
});

// ---------- POPULATE CONTENT ----------
function populateArtists() {
  const el = document.getElementById('artistList');
  el.innerHTML = '';
  sampleArtists.forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="name">${a.name}</span>
      <span class="bio">${a.bio}</span>
    `;
    el.appendChild(li);
  });
}

function populateReleases() {
  const el = document.getElementById('releaseList');
  el.innerHTML = '';
  sampleReleases.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">${r.title}</div>
      <div class="card-artist">by ${r.artist}</div>
      <div class="card-actions">
        <button class="play-pill play">▶ Preview</button>
        <button class="play-pill">Spotify</button>
        <button class="play-pill">SoundCloud</button>
      </div>
    `;
    el.appendChild(card);
  });
}

function populateProducts(filter='all') {
  const el = document.getElementById('productGrid');
  el.innerHTML = '';
  sampleProducts
    .filter(p => filter === 'all' || p.cat === filter)
    .forEach(p => {
      const d = document.createElement('div');
      d.className = 'product';
      d.innerHTML = `
        <div class="product-title">${p.title}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <span class="product-price">${p.price}</span>
          <button class="product-add">Add</button>
        </div>
      `;
      el.appendChild(d);
    });
}

populateArtists();
populateReleases();
populateProducts();

// category filter buttons
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    populateProducts(btn.dataset.cat);
  });
});

// ---------- AUDIO VISUALIZER ----------
const liveViz = document.getElementById('liveVisualizer');
let audioCtx, analyser, source;

function setupAudioAnalyser() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;

  const vizCanvas = document.createElement('canvas');
  vizCanvas.width = liveViz.clientWidth * 2;
  vizCanvas.height = liveViz.clientHeight * 2;
  liveViz.appendChild(vizCanvas);
  const vctx = vizCanvas.getContext('2d');

  function drawViz() {
    requestAnimationFrame(drawViz);
    if (!analyser) return;

    const freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);

    const w = vizCanvas.width;
    const h = vizCanvas.height;
    vctx.setTransform(1,0,0,1,0,0);
    vctx.clearRect(0,0,w,h);

    const barCount = 120;
    const step = Math.floor(freq.length / barCount);
    const centerX = w / 2;
    const centerY = h / 2;
    const radiusBase = Math.min(w, h) * 0.15;

    for (let i = 0; i < barCount; i++) {
      const v = freq[i * step] / 255;
      const angle = (i / barCount) * Math.PI * 2;
      const r = radiusBase + v * 160;

      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      const grad = vctx.createLinearGradient(centerX, centerY, x, y);
      grad.addColorStop(0, `rgba(176,0,255,0.1)`);
      grad.addColorStop(1, `rgba(0,255,225,${0.7 * v + 0.3})`);

      vctx.beginPath();
      vctx.moveTo(centerX, centerY);
      vctx.lineTo(x, y);
      vctx.strokeStyle = grad;
      vctx.lineWidth = 1.2;
      vctx.stroke();
    }
  }
  requestAnimationFrame(drawViz);
}

// track loader
document.getElementById('loadTrack').addEventListener('click', () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'audio/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  fileInput.click();

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setupAudioAnalyser();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioCtx.decodeAudioData(arrayBuffer);
    if (source) source.disconnect();
    source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    source.start(0);
  }, { once:true });
});

// ---------- FOOTER VISUALIZER ----------
const footerCanvas = document.getElementById('footerViz');
const fctx = footerCanvas.getContext('2d');
let fT = 0;

function drawFooter() {
  const w = footerCanvas.width;
  const h = footerCanvas.height;
  fctx.clearRect(0, 0, w, h);

  for (let i = 0; i < 6; i++) {
    const x = i * (w / 6) + 20;
    const y = h / 2 + Math.sin(fT + i * 0.8) * 12;
    fctx.beginPath();
    fctx.arc(x, y, 5, 0, Math.PI * 2);
    fctx.fillStyle = `rgba(176,0,255,${0.5 + 0.3 * Math.sin(fT + i)})`;
    fctx.fill();
  }

  fT += 0.08;
  requestAnimationFrame(drawFooter);
}
requestAnimationFrame(drawFooter);

// ---------- ABOUT CANVAS ----------
const aboutCanvas = document.getElementById('aboutCanvas');
const aCtx = aboutCanvas.getContext('2d');

function resizeAbout() {
  aboutCanvas.width = aboutCanvas.clientWidth;
  aboutCanvas.height = aboutCanvas.clientHeight;
}
resizeAbout();
window.addEventListener('resize', resizeAbout);

let aT = 0;
function drawAbout() {
  const w = aboutCanvas.width;
  const h = aboutCanvas.height;
  aCtx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  for (let i = 0; i < 8; i++) {
    aCtx.beginPath();
    const r = 40 + i * 18 + Math.sin(aT * (0.7 + i * 0.1)) * 6;
    const sides = 3 + (i % 4);
    const angleStep = (Math.PI * 2) / sides;
    aCtx.strokeStyle = `rgba(0,255,225,${0.15 + i * 0.06})`;
    aCtx.lineWidth = 1 + i * 0.2;

    for (let j = 0; j <= sides; j++) {
      const ang = j * angleStep + aT * 0.2 * (i % 2 === 0 ? 1 : -1);
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      if (j === 0) aCtx.moveTo(x, y);
      else aCtx.lineTo(x, y);
    }
    aCtx.stroke();
  }

  aT += 0.02;
  requestAnimationFrame(drawAbout);
}
requestAnimationFrame(drawAbout);

// ---------- VIEWER "CUBE" ----------
const viewerCanvas = document.getElementById('viewerCanvas');
const v2 = viewerCanvas.getContext('2d');

function resizeViewer() {
  const rect = viewerCanvas.getBoundingClientRect();
  viewerCanvas.width = rect.width * 2;
  viewerCanvas.height = rect.height * 2;
}
resizeViewer();
window.addEventListener('resize', resizeViewer);

let vcT = 0;
function drawViewer() {
  const w = viewerCanvas.width;
  const h = viewerCanvas.height;
  v2.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const size = Math.min(w, h) * 0.22;
  const tilt = Math.sin(vcT * 0.4) * 0.4;

  v2.save();
  v2.translate(cx, cy);
  v2.rotate(tilt);

  const faces = 4;
  for (let i = 0; i < faces; i++) {
    const ang = (i / faces) * Math.PI * 2 + vcT * 0.4;
    const depth = 0.4 + 0.6 * Math.sin(vcT + i);
    const x = Math.cos(ang) * size * 0.4;
    const y = Math.sin(ang) * size * 0.4;

    v2.beginPath();
    v2.rect(-size/2 + x, -size/2 + y, size, size);
    const grd = v2.createLinearGradient(-size, -size, size, size);
    grd.addColorStop(0, `rgba(176,0,255,${0.2 + depth})`);
    grd.addColorStop(1, `rgba(0,255,225,${0.2 + depth})`);
    v2.fillStyle = grd;
    v2.strokeStyle = 'rgba(255,255,255,0.6)';
    v2.lineWidth = 2;
    v2.fill();
    v2.stroke();
  }

  v2.restore();

  vcT += 0.02;
  requestAnimationFrame(drawViewer);
}
requestAnimationFrame(drawViewer);

// ---------- MISC ----------
document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('mailForm').addEventListener('submit', e => {
  e.preventDefault();
  alert('Subscribed — KRID transmissions armed.');
  e.target.reset();
});

// placeholder preview
document.addEventListener('click', e => {
  if (e.target.classList.contains('play')) {
    alert('Preview audio would play here. Patch to streaming / Web Audio as needed.');
  }
});

// psychedelic triggers
document.querySelectorAll('.btn-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.trigger;
    if (type === 'warp') {
      document.body.classList.remove('body-strobe');
      void document.body.offsetWidth;
      document.body.classList.add('body-warp');
      setTimeout(() => document.body.classList.remove('body-warp'), 1300);
    } else if (type === 'strobe') {
      document.body.classList.remove('body-warp');
      void document.body.offsetWidth;
      document.body.classList.add('body-strobe');
      setTimeout(() => document.body.classList.remove('body-strobe'), 900);
    }
  });
});
