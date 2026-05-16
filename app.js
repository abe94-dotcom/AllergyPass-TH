'use strict';

/* ─── UTILS ─── */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s || '');
  return d.innerHTML;
}

/* ─── DATA ─── */
const HIGH = [
  { key:'shellfish', label:'Shellfish & Shrimp', emoji:'🦐', hint:'shrimp paste, oyster sauce' },
  { key:'fish',      label:'Fish & Fish Sauce',  emoji:'🐟', hint:'hidden in nearly everything' },
  { key:'peanuts',   label:'Peanuts',             emoji:'🥜', hint:'pad thai, satay, garnishes' },
  { key:'soy',       label:'Soy & Soy Sauce',     emoji:'🫘', hint:'stir-fries, marinades' },
];
const OTHER = [
  { key:'tree_nuts', label:'Tree Nuts',  emoji:'🌰', hint:'cashew, walnut, almond' },
  { key:'dairy',     label:'Dairy',      emoji:'🥛', hint:'milk, butter, cream' },
  { key:'eggs',      label:'Eggs',       emoji:'🥚', hint:'noodles, mayo, batter' },
  { key:'wheat',     label:'Wheat',      emoji:'🌾', hint:'noodles, sauces, batter' },
  { key:'gluten',    label:'Gluten',     emoji:'🍞', hint:'soy sauce, tempura batter' },
  { key:'sesame',    label:'Sesame',     emoji:'🌱', hint:'sesame oil, tahini' },
];
const ALL_A = [...HIGH, ...OTHER];

const SEV_OPTS = [
  { id:'anaphylactic', label:'Life-threatening', sub:'I will die',       dot:'var(--sev-ana)', cls:'active-ana' },
  { id:'severe',       label:'Severe',           sub:'Serious reaction', dot:'var(--amber)', cls:'active-sev' },
  { id:'intolerance',  label:'Intolerance',      sub:'Discomfort only',  dot:'var(--soil)', cls:'active-int' },
];

const TH_ALLERGENS = {
  shellfish: { th:'กุ้ง / หอย / ปู',       rom:'kung / hoi / poo' },
  fish:      { th:'ปลา / น้ำปลา',           rom:'pla / nam pla' },
  peanuts:   { th:'ถั่วลิสง',               rom:'thua lisong' },
  soy:       { th:'ถั่วเหลือง / ซีอิ๊ว',   rom:'thua lueang / si-io' },
  tree_nuts: { th:'ถั่วเปลือกแข็ง',         rom:'thua plueak khaeng' },
  dairy:     { th:'นม / เนย',               rom:'nom / noe' },
  eggs:      { th:'ไข่',                    rom:'khai' },
  wheat:     { th:'แป้งสาลี',               rom:'paeng sali' },
  gluten:    { th:'กลูเตน',                 rom:'gluten' },
  sesame:    { th:'งา',                     rom:'nga' },
};

const BANNER = {
  anaphylactic: { th:'แพ้อาหารรุนแรงมาก อันตรายถึงชีวิต', en:'LIFE-THREATENING ALLERGY: DO NOT IGNORE' },
  severe:       { th:'แพ้อาหาร อาจเป็นอันตรายร้ายแรง',     en:'SEVERE FOOD ALLERGY: TAKE SERIOUSLY' },
  intolerance:  { th:'แพ้อาหาร ไม่สบาย',                   en:'FOOD INTOLERANCE: CAUSES DISCOMFORT' },
};
const INSTR_TH = 'กรุณาแจ้งเชฟ: ชีวิตของลูกค้าขึ้นอยู่กับสิ่งนี้\nโปรดระวังการปนเปื้อนข้ามทุกชนิด';
const INSTR_EN = 'Please inform the chef. Cross-contamination must be avoided.';
const VERIFIED = 'ตรวจสอบแล้วโดยบุคลากรทางการแพทย์';

/* ─── STATE ─── */
const S = {
  step: 1,
  allergens: [],           // [{key, sev}]
  name: '', sos: '', hotel: '',
  has(k)     { return this.allergens.some(a => a.key === k); },
  toggle(k)  { this.has(k) ? this.allergens = this.allergens.filter(a => a.key !== k) : this.allergens.push({ key: k, sev: 'anaphylactic' }); this.persist(); },
  setSev(k,v){ const a = this.allergens.find(a => a.key === k); if (a) { a.sev = v; this.persist(); } },
  remove(k)  { this.allergens = this.allergens.filter(a => a.key !== k); this.persist(); renderSevList(); syncChips(); updateCount(); updateNext(); },
  worst()    { if (this.allergens.some(a => a.sev === 'anaphylactic')) return 'anaphylactic'; if (this.allergens.some(a => a.sev === 'severe')) return 'severe'; return 'intolerance'; },
  persist()  { try { localStorage.setItem('ap26', JSON.stringify({ allergens: this.allergens, name: this.name, sos: this.sos, hotel: this.hotel })); } catch(e){} },
  load()     { try { const d = JSON.parse(localStorage.getItem('ap26')); if (!d) return; if (Array.isArray(d.allergens)) this.allergens = d.allergens.filter(a => ALL_A.some(x => x.key === a.key) && ['anaphylactic','severe','intolerance'].includes(a.sev)); this.name = String(d.name||'').slice(0,80); this.sos = String(d.sos||'').slice(0,30); this.hotel = String(d.hotel||'').slice(0,80); } catch(e){} },
};

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  S.load();
  buildGrid(document.getElementById('grid-high'), HIGH);
  buildGrid(document.getElementById('grid-other'), OTHER);
  syncChips(); updateCount(); updateNext();
  if (S.name)  document.getElementById('inpName').value  = S.name;
  if (S.sos)   document.getElementById('inpSos').value   = S.sos;
  if (S.hotel) document.getElementById('inpHotel').value = S.hotel;
  goTo(1);
  setTimeout(() => document.getElementById('offlinePill').classList.add('show'), 800);
});

/* ─── GRID ─── */
function buildGrid(el, list) {
  el.innerHTML = '';
  list.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'allergen-chip';
    btn.dataset.key = a.key;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span class="chip-emoji">${a.emoji}</span>
      <span class="chip-text">
        <span class="chip-name">${a.label}</span>
        <span class="chip-hint">${a.hint}</span>
      </span>
      <span class="chip-check" aria-hidden="true"></span>`;
    btn.addEventListener('click', () => {
      S.toggle(a.key);
      btn.setAttribute('aria-pressed', S.has(a.key) ? 'true' : 'false');
      syncChips(); updateCount(); updateNext();
    });
    el.appendChild(btn);
  });
}

function syncChips() {
  document.querySelectorAll('.allergen-chip').forEach(c => {
    const sel = S.has(c.dataset.key);
    c.classList.toggle('selected', sel);
    c.setAttribute('aria-pressed', sel ? 'true' : 'false');
  });
}
function updateCount() {
  const el = document.getElementById('selCount');
  if (el) el.textContent = S.allergens.length;
}

/* ─── NAV ─── */
function goTo(n) {
  if (n < 1 || n > 4) return;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('step' + n).classList.add('active');

  for (let i = 1; i <= 4; i++) {
    const dot  = document.getElementById('dot'  + i);
    const name = document.getElementById('name' + i);
    dot.classList.remove('active', 'done');
    name.classList.remove('active', 'done');
    if (i < n)  { dot.classList.add('done');   name.classList.add('done'); }
    if (i === n){ dot.classList.add('active');  name.classList.add('active'); }
    if (i < 4)  { document.getElementById('line' + i).classList.toggle('done', i < n); }
  }

  const back = document.getElementById('btnBack');
  if (back) back.style.display = n === 1 ? 'none' : 'flex';

  const navSteps = document.getElementById('navSteps');
  const navCard  = document.getElementById('navCard');
  if (n === 4) { navSteps.style.display = 'none'; navCard.style.display = 'flex'; renderCard(); }
  else         { navSteps.style.display = 'flex';  navCard.style.display = 'none'; }

  S.step = n;
  updateNext();
  if (n === 1) { syncChips(); updateCount(); }
  if (n === 2) renderSevList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
  if (S.step === 3) {
    S.name  = document.getElementById('inpName').value.trim();
    S.sos   = document.getElementById('inpSos').value.trim();
    S.hotel = document.getElementById('inpHotel').value.trim();
    S.persist();
  }
  goTo(S.step + 1);
}
function goBack() { goTo(S.step - 1); }

function updateNext() {
  const btn = document.getElementById('btnNext');
  const lbl = document.getElementById('nextLabel');
  if (!btn) return;
  const labels = { 1:'Set Severity', 2:'Add Details', 3:'See My Card' };
  if (lbl) lbl.textContent = labels[S.step] || 'Next';
  btn.disabled = S.allergens.length === 0;
}

/* ─── SEVERITY ─── */
function renderSevList() {
  const c = document.getElementById('sevList');
  c.innerHTML = '';
  if (S.allergens.length === 0) {
    c.innerHTML = '<p style="color:var(--dust);font-size:0.9rem;padding:2rem 0;">No allergens selected. Go back and pick some.</p>';
    return;
  }
  S.allergens.forEach(entry => {
    const def = ALL_A.find(a => a.key === entry.key);
    if (!def) return; /* skip unknown keys (corrupted localStorage) */
    const card = document.createElement('div');
    card.className = `sev-card sev-${entry.sev}`;
    card.id = 'sc-' + entry.key;
    card.innerHTML = `
      <div class="sev-card__head">
        <div class="sev-card__name">
          <span style="font-size:1.3rem">${def.emoji}</span>${def.label}
        </div>
        <button class="sev-card__remove" onclick="S.remove('${entry.key}')" aria-label="Remove ${def.label}">✕</button>
      </div>
      <div class="sev-selector">
        ${SEV_OPTS.map(s => `
          <button class="sev-btn ${entry.sev === s.id ? s.cls : ''}"
            onclick="updateSev('${entry.key}','${s.id}')"
            aria-pressed="${entry.sev === s.id}">
            <span class="sev-btn__dot" style="background:${s.dot}"></span>
            <span class="sev-btn__label">${s.label}</span>
            <span class="sev-btn__sub">${s.sub}</span>
          </button>`).join('')}
      </div>`;
    c.appendChild(card);
  });
}

function updateSev(key, val) {
  S.setSev(key, val);
  const card = document.getElementById('sc-' + key);
  if (!card) return;
  card.className = `sev-card sev-${val}`;
  card.querySelectorAll('.sev-btn').forEach(btn => {
    SEV_OPTS.forEach(s => btn.classList.remove(s.cls));
    const lbl = btn.querySelector('.sev-btn__label').textContent;
    const match = SEV_OPTS.find(s => s.label === lbl);
    if (match && match.id === val) btn.classList.add(match.cls);
    btn.setAttribute('aria-pressed', match && match.id === val ? 'true' : 'false');
  });
}

/* ─── CARD RENDER ─── */
function renderCard() {
  const wrap = document.getElementById('cardWrap');
  wrap.innerHTML = '';
  wrap.appendChild(buildCard());
}

function buildCard() {
  const worst = S.worst();
  const b = BANNER[worst];
  const lvl = worst === 'anaphylactic' ? 'ana' : worst === 'severe' ? 'sev' : 'int';

  const card = document.createElement('div');
  card.className = 'allergy-card';
  card.innerHTML = `
    <div class="card-banner lvl-${lvl}">
      <div class="card-banner__th">${b.th}</div>
      <div class="card-banner__en">${b.en}</div>
    </div>
    <div class="card-body">
      ${(S.name || S.sos) ? `
        <div class="card-patient">
          ${S.name ? `<span class="card-patient__name">${esc(S.name)}</span>` : '<span></span>'}
          ${S.sos  ? `<span class="card-patient__sos">SOS: ${esc(S.sos)}</span>` : ''}
        </div>` : ''}
      ${S.allergens.map(e => {
        const def = ALL_A.find(a => a.key === e.key);
        const t   = TH_ALLERGENS[e.key];
        if (!def || !t) return ''; /* skip unknown keys */
        return `<div class="card-allergen">
          <span class="card-allergen__icon">${def.emoji}</span>
          <div>
            <span class="card-allergen__th">${t.th}</span>
            <span class="card-allergen__rom">${t.rom}</span>
            <span class="card-allergen__en">${def.label}</span>
          </div>
        </div>`;
      }).join('')}
      <div class="card-instr">
        <div class="card-instr__th">${INSTR_TH}</div>
        <div class="card-instr__en">${INSTR_EN}</div>
        <div class="card-cross">⚠ Includes cross-contamination risk</div>
      </div>
      ${S.hotel ? `<div class="card-hotel">📍 ${esc(S.hotel)}</div>` : ''}
    </div>
    <div class="card-footer">
      <span class="card-footer__v">${VERIFIED}</span>
      <span class="card-footer__b">AllergyPass</span>
    </div>`;
  return card;
}

/* ─── CHEF MODE ─── */
function openChef() {
  const worst = S.worst();
  const b   = BANNER[worst];
  const lvl = worst === 'anaphylactic' ? 'ana' : worst === 'severe' ? 'sev' : 'int';
  const ci  = document.getElementById('chefInner');
  ci.innerHTML = '';

  const banner = document.createElement('div');
  banner.className = `chef-banner lvl-${lvl}`;
  banner.innerHTML = `<div class="chef-banner__th">${b.th}</div><div class="chef-banner__en">${b.en}</div>`;
  ci.appendChild(banner);

  S.allergens.forEach(e => {
    const def = ALL_A.find(a => a.key === e.key);
    const t   = TH_ALLERGENS[e.key];
    if (!def || !t) return; /* skip unknown keys */
    const row = document.createElement('div');
    row.className = 'chef-allergen';
    row.innerHTML = `
      <span class="chef-allergen__icon">${def.emoji}</span>
      <div>
        <span class="chef-allergen__th">${t.th}</span>
        <span class="chef-allergen__rom">${t.rom}</span>
        <span class="chef-allergen__en">${def.label}</span>
      </div>`;
    ci.appendChild(row);
  });

  const instr = document.createElement('div');
  instr.className = 'chef-instr';
  instr.innerHTML = `<div class="chef-instr__th">${INSTR_TH}</div><div class="chef-instr__en">${INSTR_EN}</div>`;
  ci.appendChild(instr);

  document.getElementById('chef-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeChef() {
  document.getElementById('chef-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* expose for inline onclick */
window.goNext   = goNext;
window.goBack   = goBack;
window.goTo     = goTo;
window.updateSev = updateSev;
window.openChef = openChef;
window.closeChef = closeChef;
window.S = S;

/* ─── SAVE TO GALLERY ─── */
function showToast(msg, duration) {
  const t = document.getElementById('saveToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration || 2800);
}

async function saveCardToGallery() {
  const btn = document.getElementById('btnSave');
  if (!btn || btn.classList.contains('saving')) return;

  const cardEl = document.getElementById('cardWrap');
  if (!cardEl || !cardEl.firstElementChild) return;

  btn.classList.add('saving');
  btn.textContent = '…';

  try {
    /* Load html2canvas on demand */
    if (!window.html2canvas) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGE2Abi0/wCQBeRLUh7bpwIFaQCU5khQ==';
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const canvas = await html2canvas(cardEl.firstElementChild, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');

    /* Try Web Share API first (iOS/Android native save) */
    if (navigator.canShare) {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'allergypass-card.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My AllergyPass Card' });
        btn.classList.remove('saving');
        btn.textContent = '⬇ Save';
        return;
      }
    }

    /* Desktop fallback - trigger download */
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'allergypass-card.png';
    a.click();
    showToast('Card downloaded - open it in your gallery to save', 3200);

  } catch (err) {
    /* If share was cancelled by user, don't show error */
    if (err && err.name === 'AbortError') {
      btn.classList.remove('saving');
      btn.textContent = '⬇ Save';
      return;
    }
    /* Last resort - open image in new tab with instructions */
    showToast('Press and hold the image to save it', 3500);
  }

  btn.classList.remove('saving');
  btn.textContent = '⬇ Save';
}

window.saveCardToGallery = saveCardToGallery;

/* ─── RETURNING USER DETECTION ─── */
document.addEventListener('DOMContentLoaded', () => {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('ap26')); } catch(e){ return null; } })();
  if (saved && Array.isArray(saved.allergens) && saved.allergens.length > 0) {
    const banner = document.createElement('div');
    banner.id = 'returnBanner';
    banner.innerHTML = `
      <span>You have a saved card</span>
      <button onclick="goTo(4);document.getElementById('returnBanner').remove()">View it →</button>`;
    banner.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;gap:1rem;
      background:var(--clay-light);border:1px solid var(--clay-mid);
      border-radius:var(--radius);padding:0.75rem 1rem;margin-bottom:1.25rem;
      font-size:0.875rem;font-weight:600;color:var(--clay);`;
    banner.querySelector('button').style.cssText = `
      background:var(--clay);color:#fff;border:none;border-radius:var(--radius-sm);
      padding:0.4rem 0.875rem;font-size:0.8125rem;font-weight:700;cursor:pointer;white-space:nowrap;`;
    const frame = document.querySelector('.app-frame');
    const progressBar = frame && frame.querySelector('.progress-bar');
    if (progressBar) progressBar.after(banner);
  }
});
