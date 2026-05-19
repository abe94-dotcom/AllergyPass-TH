'use strict';

/* ================================================================
   AllergyPass — app.js  (scroll-based progressive builder)
   Depends on: app-styles.css appended to style.css
   ================================================================ */

/* ── DATA ── */
const HIGH_ALLERGENS = [
  { key: 'shellfish', label: 'Shellfish & Shrimp', emoji: '🦐', hint: 'shrimp paste, oyster sauce' },
  { key: 'fish',      label: 'Fish & Fish Sauce',  emoji: '🐟', hint: 'hidden in nearly everything' },
  { key: 'peanuts',   label: 'Peanuts',             emoji: '🥜', hint: 'pad thai, satay, garnishes' },
  { key: 'soy',       label: 'Soy & Soy Sauce',    emoji: '🫘', hint: 'stir-fries, marinades' },
];
const OTHER_ALLERGENS = [
  { key: 'tree_nuts', label: 'Tree Nuts',   emoji: '🌰', hint: 'cashew, walnut, almond' },
  { key: 'dairy',     label: 'Dairy',       emoji: '🥛', hint: 'milk, butter, cream' },
  { key: 'eggs',      label: 'Eggs',        emoji: '🥚', hint: 'noodles, mayo, batter' },
  { key: 'wheat',     label: 'Wheat',       emoji: '🌾', hint: 'noodles, sauces, batter' },
  { key: 'gluten',    label: 'Gluten',      emoji: '🍞', hint: 'soy sauce, tempura batter' },
  { key: 'sesame',    label: 'Sesame',      emoji: '🌱', hint: 'sesame oil, tahini' },
];
const ALL_ALLERGENS = [...HIGH_ALLERGENS, ...OTHER_ALLERGENS];

const DESTINATIONS = [
  { code: 'TH', flag: '🇹🇭', name: 'Thailand',      sub: 'Thai + English',       insight: '🥜 Peanuts used as garnish in most dishes — always specify. Fish sauce is in almost everything.' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',          sub: 'Japanese + English',   insight: '🌱 Sesame and soy are everywhere. Dashi broth (fish stock) is in most soups.' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam',        sub: 'Vietnamese + English', insight: '🐟 Fish sauce is in nearly all sauces. Peanuts top many dishes.' },
  { code: 'IN', flag: '🇮🇳', name: 'India',          sub: 'Hindi + English',      insight: '🥛 Dairy (ghee, paneer) is common. Nut-based sauces are frequent.' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia',      sub: 'Indonesian + English', insight: '🥜 Peanut sauce is a staple. Shrimp paste (terasi) is in many dishes.' },
  { code: 'OTHER', flag: '🌍', name: 'Other country', sub: 'English card',         insight: 'Your card will be shown in English with a clear, universally readable format.' },
];

const TONES = [
  { id: 'polite',   icon: '🤝', name: 'Polite',   desc: 'Respectful and calm',            preview: '"I have a food allergy. Please avoid the following ingredients."' },
  { id: 'standard', icon: '📋', name: 'Standard', desc: 'Clear and direct',                preview: '"FOOD ALLERGY. Do not include these in my food."' },
  { id: 'urgent',   icon: '⚠️', name: 'Urgent',   desc: 'Firm — for life-threatening',    preview: '"SEVERE ALLERGY. My life is at risk. Please read carefully."' },
];

const STYLES = [
  { id: 'medical',  name: 'Medical',     desc: 'Clinical & trusted',     bg: '#F0EDE8', fg: '#2C1F14', label: 'MED' },
  { id: 'minimal',  name: 'Minimalist',  desc: 'Clean & modern',         bg: '#1A1A1A', fg: '#FFFFFF', label: 'MIN' },
  { id: 'urgent',   name: 'Urgent red',  desc: 'Maximum visibility',     bg: '#8B0000', fg: '#FFFFFF', label: 'URGENT' },
  { id: 'travel',   name: 'Travel',      desc: 'Friendly & approachable', bg: '#FAF0EC', fg: '#2C1F14', label: 'TRAVEL' },
  { id: 'dark',     name: 'Dark mode',   desc: 'Easy on the eyes',       bg: '#222222', fg: '#C8E6C9', label: 'DARK' },
];

const SEV_OPTS = [
  { id: 'anaphylactic', label: 'Life-threatening', sub: 'I will die',       cls: 'act-ana' },
  { id: 'severe',       label: 'Severe',           sub: 'Serious reaction', cls: 'act-sev' },
  { id: 'intolerance',  label: 'Intolerance',      sub: 'Discomfort only',  cls: 'act-int' },
];

/* Thai translations — only Thai destination currently; extend per locale as needed */
const TH_TRANSLATIONS = {
  shellfish: { th: 'กุ้ง / หอย / ปู',         rom: 'kung / hoi / poo' },
  fish:      { th: 'ปลา / น้ำปลา',             rom: 'pla / nam pla' },
  peanuts:   { th: 'ถั่วลิสง',                 rom: 'thua lisong' },
  soy:       { th: 'ถั่วเหลือง / ซีอิ๊ว',      rom: 'thua lueang / si-io' },
  tree_nuts: { th: 'ถั่วเปลือกแข็ง',           rom: 'thua plueak khaeng' },
  dairy:     { th: 'นม / เนย',                 rom: 'nom / noe' },
  eggs:      { th: 'ไข่',                      rom: 'khai' },
  wheat:     { th: 'แป้งสาลี',                 rom: 'paeng sali' },
  gluten:    { th: 'กลูเตน',                   rom: 'gluten' },
  sesame:    { th: 'งา',                       rom: 'nga' },
};

const SEV_COPY = {
  anaphylactic: { th: 'แพ้อาหารรุนแรงมาก อันตรายถึงชีวิต', en: 'LIFE-THREATENING ALLERGY — DO NOT IGNORE' },
  severe:       { th: 'แพ้อาหาร อาจเป็นอันตรายร้ายแรง',    en: 'SEVERE FOOD ALLERGY — TAKE SERIOUSLY' },
  intolerance:  { th: 'แพ้อาหาร ไม่สบาย',                  en: 'FOOD INTOLERANCE — CAUSES DISCOMFORT' },
};

const INSTR_TH = 'กรุณาแจ้งเชฟ: ชีวิตของลูกค้าขึ้นอยู่กับสิ่งนี้\nโปรดระวังการปนเปื้อนข้ามทุกชนิด';
const INSTR_EN = 'Please inform the chef. Cross-contamination must be avoided.';
const VERIFIED  = 'ตรวจสอบแล้วโดยบุคลากรทางการแพทย์';

/* ── STATE ── */
const S = {
  allergens: [],       // [{ key, sev }]
  dest: 'TH',
  tone: 'standard',
  style: 'medical',
  name: '', sos: '', hotel: '',
  completedSteps: new Set(),

  has(k)       { return this.allergens.some(a => a.key === k); },
  toggle(k)    { this.has(k) ? this.allergens = this.allergens.filter(a => a.key !== k) : this.allergens.push({ key: k, sev: 'anaphylactic' }); this.persist(); },
  setSev(k, v) {
    const VALID = ['anaphylactic', 'severe', 'intolerance'];
    if (!VALID.includes(v)) return;
    const a = this.allergens.find(a => a.key === k);
    if (a) { a.sev = v; this.persist(); }
  },
  remove(k) {
    this.allergens = this.allergens.filter(a => a.key !== k);
    this.persist();
    renderSevList();
    syncAllergenChips();
    updateStep1State();
    updatePreviews();
  },
  worst() {
    if (this.allergens.some(a => a.sev === 'anaphylactic')) return 'anaphylactic';
    if (this.allergens.some(a => a.sev === 'severe'))       return 'severe';
    return 'intolerance';
  },
  persist() {
    try {
      localStorage.setItem('ap_v3', JSON.stringify({
        v: 3,
        allergens: this.allergens,
        dest: this.dest, tone: this.tone, style: this.style,
        name: this.name, sos: this.sos, hotel: this.hotel,
        completedSteps: [...this.completedSteps],
      }));
    } catch (_) {}
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('ap_v3'));
      if (!d || d.v !== 3) return;
      if (Array.isArray(d.allergens)) {
        this.allergens = d.allergens.filter(a =>
          ALL_ALLERGENS.some(x => x.key === a.key) &&
          ['anaphylactic', 'severe', 'intolerance'].includes(a.sev)
        );
      }
      if (d.dest  && DESTINATIONS.some(x => x.code === d.dest))  this.dest  = d.dest;
      if (d.tone  && TONES.some(x => x.id === d.tone))           this.tone  = d.tone;
      if (d.style && STYLES.some(x => x.id === d.style))         this.style = d.style;
      this.name  = String(d.name  || '').slice(0, 80);
      this.sos   = String(d.sos   || '').slice(0, 30);
      this.hotel = String(d.hotel || '').slice(0, 80);
      if (Array.isArray(d.completedSteps)) this.completedSteps = new Set(d.completedSteps);
    } catch (_) {
      try { localStorage.removeItem('ap_v3'); } catch (__) {}
    }
  },
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  S.load();

  buildAllergenGrid(document.getElementById('gridHigh'),  HIGH_ALLERGENS);
  buildAllergenGrid(document.getElementById('gridOther'), OTHER_ALLERGENS);
  buildDestGrid();
  buildStyleGrid();
  buildToneOpts();

  /* Restore saved text fields */
  const inpName  = document.getElementById('inpName');
  const inpSos   = document.getElementById('inpSos');
  const inpHotel = document.getElementById('inpHotel');
  if (inpName)  inpName.value  = S.name;
  if (inpSos)   inpSos.value   = S.sos;
  if (inpHotel) inpHotel.value = S.hotel;

  [['inpName','name'], ['inpSos','sos'], ['inpHotel','hotel']].forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      S[key] = el.value.trim().slice(key === 'sos' ? 30 : 80);
      S.persist();
      updatePreviews();
    });
  });

  syncAllergenChips();
  updateStep1State();
  restoreState();
  updatePreviews();
  updateMobileBar();
});

/* ── RESTORE SAVED STATE ── */
function restoreState() {
  if (S.completedSteps.size === 0) {
    updateProgress(1);
    return;
  }

  const maxDone = Math.max(...S.completedSteps);

  /* Collapse all completed steps */
  for (let i = 1; i <= 4; i++) {
    if (S.completedSteps.has(i)) collapseSection(i, false);
  }

  if (maxDone >= 4) {
    /* Show export */
    const exp = document.getElementById('sec5');
    if (exp) { exp.classList.add('show'); renderExport(); }
    updateProgress(5);
    const returnBanner = document.getElementById('returnBanner');
    if (returnBanner) returnBanner.style.display = 'flex';
  } else {
    const next = maxDone + 1;
    unlockSection(next);
    if (next === 2) renderSevList();
    updateProgress(next);
  }
}

/* ── ALLERGEN GRID ── */
function buildAllergenGrid(el, list) {
  if (!el) return;
  el.innerHTML = '';
  list.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'ag-chip';
    btn.dataset.key = a.key;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `
      <span class="ag-emoji">${a.emoji}</span>
      <span class="ag-info">
        <span class="ag-name">${esc(a.label)}</span>
        <span class="ag-hint">${esc(a.hint)}</span>
      </span>
      <span class="ag-check" aria-hidden="true">✓</span>`;
    btn.addEventListener('click', () => {
      S.toggle(a.key);
      syncAllergenChips();
      updateStep1State();
      updatePreviews();
      updateMobileBar();
    });
    el.appendChild(btn);
  });
}

function syncAllergenChips() {
  document.querySelectorAll('.ag-chip').forEach(c => {
    const sel = S.has(c.dataset.key);
    c.classList.toggle('sel', sel);
    c.setAttribute('aria-pressed', sel ? 'true' : 'false');
  });
}

function updateStep1State() {
  const btn = document.getElementById('btn1');
  const cnt = document.getElementById('cnt1');
  if (!btn) return;
  const n = S.allergens.length;
  btn.disabled = n === 0;
  if (cnt) cnt.textContent = n === 0 ? 'Select at least one allergen' : `${n} allergen${n === 1 ? '' : 's'} selected`;
}

/* ── DESTINATION GRID ── */
function buildDestGrid() {
  const el = document.getElementById('destGrid');
  if (!el) return;
  el.innerHTML = '';
  DESTINATIONS.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'dest-chip' + (S.dest === d.code ? ' sel' : '');
    btn.dataset.code = d.code;
    btn.setAttribute('aria-pressed', S.dest === d.code ? 'true' : 'false');
    btn.innerHTML = `
      <span class="dest-flag">${d.flag}</span>
      <span class="dest-name">${esc(d.name)}</span>
      <span class="dest-sub">${esc(d.sub)}</span>`;
    btn.addEventListener('click', () => {
      S.dest = d.code;
      S.persist();
      document.querySelectorAll('.dest-chip').forEach(c => {
        const sel = c.dataset.code === d.code;
        c.classList.toggle('sel', sel);
        c.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });
      showDestInsight(d);
      updatePreviews();
    });
    el.appendChild(btn);
  });
  const cur = DESTINATIONS.find(d => d.code === S.dest);
  if (cur) showDestInsight(cur);
}

function showDestInsight(d) {
  const el = document.getElementById('destInsight');
  if (!el) return;
  if (!d.insight) { el.classList.remove('show'); return; }
  el.innerHTML = `<strong>Heads up for ${esc(d.name)}:</strong> ${esc(d.insight)}`;
  el.classList.add('show');
}

/* ── STYLE GRID ── */
function buildStyleGrid() {
  const el = document.getElementById('styleGrid');
  if (!el) return;
  el.innerHTML = '';
  STYLES.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'style-opt' + (S.style === s.id ? ' sel' : '');
    btn.dataset.id = s.id;
    btn.setAttribute('aria-pressed', S.style === s.id ? 'true' : 'false');
    btn.innerHTML = `
      <div class="style-swatch" style="background:${s.bg};color:${s.fg}">${esc(s.label)}</div>
      <div class="style-opt-name">${esc(s.name)}</div>
      <div class="style-opt-desc">${esc(s.desc)}</div>`;
    btn.addEventListener('click', () => {
      S.style = s.id;
      S.persist();
      document.querySelectorAll('.style-opt').forEach(c => {
        const sel = c.dataset.id === s.id;
        c.classList.toggle('sel', sel);
        c.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });
      updatePreviews();
    });
    el.appendChild(btn);
  });
}

/* ── TONE OPTIONS ── */
function buildToneOpts() {
  const el = document.getElementById('toneOpts');
  if (!el) return;
  el.innerHTML = '';
  TONES.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tone-opt' + (S.tone === t.id ? ' sel' : '');
    btn.dataset.id = t.id;
    btn.setAttribute('aria-pressed', S.tone === t.id ? 'true' : 'false');
    btn.innerHTML = `
      <span class="tone-icon" aria-hidden="true">${t.icon}</span>
      <span class="tone-info">
        <span class="tone-name">${esc(t.name)}</span>
        <span class="tone-desc">${esc(t.desc)}</span>
        <span class="tone-preview-line">${esc(t.preview)}</span>
      </span>`;
    btn.addEventListener('click', () => {
      S.tone = t.id;
      S.persist();
      document.querySelectorAll('.tone-opt').forEach(c => {
        const sel = c.dataset.id === t.id;
        c.classList.toggle('sel', sel);
        c.setAttribute('aria-pressed', sel ? 'true' : 'false');
      });
      updatePreviews();
    });
    el.appendChild(btn);
  });
}

/* ── SEVERITY LIST ── */
function renderSevList() {
  const c = document.getElementById('sevList');
  if (!c) return;
  c.innerHTML = '';

  if (S.allergens.length === 0) {
    c.innerHTML = '<div style="text-align:center;padding:2rem 0;color:var(--dust)"><div style="font-size:2rem;margin-bottom:0.5rem">🌿</div><p style="font-size:0.875rem">Go back and select some allergens first.</p></div>';
    return;
  }

  S.allergens.forEach(entry => {
    const def = ALL_ALLERGENS.find(a => a.key === entry.key);
    if (!def) return;

    const card = document.createElement('div');
    const lvlCls = entry.sev === 'anaphylactic' ? 'lvl-ana' : entry.sev === 'severe' ? 'lvl-sev' : '';
    card.className = `sev-card ${lvlCls}`;
    card.id = 'sc-' + entry.key;

    card.innerHTML = `
      <div class="sev-card-head">
        <div class="sev-card-name">
          <span aria-hidden="true">${def.emoji}</span>
          ${esc(def.label)}
        </div>
        <button class="sev-card-remove" aria-label="Remove ${esc(def.label)}">✕</button>
      </div>
      <div class="sev-btns">
        ${SEV_OPTS.map(s => `
          <button class="sev-btn ${entry.sev === s.id ? s.cls : ''}"
                  data-key="${esc(entry.key)}" data-sev="${esc(s.id)}"
                  aria-pressed="${entry.sev === s.id}">
            <span class="sev-dot" aria-hidden="true"></span>
            <span class="sev-btn-label">${esc(s.label)}</span>
            <span class="sev-btn-sub">${esc(s.sub)}</span>
          </button>`).join('')}
      </div>`;

    card.querySelector('.sev-card-remove').addEventListener('click', () => S.remove(entry.key));
    card.querySelectorAll('.sev-btn').forEach(btn => {
      btn.addEventListener('click', () => updateSev(btn.dataset.key, btn.dataset.sev));
    });

    c.appendChild(card);
  });
}

function updateSev(key, val) {
  const VALID = ['anaphylactic', 'severe', 'intolerance'];
  if (!VALID.includes(val)) return;
  S.setSev(key, val);

  const card = document.getElementById('sc-' + key);
  if (!card) return;
  card.className = `sev-card ${val === 'anaphylactic' ? 'lvl-ana' : val === 'severe' ? 'lvl-sev' : ''}`;
  card.querySelectorAll('.sev-btn').forEach(btn => {
    SEV_OPTS.forEach(s => btn.classList.remove(s.cls));
    if (btn.dataset.sev === val) {
      const match = SEV_OPTS.find(s => s.id === val);
      if (match) btn.classList.add(match.cls);
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.setAttribute('aria-pressed', 'false');
    }
  });
  updatePreviews();
}

/* ── CARD BUILDER ── */
function buildCard() {
  const worst = S.worst();
  const copy  = SEV_COPY[worst];
  const lvl   = worst === 'anaphylactic' ? 'ana' : worst === 'severe' ? 'sev' : 'int';
  const styleCls = S.style !== 'medical' ? ` s-${S.style}` : '';

  /* Tone note */
  let toneHtml = '';
  if (S.tone === 'urgent') {
    toneHtml = `<div class="ac-tone-note urgent">⚠ Urgent — please read carefully before preparing this order</div>`;
  } else if (S.tone === 'polite') {
    const t = TONES.find(x => x.id === 'polite');
    toneHtml = `<div class="ac-tone-note polite">${esc(t.preview)}</div>`;
  }

  /* Allergen rows — Thai translation for TH destination, English for others */
  const useThai = S.dest === 'TH' || S.dest === 'JP' || S.dest === 'VN' || S.dest === 'IN' || S.dest === 'ID';
  const allergenRows = S.allergens.map(entry => {
    const def = ALL_ALLERGENS.find(a => a.key === entry.key);
    const t   = TH_TRANSLATIONS[entry.key];
    if (!def) return '';
    const thai = useThai && t
      ? `<span class="ac-allergen-th">${esc(t.th)}</span><span class="ac-allergen-rom">${esc(t.rom)}</span>`
      : '';
    return `
      <div class="ac-allergen">
        <span class="ac-allergen-icon" aria-hidden="true">${def.emoji}</span>
        <div>
          ${thai}
          <span class="ac-allergen-en">${esc(def.label)}</span>
        </div>
      </div>`;
  }).join('');

  const patientHtml = (S.name || S.sos) ? `
    <div class="ac-patient">
      ${S.name ? `<span class="ac-patient-name">${esc(S.name)}</span>` : ''}
      ${S.sos  ? `<span class="ac-patient-sos">SOS: ${esc(S.sos)}</span>` : ''}
    </div>` : '';

  const hotelHtml = S.hotel ? `<div class="ac-hotel">📍 ${esc(S.hotel)}</div>` : '';

  const html = `
    <div class="allergy-card${esc(styleCls)}" role="img" aria-label="Allergy card">
      <div class="ac-banner lvl-${lvl}">
        <div class="ac-banner-th">${esc(copy.th)}</div>
        <div class="ac-banner-en">${esc(copy.en)}</div>
      </div>
      <div class="ac-body">
        ${patientHtml}
        ${allergenRows}
        ${toneHtml}
        <div class="ac-instr">
          <div class="ac-instr-th">${esc(INSTR_TH)}</div>
          <div class="ac-instr-en">${esc(INSTR_EN)}</div>
        </div>
        ${hotelHtml}
      </div>
      <div class="ac-footer">
        <span class="ac-footer-v">${esc(VERIFIED)}</span>
        <span class="ac-footer-b">AllergyPass</span>
      </div>
    </div>`;

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

/* ── PREVIEWS ── */
function updatePreviews() {
  renderPreviewInto('previewSidebar', true);
  renderPreviewInto('previewModalCard', false);
  updateMobileBar();
}

function renderPreviewInto(containerId, scaled) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (S.allergens.length === 0) {
    container.innerHTML = '<div class="preview-empty"><div class="preview-empty-icon">🛡️</div><div>Select allergies<br>to preview your card</div></div>';
    return;
  }

  const card = buildCard();

  if (scaled) {
    /* Scale to fit the 300px sidebar without clipping */
    const SCALE = 0.52;
    const wrap  = document.createElement('div');
    wrap.style.cssText = 'overflow:hidden;position:relative;';
    const inner = document.createElement('div');
    inner.style.cssText = `transform:scale(${SCALE});transform-origin:top left;width:${(100/SCALE).toFixed(2)}%;pointer-events:none;`;
    inner.appendChild(card);
    wrap.appendChild(inner);
    container.appendChild(wrap);
    /* Adjust wrapper height after paint */
    requestAnimationFrame(() => {
      const h = inner.offsetHeight;
      if (h) wrap.style.height = (h * SCALE) + 'px';
    });
  } else {
    container.appendChild(card);
  }
}

function renderExport() {
  const c = document.getElementById('cardPreviewLarge');
  if (!c) return;
  c.innerHTML = '';
  c.appendChild(buildCard());
  updatePreviews();
}

function updateMobileBar() {
  const lbl = document.getElementById('mobileBarLabel');
  const sub = document.getElementById('mobileBarSub');
  if (!lbl || !sub) return;
  const n = S.allergens.length;
  if (n === 0) {
    lbl.textContent = 'No allergens selected yet';
    sub.textContent = 'Add allergens to see your card preview';
  } else {
    lbl.textContent = `${n} allergen${n === 1 ? '' : 's'} selected`;
    sub.textContent = 'Review the preview before saving your card';
  }
}

/* ── SECTION FLOW ── */
function completeStep(n) {
  if (n === 1 && S.allergens.length === 0) return;

  /* Save text fields on step 3 completion */
  if (n === 3) {
    S.name  = (document.getElementById('inpName')  || {}).value?.trim().slice(0, 80) || '';
    S.sos   = (document.getElementById('inpSos')   || {}).value?.trim().slice(0, 30) || '';
    S.hotel = (document.getElementById('inpHotel') || {}).value?.trim().slice(0, 80) || '';
    S.persist();
  }

  S.completedSteps.add(n);
  S.persist();
  collapseSection(n, true);
  updateProgress(n + 1);

  if (n < 4) {
    const next = n + 1;
    unlockSection(next);
    if (next === 2) renderSevList();
    smoothScrollTo('sec' + next);
  } else {
    /* All steps done — show export */
    const exp = document.getElementById('sec5');
    if (exp) {
      exp.classList.add('show');
      renderExport();
      updateProgress(5);
      const banner = document.getElementById('successBanner');
      if (banner) {
        banner.style.display = 'flex';
        setTimeout(() => { banner.style.display = 'none'; }, 5000);
      }
      smoothScrollTo('sec5');
    }
  }
}

function collapseSection(n, animate) {
  const sec = document.getElementById('sec' + n);
  if (!sec) return;
  sec.classList.add('bsec--collapsed');
  sec.classList.remove('bsec--locked');

  /* Update collapsed heading */
  const q = document.getElementById('s' + n + 'q');
  if (q) q.innerHTML = collapsedHeading(n) + '<div class="bsec-done-check" aria-hidden="true">✓</div>';

  /* Populate summary chips */
  populateSummary(n);
}

function unlockSection(n) {
  const sec = document.getElementById('sec' + n);
  if (!sec) return;
  sec.classList.remove('bsec--locked', 'bsec--collapsed');

  /* Restore original heading text */
  const HEADINGS = ['', 'What should kitchens avoid?', 'How serious are these reactions?', 'Where are you traveling?', 'Choose your card style'];
  const q = document.getElementById('s' + n + 'q');
  if (q && HEADINGS[n]) q.textContent = HEADINGS[n];
}

function tryExpand(n) {
  if (!S.completedSteps.has(n)) return; /* Only completed steps can be re-opened */
  unlockSection(n);
  if (n === 2) renderSevList();
  smoothScrollTo('sec' + n);
}

function collapsedHeading(n) {
  if (n === 1) return `Allergies: ${S.allergens.length} selected`;
  if (n === 2) {
    const w = S.worst();
    return `Severity: ${w === 'anaphylactic' ? 'Life-threatening' : w === 'severe' ? 'Severe' : 'Intolerance'}`;
  }
  if (n === 3) {
    const d = DESTINATIONS.find(x => x.code === S.dest);
    return `Destination: ${d ? d.flag + ' ' + d.name : '—'}`;
  }
  if (n === 4) {
    const s = STYLES.find(x => x.id === S.style);
    const t = TONES.find(x => x.id === S.tone);
    return `Style: ${s ? s.name : '—'} · ${t ? t.name : '—'} tone`;
  }
  return '';
}

function populateSummary(n) {
  const el = document.getElementById('s' + n + 'summary');
  if (!el) return;
  el.innerHTML = '';

  const addChip = text => {
    const chip = document.createElement('span');
    chip.className = 'bsec-sum-chip';
    chip.textContent = text;
    el.appendChild(chip);
  };

  if (n === 1) {
    S.allergens.slice(0, 4).forEach(a => {
      const def = ALL_ALLERGENS.find(x => x.key === a.key);
      if (def) addChip(def.emoji + ' ' + def.label);
    });
    if (S.allergens.length > 4) addChip(`+${S.allergens.length - 4} more`);
  }
  if (n === 2) {
    const w = S.worst();
    addChip(w === 'anaphylactic' ? '🔴 Life-threatening' : w === 'severe' ? '🟠 Severe' : '🟡 Intolerance');
  }
  if (n === 3) {
    const d = DESTINATIONS.find(x => x.code === S.dest);
    if (d) addChip(d.flag + ' ' + d.name);
  }
  if (n === 4) {
    const s = STYLES.find(x => x.id === S.style);
    const t = TONES.find(x => x.id === S.tone);
    if (s) addChip(s.name);
    if (t) addChip(t.name + ' tone');
  }
}

/* ── PROGRESS ── */
function updateProgress(activeStep) {
  for (let i = 1; i <= 5; i++) {
    const dot  = document.getElementById('pd' + i);
    const lbl  = document.getElementById('pl' + i);
    const step = document.getElementById('ps' + i);
    if (!dot || !lbl) continue;

    dot.classList.remove('active', 'done');
    lbl.classList.remove('active', 'done');
    if (step) step.classList.remove('done');

    const numEl = dot.querySelector('.d-n');

    if (i < activeStep) {
      dot.classList.add('done');
      lbl.classList.add('done');
      if (step) step.classList.add('done');
      if (numEl) numEl.style.display = 'none';
    } else if (i === activeStep) {
      dot.classList.add('active');
      lbl.classList.add('active');
      if (numEl) numEl.style.display = '';
    } else {
      if (numEl) numEl.style.display = '';
    }
  }
}

/* ── EXPORT ── */
function jumpToExport() {
  const rb = document.getElementById('returnBanner');
  if (rb) rb.style.display = 'none';
  const exp = document.getElementById('sec5');
  if (!exp) return;
  if (!exp.classList.contains('show')) {
    exp.classList.add('show');
    renderExport();
    updateProgress(5);
  }
  smoothScrollTo('sec5');
}

/* ── SAVE ── */
async function saveCard() {
  const btn = document.getElementById('btnSave');
  if (btn && btn.disabled) return;
  if (btn) btn.disabled = true;

  const cardEl = document.getElementById('cardPreviewLarge');
  if (!cardEl || !cardEl.firstElementChild) {
    if (btn) btn.disabled = false;
    return;
  }

  const nameEl = cardEl.querySelector('.export-btn-name') || btn?.querySelector('.export-btn-name');
  if (nameEl) nameEl.textContent = 'Saving…';

  try {
    if (!window.html2canvas) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        // Prefer a vendored copy at /vendor/html2canvas.min.js; fallback to CDN if missing
        s.src = '/vendor/html2canvas.min.js';
        s.crossOrigin = 'anonymous';
        s.onload = res;
        s.onerror = () => {
          // try CDN as a fallback; set SRI for the CDN resource
          s.onerror = () => rej(new Error('cdn'));
          s.integrity = 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H';
          s.crossOrigin = 'anonymous';
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        };
        document.head.appendChild(s);
      });
    }

    const canvas  = await html2canvas(cardEl.firstElementChild, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const dataUrl = canvas.toDataURL('image/png');

    /* Try native share first (mobile) */
    if (navigator.canShare) {
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'allergypass-card.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My AllergyPass Card' });
        showSaveConfirm('Shared successfully ✓');
        if (nameEl) nameEl.textContent = 'Save to phone';
        if (btn) btn.disabled = false;
        return;
      }
    }

    /* Fallback: direct download */
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'allergypass-card.png';
    a.click();
    showSaveConfirm('Saved to your device — works in airplane mode ✓');

  } catch (err) {
    if (err?.name === 'AbortError') {
      /* user cancelled share sheet — not an error */
    } else if (err?.message === 'cdn') {
      showToast('Could not load save library — try screenshotting your card');
    } else {
      showToast('Could not save — try screenshotting your card');
    }
  }

  if (nameEl) nameEl.textContent = 'Save to phone';
  if (btn) btn.disabled = false;
}

function showSaveConfirm(msg) {
  const el = document.getElementById('saveConfirm');
  const txt = document.getElementById('saveConfirm__text');
  if (!el) return;
  if (txt) txt.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 5000);
}

/* ── CHEF MODE ── */
function openChefMode() {
  const c = document.getElementById('chefInner');
  if (!c) return;
  c.innerHTML = '';

  const worst = S.worst();
  const copy  = SEV_COPY[worst];
  const lvl   = worst === 'anaphylactic' ? 'lvl-ana' : worst === 'severe' ? 'lvl-sev' : 'lvl-int';

  /* Banner */
  const banner = document.createElement('div');
  banner.className = `ac-banner ${lvl}`;
  banner.style.cssText = 'border-radius:12px;margin-bottom:1rem;padding:1.25rem;text-align:center;';
  banner.innerHTML = `<div style="font-size:1.375rem;font-weight:800;margin-bottom:0.25rem">${esc(copy.th)}</div><div style="font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;opacity:0.9">${esc(copy.en)}</div>`;
  c.appendChild(banner);

  /* Allergens */
  S.allergens.forEach(entry => {
    const def = ALL_ALLERGENS.find(a => a.key === entry.key);
    const t   = TH_TRANSLATIONS[entry.key];
    if (!def) return;
    const row = document.createElement('div');
    row.className = 'chef-allergen';
    row.innerHTML = `
      <span class="chef-allergen-icon" aria-hidden="true">${def.emoji}</span>
      <div>
        ${t ? `<span class="chef-allergen-th">${esc(t.th)}</span><span class="chef-allergen-rom">${esc(t.rom)}</span>` : ''}
        <span class="chef-allergen-en">${esc(def.label)}</span>
      </div>`;
    c.appendChild(row);
  });

  /* Instructions */
  const instr = document.createElement('div');
  instr.className = 'chef-instr';
  instr.innerHTML = `<div class="chef-instr-th">${esc(INSTR_TH)}</div><div class="chef-instr-en">${esc(INSTR_EN)}</div>`;
  c.appendChild(instr);

  const overlay = document.getElementById('chef-overlay');
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeChefMode() {
  const overlay = document.getElementById('chef-overlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

function closeChefOnBg(e) {
  if (e.target === document.getElementById('chef-overlay')) closeChefMode();
}

/* ── MOBILE PREVIEW ── */
function openMobilePreview() {
  renderPreviewInto('previewModalCard', false);
  const modal = document.getElementById('previewModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeMobilePreview() {
  const modal = document.getElementById('previewModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

function closeMobilePreviewOnBg(e) {
  if (e.target === document.getElementById('previewModal')) closeMobilePreview();
}

/* ── START OVER ── */
function startOver() {
  S.allergens = [];
  S.name = ''; S.sos = ''; S.hotel = '';
  S.dest = 'TH'; S.tone = 'standard'; S.style = 'medical';
  S.completedSteps = new Set();
  S.persist();

  /* Reset text inputs */
  ['inpName', 'inpSos', 'inpHotel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  /* Reset sections */
  for (let i = 2; i <= 4; i++) {
    const sec = document.getElementById('sec' + i);
    if (sec) {
      sec.classList.remove('bsec--collapsed');
      sec.classList.add('bsec--locked');
    }
  }

  const exp = document.getElementById('sec5');
  if (exp) exp.classList.remove('show');

  unlockSection(1);
  syncAllergenChips();
  updateStep1State();
  updateProgress(1);
  updatePreviews();

  const rb = document.getElementById('returnBanner');
  if (rb) rb.style.display = 'none';

  /* Restore headings for steps 2–4 */
  const HEADINGS = ['', 'What should kitchens avoid?', 'How serious are these reactions?', 'Where are you traveling?', 'Choose your card style'];
  for (let i = 1; i <= 4; i++) {
    const q = document.getElementById('s' + i + 'q');
    if (q && HEADINGS[i]) q.textContent = HEADINGS[i];
  }

  /* Re-sync selection UI */
  document.querySelectorAll('.dest-chip').forEach(c => {
    const sel = c.dataset.code === 'TH';
    c.classList.toggle('sel', sel);
    c.setAttribute('aria-pressed', sel ? 'true' : 'false');
  });
  document.querySelectorAll('.style-opt').forEach(c => {
    const sel = c.dataset.id === 'medical';
    c.classList.toggle('sel', sel);
    c.setAttribute('aria-pressed', sel ? 'true' : 'false');
  });
  document.querySelectorAll('.tone-opt').forEach(c => {
    const sel = c.dataset.id === 'standard';
    c.classList.toggle('sel', sel);
    c.setAttribute('aria-pressed', sel ? 'true' : 'false');
  });

  showDestInsight(DESTINATIONS[0]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── UTILS ── */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s || '');
  return d.innerHTML;
}

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

function showToast(msg) {
  const t = document.getElementById('saveToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ── GLOBAL EXPOSURE (called from inline onclick in HTML) ── */
window.tryExpand          = tryExpand;
window.completeStep       = completeStep;
window.openMobilePreview  = openMobilePreview;
window.closeMobilePreview = closeMobilePreview;
window.closeMobilePreviewOnBg = closeMobilePreviewOnBg;
window.openChefMode       = openChefMode;
window.closeChefMode      = closeChefMode;
window.closeChefOnBg      = closeChefOnBg;
window.saveCard           = saveCard;
window.startOver          = startOver;
window.jumpToExport       = jumpToExport;
