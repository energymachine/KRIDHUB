// KRID — frontend prototype script
// Handles: intro dismissal, fractal & visualizer, sample data for artists/releases/products

// ---------- SAMPLE DATA ----------
const sampleArtists = [
  {id:1,name:'Spectral Circuit',bio:'Hi-Tech maestro exploring micro-frequencies',links:{spotify:'#',soundcloud:'#'}},
  {id:2,name:'Vexion',bio:'Dark, rhythmic, precise',links:{spotify:'#',soundcloud:'#'}},
  {id:3,name:'NexuSphere',bio:'Melodic layers and crystalline textures',links:{spotify:'#',soundcloud:'#'}}
];

const sampleReleases = [
  {id:1,title:'Pulse Protocol',artist:'Spectral Circuit',preview:'#',spotify:'#',soundcloud:'#'},
  {id:2,title:'Fractal Bloom',artist:'NexuSphere',preview:'#',spotify:'#',soundcloud:'#'},
  {id:3,title:'CyberSeed',artist:'Vexion',preview:'#',spotify:'#',soundcloud:'#'}
];

const sampleProducts = [
  {id:1,cat:'hoodies',title:'Lumina Hoodie',price:'$84',desc:'UV-reactive fractal print, breathable blend'},
  {id:2,cat:'tees',title:'Frequency Tee',price:'$28',desc:'Geometry print with iridescent ink'},
  {id:3,cat:'tapestries',title:'Nebula Tapestry',price:'$56',desc:'160x120cm vivid dye-sublimation'},
  {id:4,cat:'accessories',title:'Pulse Cap',price:'$24',desc:'Reflective trims and embroidered sigil'}
];

// ---------- INTRO FRACTAL CANVAS ----------
const introCanvas = document.getElementById('fractalCanvas');
const introCtx = introCanvas.getContext('2d');
function resizeIntro(){introCanvas.width = innerWidth; introCanvas.height = innerHeight}
window.addEventListener('resize', resizeIntro);
resizeIntro();

let t=0;
function drawFractal(){
  const w = introCanvas.width, h = introCanvas.height;
  const image = introCtx.createImageData(w,h);
  // coarse rendering for performance — produces nebula-like swirls
  for(let y=0;y<h;y+=4){
    for(let x=0;x<w;x+=4){
      const nx = x/w, ny = y/h;
      const v = Math.abs(Math.sin((nx*12 + t*0.3) + Math.sin(ny*7 + t*0.2)));
      const r = Math.floor(30 + v*200);
      const g = Math.floor(10 + v*150);
      const b = Math.floor(40 + v*220);
      for(let yy=0;yy<4;yy++){
        for(let xx=0;xx<4;xx++){
          const idx = 4*((y+yy)*w + (x+xx));
          image.data[idx] = r;
          image.data[idx+1] = g;
          image.data[idx+2] = b;
          image.data[idx+3] = 28 + Math.floor(v*120);
        }
      }
    }
  }
  introCtx.putImageData(image,0,0);
  t += 0.008;
  requestAnimationFrame(drawFractal);
}
requestAnimationFrame(drawFractal);

// ---------- INTRO BUTTON ----------
const enterBtn = document.getElementById('enterSite');
enterBtn.addEventListener('click',()=>{
  document.getElementById('intro').style.transition = 'opacity 0.8s ease';
  document.getElementById('intro').style.opacity = '0';
  setTimeout(()=>{
    document.getElementById('intro').style.display='none';
    document.getElementById('mainContent').classList.remove('hidden');
  },900);
});

// ---------- POPULATE SAMPLE CONTENT ----------
function populateArtists(){
  const el = document.getElementById('artistList');
  sampleArtists.forEach(a=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${a.name}</strong><div class="muted">${a.bio}</div>`;
    el.appendChild(li);
  });
}
function populateReleases(){
  const el = document.getElementById('releaseList');
  sampleReleases.forEach(r=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<strong>${r.title}</strong><div class="muted">by ${r.artist}</div>
      <div style="margin-top:8px;">
        <button class='btn small play' data-id='${r.id}'>▶ Preview</button>
        <a class='btn small ghost' href='${r.spotify}'>Spotify</a>
        <a class='btn small ghost' href='${r.soundcloud}'>SoundCloud</a>
      </div>`;
    el.appendChild(card);
  });
}
function populateProducts(filter='all'){
  const el=document.getElementById('productGrid'); el.innerHTML='';
  sampleProducts.filter(p=>filter==='all'||p.cat===filter).forEach(p=>{
    const d=document.createElement('div'); d.className='product';
    d.innerHTML=`<strong>${p.title}</strong><div class='muted' style='margin:6px 0'>${p.desc}</div>
      <div style='display:flex;justify-content:space-between;align-items:center'><span>${p.price}</span><button class='btn small'>Add</button></div>`;
    el.appendChild(d);
  });
}

populateArtists(); populateReleases(); populateProducts();

// category buttons
document.querySelectorAll('.cat-btn').forEach(btn=>btn.addEventListener('click',ev=>{
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  populateProducts(btn.dataset.cat);
}));

// ---------- AUDIO VISUALIZER (Web Audio) ----------
const liveViz = document.getElementById('liveVisualizer');
let audioCtx, analyser, source;
function setupAudioAnalyser(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
}

// canvas bars
const vizCanvas = document.createElement('canvas');
vizCanvas.width = 1400; vizCanvas.height = 260; liveViz.appendChild(vizCanvas);
const vctx = vizCanvas.getContext('2d');
function drawViz(){
  requestAnimationFrame(drawViz);
  if(!analyser) return;
  const freq = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freq);
  vctx.clearRect(0,0,vizCanvas.width,vizCanvas.height);
  const w = vizCanvas.width; const h = vizCanvas.height;
  const barCount = 128; const step = Math.floor(freq.length/barCount);
  for(let i=0;i<barCount;i++){
    const value = freq[i*step]/255;
    const barH = value*h*1.2;
    const x = i*(w/barCount);
    const grad = vctx.createLinearGradient(x,0,x,barH);
    grad.addColorStop(0,'rgba(122,59,255,0.9)');
    grad.addColorStop(0.5,'rgba(0,255,225,0.7)');
    grad.addColorStop(1,'rgba(57,255,20,0.5)');
    vctx.fillStyle = grad;
    vctx.fillRect(x,h-barH,(w/barCount)-2,barH);
  }
}
requestAnimationFrame(drawViz);

// play local file
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
uploadBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',async(e)=>{
  const file = e.target.files[0];
  if(!file) return;
  setupAudioAnalyser();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = await audioCtx.decodeAudioData(arrayBuffer);
  if(source) source.disconnect();
  source = audioCtx.createBufferSource();
  source.buffer = buffer; source.loop = true;
  source.connect(analyser); analyser.connect(audioCtx.destination);
  source.start(0);
});

// ---------- FOOTER VISUALIZER ----------
const footerCanvas = document.getElementById('footerViz');
const fctx = footerCanvas.getContext('2d');
let fT=0;
function drawFooter(){
  fctx.clearRect(0,0,footerCanvas.width,footerCanvas.height);
  for(let i=0;i<6;i++){
    const x = i*(footerCanvas.width/6)+20;
    const y = footerCanvas.height/2 + Math.sin(fT+i*0.8)*24;
    fctx.beginPath(); fctx.arc(x,y,6,0,Math.PI*2); fctx.fillStyle='rgba(122,59,255,0.9)'; fctx.fill();
  }
  fT += 0.08; requestAnimationFrame(drawFooter);
}
requestAnimationFrame(drawFooter);

// ---------- ABOUT CANVAS (gentle motion) ----------
const aboutCanvas = document.getElementById('aboutCanvas');
const aCtx = aboutCanvas.getContext('2d');
function resizeAbout(){aboutCanvas.width = aboutCanvas.clientWidth; aboutCanvas.height = aboutCanvas.clientHeight}
resizeAbout(); window.addEventListener('resize',resizeAbout);
let aT=0;
function drawAbout(){
  aCtx.clearRect(0,0,aboutCanvas.width,aboutCanvas.height);
  const w=aboutCanvas.width,h=aboutCanvas.height;
  for(let i=0;i<4;i++){
    aCtx.beginPath();
    aCtx.strokeStyle = `rgba(122,59,255,${0.12 + i*0.06})`;
    aCtx.lineWidth = 2 + i*1.5;
    aCtx.arc(w/2, h/2, 40 + i*30 + Math.sin(aT*(0.5+i*0.2))*8, 0, Math.PI*2);
    aCtx.stroke();
  }
  aT += 0.02; requestAnimationFrame(drawAbout);
}
requestAnimationFrame(drawAbout);

// ---------- MISC ----------
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('mailForm').addEventListener('submit',e=>{e.preventDefault();alert('Subscribed — welcome to the frequency.');e.target.reset();});

// placeholder preview handler
document.addEventListener('click',e=>{
  if(e.target.classList.contains('play')){
    alert('Preview would play here. Integrate per-track streaming via the Web Audio API or embed players.');
  }
});
