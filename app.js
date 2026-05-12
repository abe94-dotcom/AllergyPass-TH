'use strict';

/* ─────────────────────────────────────────────
   ALLERGEN DATA
   Grouped by Thai cuisine risk
───────────────────────────────────────────── */
const ALLERGEN_GROUPS = {
  high: [
    { key: 'shellfish', label: 'Shellfish & Shrimp', emoji: '🦐', hint: 'shrimp paste, oyster sauce' },
    { key: 'fish',      label: 'Fish & Fish Sauce',  emoji: '🐟', hint: 'hidden in nearly everything' },
    { key: 'peanuts',   label: 'Peanuts',            emoji: '🥜', hint: 'pad thai, satay, garnishes' },
    { key: 'soy',       label: 'Soy & Soy Sauce',    emoji: '🫘', hint: 'stir-fries, marinades' },
  ],
  common: [
    { key: 'tree_nuts', label: 'Tree Nuts',  emoji: '🌰', hint: 'cashew, walnut, almond' },
    { key: 'dairy',     label: 'Dairy',      emoji: '🥛', hint: 'milk, butter, cream' },
    { key: 'eggs',      label: 'Eggs',       emoji: '🥚', hint: 'noodles, mayo, batter' },
    { key: 'wheat',     label: 'Wheat',      emoji: '🌾', hint: 'noodles, sauces, batter' },
    { key: 'gluten',    label: 'Gluten',     emoji: '🍞', hint: 'soy sauce, tempura batter' },
    { key: 'sesame',    label: 'Sesame',     emoji: '🌱', hint: 'sesame oil, tahini' },
  ],
};

const ALL_ALLERGENS = [...ALLERGEN_GROUPS.high, ...ALLERGEN_GROUPS.common];

/* ─────────────────────────────────────────────
   SEVERITY CONFIG
───────────────────────────────────────────── */
const SEVERITY = {
  anaphylactic: {
    id: 'anaphylactic',
    label: 'Life-threatening',
    sublabel: 'I will die',
    activeClass: 'active-ana',
    dotColor: '#CC0000',
  },
  severe: {
    id: 'severe',
    label: 'Severe',
    sublabel: 'Serious reaction',
    activeClass: 'active-sev',
    dotColor: '#D4860A',
  },
  intolerance: {
    id: 'intolerance',
    label: 'Intolerance',
    sublabel: 'Discomfort only',
    activeClass: 'active-int',
    dotColor: '#6B5040',
  },
};

/* ─────────────────────────────────────────────
   TRANSLATIONS (Thai — verified, not AI-generated)
───────────────────────────────────────────── */
const TH = {
  banner: {
    anaphylactic: { th: 'แพ้อาหารรุนแรงมาก — อันตรายถึงชีวิต', en: 'LIFE-THREATENING ALLERGY — DO NOT IGNORE' },
    severe:       { th: 'แพ้อาหาร — อาจเป็นอันตรายร้ายแรง',    en: 'SEVERE FOOD ALLERGY — TAKE SERIOUSLY' },
    intolerance:  { th: 'แพ้อาหาร — ไม่สบาย',                  en: 'FOOD INTOLERANCE — CAUSES DISCOMFORT' },
  },
  allergens: {
    shellfish: { th: 'กุ้ง / หอย / ปู', roman: 'kung / hoi / poo' },
    fish:      { th: 'ปลา / น้ำปลา',    roman: 'pla / nam pla' },
    peanuts:   { th: 'ถั่วลิสง',         roman: 'thua lisong' },
    soy:       { th: 'ถั่วเหลือง / ซีอิ๊ว', roman: 'thua lueang / si-io' },
    tree_nuts: { th: 'ถั่วเปลือกแข็ง',  roman: 'thua plueak khaeng' },
    dairy:     { th: 'นม / เนย',         roman: 'nom / noi' },
    eggs:      { th: 'ไข่',              roman: 'khai' },
    wheat:     { th: 'แป้งสาลี',         roman: 'paeng sali' },
    gluten:    { th: 'กลูเตน',           roman: 'gluten' },
    sesame:    { th: 'งา',               roman: 'nga' },
  },
  instruction: {
    th: 'กรุณาแจ้งเชฟ: ชีวิตของลูกค้าขึ้นอยู่กับสิ่งนี้\nโปรดระวังการปนเปื้อนข้ามทุกชนิด',
    en: 'Please inform the chef. Cross-contamination must be avoided.',
  },
  verified: 'ตรวจสอบแล้วโดยบุคลากรทางการแพทย์',
};

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
const State = {
  step: 1,
  allergens: [],       // [{ key, severity }]
  name: '',
  emergency: '',
  hotel: '',

  hasAllergen(key) {
    return this.allergens.some(a => a.key === key);
  },

  toggleAllergen(key) {
    if (this.hasAllergen(key)) {
      this.allergens = this.allergens.filter(a => a.key !== key);
    } else {
      this.allergens.push({ key, severity: 'anaphylactic' });
    }
    this.save();
  },

  setSeverity(key, sev) {
    const a = this.allergens.find(a => a.key === key);
    if (a) { a.severity = sev; this.save(); }
  },

  removeAllergen(key) {
    this.allergens = this.allergens.filter(a => a.key !== key);
    this.save();
    renderSeverityList();
    syncPickerState();
    updateCountLabel();
    updateNextBtn();
  },

  worstSeverity() {
    if (this.allergens.some(a => a.severity === 'anaphylactic')) return 'anaphylactic';
    if (this.allergens.some(a => a.severity === 'severe')) return 'severe';
    return 'intolerance';
  },

  save() {
    try {
      localStorage.setItem('allergypass_v2026', JSON.stringify({
        allergens: this.allergens,
        name: this.name,
        emergency: this.emergency,
        hotel: this.hotel,
      }));
    } catch (e) {
      console.error('Save failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem('allergypass_v2026');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Array.isArray(d.allergens)) this.allergens = d.allergens;
      if (d.name)      this.name      = d.name;
      if (d.emergency) this.emergency = d.emergency;
      if (d.hotel)     this.hotel     = d.hotel;
    } catch (e) {
      console.error('Load failed:', e);
    }
  },
};

/* ─────────────────────────────────────────────
   STEP NAVIGATION
───────────────────────────────────────────── */
const STEP_LABELS = {
  1: 'Pick your allergens',
  2: 'Set severity',
  3: 'Add details',
  4: 'Your card',
};

function goToStep(n) {
  if (n < 1 || n > 4) return;

  // Hide all panels
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`step-${n}`).classList.add('active');

  // Update dots + lines
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    dot.classList.remove('active', 'done');
    if (i < n)  dot.classList.add('done');
    if (i === n) dot.classList.add('active');
    if (i < 4) {
      const line = document.getElementById(`line-${i}`);
      line.classList.toggle('done', i < n);
    }
  }

  document.getElementById('step-label-text').textContent = STEP_LABELS[n];

  // Update progress bar aria
  const pb = document.getElementById('progress-bar');
  if (pb) pb.setAttribute('aria-valuenow', n);

  // Back button
  const btnBack = document.getElementById('btn-back');
  if (n === 1) {
    btnBack.hidden = true;
  } else {
    btnBack.hidden = false;
  }

  // Bottom action
  const bottomAction = document.getElementById('bottom-action');
  const cardAction   = document.getElementById('card-action');
  if (n === 4) {
    bottomAction.style.display = 'none';
    cardAction.style.display = 'flex';
    renderCard();
  } else {
    bottomAction.style.display = 'flex';
    cardAction.style.display = 'none';
  }

  State.step = n;
  updateNextBtn();

  // Step-specific renders
  if (n === 1) { syncPickerState(); updateCountLabel(); }
  if (n === 2) renderSeverityList();

  window.scrollTo(0, 0);
}

function updateNextBtn() {
  const btn   = document.getElementById('btn-next');
  const label = document.getElementById('btn-next-label');
  const step  = State.step;

  if (step === 1) {
    btn.disabled = State.allergens.length === 0;
    label.textContent = 'Set Severity';
  } else if (step === 2) {
    btn.disabled = false;
    label.textContent = 'Add Details';
  } else if (step === 3) {
    btn.disabled = false;
    label.textContent = 'See My Card';
  }
}

/* ─────────────────────────────────────────────
   STEP 1: ALLERGEN PICKER
───────────────────────────────────────────── */
function buildAllergenGrid(containerEl, allergens) {
  containerEl.innerHTML = '';
  allergens.forEach(a => {
    const chip = document.createElement('button');
    chip.className = 'allergen-chip';
    chip.dataset.key = a.key;
    chip.setAttribute('aria-pressed', State.hasAllergen(a.key) ? 'true' : 'false');
    chip.setAttribute('aria-label', `${a.label}: ${a.hint}`);
    chip.innerHTML = `
      <span class="chip-icon" aria-hidden="true">${a.emoji}</span>
      <span class="chip-text">
        <span class="chip-name">${a.label}</span>
        <span class="chip-hint">${a.hint}</span>
      </span>
      <span class="chip-check" aria-hidden="true"></span>
    `;
    chip.addEventListener('click', () => {
      State.toggleAllergen(a.key);
      syncPickerState();
      updateCountLabel();
      updateNextBtn();
    });
    containerEl.appendChild(chip);
  });
}

function syncPickerState() {
  document.querySelectorAll('.allergen-chip').forEach(chip => {
    const key = chip.dataset.key;
    if (!key) return;
    const selected = State.hasAllergen(key);
    chip.classList.toggle('selected', selected);
    chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
}

function updateCountLabel() {
  const el = document.getElementById('selection-count-num');
  if (el) el.textContent = State.allergens.length;
}

/* ─────────────────────────────────────────────
   STEP 2: SEVERITY LIST
───────────────────────────────────────────── */
function renderSeverityList() {
  const container = document.getElementById('severity-list');
  if (!container) return;
  container.innerHTML = '';

  if (State.allergens.length === 0) {
    container.innerHTML = `
      <div class="empty-severity">
        <p>No allergens selected. Go back and pick some.</p>
      </div>`;
    return;
  }

  State.allergens.forEach(entry => {
    const def = ALL_ALLERGENS.find(a => a.key === entry.key);
    if (!def) return;

    const item = document.createElement('div');
    item.className = `severity-item sev-${entry.severity}`;
    item.id = `sev-item-${entry.key}`;

    item.innerHTML = `
      <div class="sev-item-header">
        <div class="sev-item-name">
          <span class="sev-item-emoji" aria-hidden="true">${def.emoji}</span>
          ${def.label}
        </div>
        <button class="sev-remove-btn" aria-label="Remove ${def.label}" onclick="State.removeAllergen('${entry.key}')">✕</button>
      </div>
      <div class="sev-selector" role="group" aria-label="Severity for ${def.label}">
        ${Object.values(SEVERITY).map(s => `
          <button
            class="sev-btn ${entry.severity === s.id ? s.activeClass : ''}"
            onclick="setSevAndRefresh('${entry.key}', '${s.id}')"
            aria-pressed="${entry.severity === s.id ? 'true' : 'false'}"
            aria-label="${s.label}: ${s.sublabel}"
          >
            <span class="sev-dot" style="background:${s.dotColor}" aria-hidden="true"></span>
            <span>${s.label}</span>
            <span style="font-size:0.65rem; font-weight:400;">${s.sublabel}</span>
          </button>
        `).join('')}
      </div>
    `;

    container.appendChild(item);
  });
}

function setSevAndRefresh(key, sev) {
  State.setSeverity(key, sev);
  // Update item class
  const item = document.getElementById(`sev-item-${key}`);
  if (item) {
    item.className = `severity-item sev-${sev}`;
  }
  // Update button states
  const btns = item ? item.querySelectorAll('.sev-btn') : [];
  btns.forEach(btn => {
    const sEvData = Object.values(SEVERITY).find(s => btn.getAttribute('aria-label').startsWith(s.label));
    if (!sEvData) return;
    btn.classList.remove('active-ana', 'active-sev', 'active-int');
    if (sEvData.id === sev) {
      btn.classList.add(sEvData.activeClass);
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

/* ─────────────────────────────────────────────
   STEP 4: CARD RENDER
───────────────────────────────────────────── */
function renderCard() {
  const container = document.getElementById('generated-card');
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(buildCard(false));
}

function buildCard(restaurantMode) {
  const worst   = State.worstSeverity();
  const banner  = TH.banner[worst];
  const bannerCls = worst === 'anaphylactic' ? 'ana' : (worst === 'severe' ? 'sev' : 'int');

  if (restaurantMode) {
    // FULL SCREEN, HIGH CONTRAST VERSION
    const wrap = document.createElement('div');

    // Banner
    const bannerEl = document.createElement('div');
    bannerEl.className = `rc-banner ${bannerCls}`;
    bannerEl.innerHTML = `
      <div class="rc-banner-th">${banner.th}</div>
      <div class="rc-banner-en">${banner.en}</div>
    `;
    wrap.appendChild(bannerEl);

    // Each allergen
    State.allergens.forEach(entry => {
      const def  = ALL_ALLERGENS.find(a => a.key === entry.key);
      const trTH = TH.allergens[entry.key];
      const row  = document.createElement('div');
      row.className = 'rc-allergen';
      row.innerHTML = `
        <span class="rc-allergen-icon" aria-hidden="true">${def.emoji}</span>
        <div>
          <span class="rc-allergen-th">${trTH.th}</span>
          <span class="rc-allergen-roman">${trTH.roman}</span>
          <span class="rc-allergen-en">${def.label}</span>
        </div>
      `;
      wrap.appendChild(row);
    });

    // Instruction
    const inst = document.createElement('div');
    inst.className = 'rc-instruction';
    inst.innerHTML = `
      <div class="rc-instruction-th">${TH.instruction.th}</div>
      <div class="rc-instruction-en">${TH.instruction.en}</div>
    `;
    wrap.appendChild(inst);

    // SOS
    if (State.emergency || State.name) {
      const sos = document.createElement('div');
      sos.className = 'rc-sos';
      sos.innerHTML = `
        ${State.name ? `<div>${State.name}</div>` : ''}
        ${State.emergency ? `<div>SOS: ${State.emergency}</div>` : ''}
        ${State.hotel ? `<div>${State.hotel}</div>` : ''}
      `;
      wrap.appendChild(sos);
    }

    return wrap;

  } else {
    // COMPACT CARD VERSION
    const card = document.createElement('div');
    card.className = 'allergy-card';

    card.innerHTML = `
      <div class="card-severity-banner ${bannerCls}" role="status">
        <div class="card-banner-th">${banner.th}</div>
        <div class="card-banner-en">${banner.en}</div>
      </div>
      <div class="card-body">
        ${(State.name || State.emergency) ? `
          <div class="card-patient-row">
            ${State.name ? `<div class="card-patient-name">${State.name}</div>` : '<div></div>'}
            ${State.emergency ? `<div class="card-sos">SOS: ${State.emergency}</div>` : ''}
          </div>
        ` : ''}

        ${State.allergens.map(entry => {
          const def  = ALL_ALLERGENS.find(a => a.key === entry.key);
          const trTH = TH.allergens[entry.key];
          return `
            <div class="card-allergen-row">
              <span class="card-allergen-icon" aria-hidden="true">${def.emoji}</span>
              <div>
                <span class="card-allergen-th">${trTH.th}</span>
                <span class="card-allergen-roman">${trTH.roman}</span>
                <span class="card-allergen-en">${def.label}</span>
              </div>
            </div>
          `;
        }).join('')}

        <div class="card-instruction">
          <div class="card-instruction-th">${TH.instruction.th}</div>
          <div class="card-instruction-en">${TH.instruction.en}</div>
          <div class="card-cross-contact">⚠ Includes cross-contamination risk</div>
        </div>

        ${State.hotel ? `<div style="font-size:0.72rem; color:var(--soil); margin-top:0.75rem;">${State.hotel}</div>` : ''}
      </div>
      <div class="card-footer">
        <span class="card-footer-verified">${TH.verified}</span>
        <span class="card-footer-brand">AllergyPass</span>
      </div>
    `;

    return card;
  }
}

/* ─────────────────────────────────────────────
   RESTAURANT MODE (FULL SCREEN)
───────────────────────────────────────────── */
function openRestaurantMode() {
  const overlay = document.getElementById('restaurant-overlay');
  const inner   = document.getElementById('restaurant-card-inner');
  inner.innerHTML = '';
  inner.appendChild(buildCard(true));
  overlay.classList.add('open');
  overlay.focus();

  // Lock scroll on body
  document.body.style.overflow = 'hidden';
}

function closeRestaurantMode() {
  const overlay = document.getElementById('restaurant-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  State.load();

  // Build allergen grids
  buildAllergenGrid(document.getElementById('grid-high-risk'), ALLERGEN_GROUPS.high);
  buildAllergenGrid(document.getElementById('grid-common'),    ALLERGEN_GROUPS.common);
  syncPickerState();
  updateCountLabel();
  updateNextBtn();

  // Restore saved text fields
  if (State.name)      document.getElementById('user-name').value        = State.name;
  if (State.emergency) document.getElementById('emergency-contact').value = State.emergency;
  if (State.hotel)     document.getElementById('hotel-name').value        = State.hotel;

  // Next button
  document.getElementById('btn-next').addEventListener('click', () => {
    const s = State.step;
    if (s === 3) {
      // Save text fields before proceeding
      State.name      = document.getElementById('user-name').value.trim();
      State.emergency = document.getElementById('emergency-contact').value.trim();
      State.hotel     = document.getElementById('hotel-name').value.trim();
      State.save();
    }
    goToStep(s + 1);
  });

  // Back button
  document.getElementById('btn-back').addEventListener('click', () => {
    goToStep(State.step - 1);
  });

  // Restaurant mode
  document.getElementById('btn-show-restaurant').addEventListener('click', openRestaurantMode);
  document.getElementById('btn-close-restaurant').addEventListener('click', closeRestaurantMode);

  // Edit card
  document.getElementById('btn-edit-card').addEventListener('click', () => goToStep(1));

  // Paywall
  document.getElementById('btn-paywall-dismiss').addEventListener('click', () => {
    document.getElementById('paywall-overlay').hidden = true;
  });

  // PWA offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      document.getElementById('offline-pill').classList.add('visible');
    }).catch(() => {});
  }

  // Start on step 1
  goToStep(1);
});

// Expose for inline handlers
window.State          = State;
window.setSevAndRefresh = setSevAndRefresh;
