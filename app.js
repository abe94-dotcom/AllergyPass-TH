'use strict';

/**
 * MODULE: MASTER ALLERGEN LIST
 * Single source of truth for keys, labels, and emojis.
 */
const ALLERGENS = [
  { key: 'peanuts',   label: 'Peanuts',    emoji: '🥜' },
  { key: 'tree_nuts', label: 'Tree Nuts',  emoji: '🌰' },
  { key: 'shellfish', label: 'Shellfish',  emoji: '🦐' },
  { key: 'fish',      label: 'Fish',       emoji: '🐟' },
  { key: 'dairy',     label: 'Dairy',      emoji: '🥛' },
  { key: 'eggs',      label: 'Eggs',       emoji: '🥚' },
  { key: 'soy',       label: 'Soy',        emoji: '🫘' },
  { key: 'wheat',     label: 'Wheat',      emoji: '🌾' },
  { key: 'gluten',    label: 'Gluten',     emoji: '🍞' },
  { key: 'sesame',    label: 'Sesame',     emoji: '🌱' },
];

const TRIGGER_HINTS = {
  peanuts:   ['peanut oil', 'peanut sauce', 'satay sauce', 'mixed nuts'],
  tree_nuts: ['cashew', 'walnut', 'almond', 'pistachio', 'macadamia'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'oyster sauce', 'shrimp paste', 'fish sauce'],
  fish:      ['fish sauce', 'anchovies', 'fish stock', 'dashi'],
  dairy:     ['milk', 'butter', 'cream', 'cheese', 'yoghurt'],
  eggs:      ['egg noodles', 'mayonnaise', 'egg wash'],
  soy:       ['soy sauce', 'tofu', 'miso', 'edamame', 'tempeh'],
  wheat:     ['soy sauce', 'flour', 'bread', 'noodles'],
  gluten:    ['soy sauce', 'miso', 'flour', 'tempura batter', 'wheat noodles'],
  sesame:    ['sesame oil', 'tahini', 'sesame seeds'],
};

/**
 * MODULE: COUNTRY REGISTRY
 */
const COUNTRIES = [
  { code: 'th', flag: '🇹🇭', name: 'Thailand',   langs: ['th'] },
  { code: 'jp', flag: '🇯🇵', name: 'Japan',      langs: ['ja'] },
  { code: 'vn', flag: '🇻🇳', name: 'Vietnam',    langs: ['vi'] },
  { code: 'kr', flag: '🇰🇷', name: 'Korea',      langs: ['ko'] },
  { code: 'cn', flag: '🇨🇳', name: 'China',      langs: ['zh'] },
  { code: 'sg', flag: '🇸🇬', name: 'Singapore',  langs: ['en','zh','ms','ta'], multi: true },
  { code: 'id', flag: '🇮🇩', name: 'Indonesia',  langs: ['id'] },
  { code: 'my', flag: '🇲🇾', name: 'Malaysia',   langs: ['ms'] },
];

/**
 * MODULE: TRANSLATION BUNDLES
 * Updated with Clinical Trust terminology.
 */
const TRANSLATIONS = {
  th: {
    card: {
      severe:        '⚠️ แพ้อาหารรุนแรงมาก — อันตรายถึงชีวิต',
      moderate:      'แพ้อาหาร — อาจทำให้ไม่สบาย',
      cross_contact: 'ระวังการปนเปื้อนจากอุปกรณ์ (Cross-contamination)',
      instruction:   'กรุณาแจ้งเชฟ: ชีวิตของลูกค้าขึ้นอยู่กับสิ่งนี้',
      verified:      'ตรวจสอบแล้วโดยบุคลากรทางการแพทย์',
    },
    allergens: {
      peanuts: 'ถั่วลิสง', tree_nuts: 'ถั่วเปลือกแข็ง', shellfish: 'อาหารทะเล (กุ้ง/ปู)',
      fish: 'ปลา', dairy: 'นม/เนย', eggs: 'ไข่', soy: 'ถั่วเหลือง', 
      wheat: 'แป้งสาลี', gluten: 'กลูเตน', sesame: 'งา'
    },
    hidden: {
      shellfish: [{ local: 'กะปิ', en: 'shrimp paste' }, { local: 'น้ำปลา', en: 'fish sauce' }],
      peanuts:   [{ local: 'น้ำมันถั่ว', en: 'peanut oil' }],
      soy:       [{ local: 'ซีอิ๊ว', en: 'soy sauce' }],
    }
  },
  // Note: Add other language bundles (ja, vi, etc.) following the same structure.
};

/**
 * MODULE: APP STATE
 */
const State = {
  country: 'th',
  allergens: [],
  name: '',
  emergency: '',
  isHighContrast: false,

  hasAllergen(key) { return this.allergens.some(a => a.key === key); },
  
  addAllergen(key) {
    if (this.hasAllergen(key)) return;
    this.allergens.push({ key, severity: 'anaphylactic', triggers: [] });
    this.save();
    this.sync();
  },

  removeAllergen(key) {
    this.allergens = this.allergens.filter(a => a.key !== key);
    this.save();
    this.sync();
  },

  setSeverity(key, sev) {
    const a = this.allergens.find(a => a.key === key);
    if (a) { a.severity = sev; this.save(); }
  },

  toggleHighContrast() {
    this.isHighContrast = !this.isHighContrast;
    const cardWrap = document.getElementById('allergy-card');
    if (cardWrap) cardWrap.classList.toggle('high-contrast-mode', this.isHighContrast);
  },

  sync() {
    syncPickerState();
    renderSelectedAllergens();
    updateGenerateBtn();
  },

  save() {
    localStorage.setItem('allergypass_v2026', JSON.stringify({
      country: this.country,
      allergens: this.allergens,
      name: this.name,
      emergency: this.emergency,
    }));
  },

  load() {
    const data = JSON.parse(localStorage.getItem('allergypass_v2026') || '{}');
    if (data.country) this.country = data.country;
    if (data.allergens) this.allergens = data.allergens;
    if (data.name) this.name = data.name;
    if (data.emergency) this.emergency = data.emergency;
  }
};

/**
 * MODULE: UI RENDERING
 */

function buildAllergenPicker() {
  const grid = document.getElementById('allergen-picker-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ALLERGENS.forEach(a => {
    const chip = document.createElement('button');
    chip.className = 'picker-chip tactile-btn';
    chip.innerHTML = `<span class="emoji">${a.emoji}</span><span class="label">${a.label}</span>`;
    chip.onclick = () => State.hasAllergen(a.key) ? State.removeAllergen(a.key) : State.addAllergen(a.key);
    grid.appendChild(chip);
  });
}

function syncPickerState() {
  document.querySelectorAll('.picker-chip').forEach((chip, index) => {
    const key = ALLERGENS[index].key;
    chip.classList.toggle('selected', State.hasAllergen(key));
  });
}

function renderSelectedAllergens() {
  const container = document.getElementById('selected-allergens');
  if (!container) return;
  container.innerHTML = '';

  State.allergens.forEach(entry => {
    const def = ALLERGENS.find(a => a.key === entry.key);
    const card = document.createElement('div');
    card.className = `selected-card-item sev-bg-${entry.severity}`;
    
    card.innerHTML = `
      <div class="card-header-row">
        <b>${def.emoji} ${def.label}</b>
        <button class="remove-btn" onclick="State.removeAllergen('${entry.key}')">✕</button>
      </div>
      <div class="tactile-severity-selector">
        <button class="${entry.severity === 'anaphylactic' ? 'active' : ''}" onclick="State.setSeverity('${entry.key}', 'anaphylactic'); State.sync();">Ana</button>
        <button class="${entry.severity === 'severe' ? 'active' : ''}" onclick="State.setSeverity('${entry.key}', 'severe'); State.sync();">Sev</button>
        <button class="${entry.severity === 'intolerance' ? 'active' : ''}" onclick="State.setSeverity('${entry.key}', 'intolerance'); State.sync();">Int</button>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * MODULE: CARD RENDERING (Healthcare Optimized)
 */
function buildCardForCountry(countryCode, profile) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const bundle = TRANSLATIONS[countryCode] || TRANSLATIONS['th'];
  const isLifeThreatening = profile.allergens.some(a => a.severity === 'anaphylactic');

  const card = document.createElement('div');
  card.className = `final-allergy-card ${State.isHighContrast ? 'restaurant-mode' : ''}`;

  card.innerHTML = `
    <div class="card-warning-header">
      <div class="status-badge">${isLifeThreatening ? bundle.card.severe : bundle.card.moderate}</div>
      ${profile.name ? `<div class="patient-name">${profile.name}</div>` : ''}
    </div>
    
    <div class="location-context">${country.flag} ${country.name}</div>
    
    <div class="allergen-grid-display">
      ${profile.allergens.map(a => `
        <div class="allergen-display-row">
          <span class="visual-emoji">${ALLERGENS.find(x => x.key === a.key).emoji}</span>
          <div class="text-stack">
            <div class="local-text">${bundle.allergens[a.key]}</div>
            <div class="english-text">${ALLERGENS.find(x => x.key === a.key).label}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="medical-instruction-block">
      <strong>${bundle.card.instruction}</strong>
      <div class="cross-contact-small">⚠️ ${bundle.card.cross_contact}</div>
    </div>

    <footer class="clinical-verification-footer">
      <span>🛡️ ${bundle.card.verified}</span>
      ${profile.emergency ? `<div class="emergency-sos">SOS: ${profile.emergency}</div>` : ''}
    </footer>
  `;

  return card;
}

/**
 * MODULE: INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
  State.load();
  buildAllergenPicker();
  
  // Restore Country Visuals
  const countryGrid = document.getElementById('flag-selector');
  if (countryGrid) {
    COUNTRIES.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `flag-btn ${State.country === c.code ? 'selected' : ''}`;
      btn.innerHTML = `<span>${c.flag}</span><small>${c.name}</small>`;
      btn.onclick = () => {
        State.country = c.code;
        document.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateGenerateBtn();
      };
      countryGrid.appendChild(btn);
    });
  }

  State.sync();

  // High Contrast (Restaurant Mode) Handler
  document.getElementById('btn-restaurant-mode')?.addEventListener('click', () => {
    State.toggleHighContrast();
  });

  // Offline Readiness (PWA Support)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      document.getElementById('offline-status-ready')?.classList.add('visible');
    });
  }
});

function updateGenerateBtn() {
  const btn = document.getElementById('btn-generate');
  if (btn) btn.disabled = (State.allergens.length === 0 || !State.country);
}

function renderGeneratedCard() {
  const wrap = document.getElementById('allergy-card');
  if (wrap) {
    wrap.innerHTML = '';
    wrap.appendChild(buildCardForCountry(State.country, State));
  }
}
