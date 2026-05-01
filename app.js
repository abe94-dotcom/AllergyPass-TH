'use strict';

// ===== TRANSLATIONS =====
const ALLERGEN_THAI = {
  'shellfish': 'อาหารทะเล',
  'nuts':      'ถั่ว',
  'gluten':    'กลูเตน',
  'peanuts':   'ถั่วลิสง',
  'dairy':     'นม',
  'eggs':      'ไข่',
  'soy':       'ถั่วเหลือง',
  'wheat':     'แป้งสาลี',
};

const SEVERITY_THAI = {
  'Anaphylactic': 'แพ้รุนแรงมาก',
  'Severe':       'แพ้รุนแรง',
  'Intolerance':  'แพ้เล็กน้อย',
};

// Normalized trigger lookup (lowercase, trimmed keys)
const TRIGGER_THAI = {
  'shrimp':        'กุ้ง',
  'shrimps':       'กุ้ง',
  'prawn':         'กุ้ง',
  'prawns':        'กุ้ง',
  'crab':          'ปู',
  'crabs':         'ปู',
  'lobster':       'ล็อบสเตอร์',
  'lobsters':      'ล็อบสเตอร์',
  'fish sauce':    'น้ำปลา',
  'fishsauce':     'น้ำปลา',
  'shrimp paste':  'กะปิ',
  'shrimpaste':    'กะปิ',
  'peanut':        'ถั่วลิสง',
  'peanuts':       'ถั่วลิสง',
  'cashew':        'มะม่วงหิมพานต์',
  'cashews':       'มะม่วงหิมพานต์',
  'soy sauce':     'ซีอิ๊ว',
  'soysauce':      'ซีอิ๊ว',
  'flour':         'แป้ง',
  'milk':          'นม',
  'butter':        'เนย',
  'oyster sauce':  'ซอสหอยนางรม',
  'oystersauce':   'ซอสหอยนางรม',
};

// Alias map: user input → canonical ALLERGEN_THAI key
const ALLERGEN_ALIASES = {
  'seafood':     'shellfish',
  'sea food':    'shellfish',
  'prawn':       'shellfish',
  'prawns':      'shellfish',
  'shrimp':      'shellfish',
  'shrimps':     'shellfish',
  'crustacean':  'shellfish',
  'crustaceans': 'shellfish',
  'nut':         'nuts',
  'tree nut':    'nuts',
  'tree nuts':   'nuts',
  'egg':         'eggs',
  'lactose':     'dairy',
  'milk':        'dairy',
  'peanut':      'peanuts',
  'soya':        'soy',
  'gluten':      'gluten',
  'wheat':       'wheat',
};

// Allergen-specific hidden ingredients
const HIDDEN_BY_ALLERGEN = {
  'shellfish': [
    { thai: 'กะปิ', en: 'shrimp paste' },
    { thai: 'น้ำปลา', en: 'fish sauce' },
    { thai: 'เต้าเจี้ยว', en: 'fermented paste' },
    { thai: 'ซอสหอยนางรม', en: 'oyster sauce' },
  ],
  'nuts': [
    { thai: 'น้ำมันถั่ว', en: 'nut oil' },
    { thai: 'ซอสถั่ว', en: 'nut sauce' },
  ],
  'gluten': [
    { thai: 'ซีอิ๊ว', en: 'soy sauce' },
    { thai: 'แป้ง', en: 'flour' },
  ],
  'wheat': [
    { thai: 'ซีอิ๊ว', en: 'soy sauce' },
    { thai: 'แป้ง', en: 'flour' },
  ],
  'peanuts': [
    { thai: 'น้ำมันถั่วลิสง', en: 'peanut oil' },
    { thai: 'ซอสถั่ว', en: 'peanut sauce' },
  ],
};

const LS_KEY = 'allergycard_th_v2';

// ===== STATE =====
let entryCounter = 0;
let saveTimer    = null;
let isQuickShow  = false;

// ===== DOM REFS =====
const screenProfile  = document.getElementById('screen-profile');
const screenCard     = document.getElementById('screen-card');
const inputName      = document.getElementById('input-name');
const inputEmergency = document.getElementById('input-emergency');
const allergensList  = document.getElementById('allergens-list');
const btnAdd         = document.getElementById('btn-add-allergy');
const btnGenerate    = document.getElementById('btn-generate');
const btnBack        = document.getElementById('btn-back');
const btnShowCard    = document.getElementById('btn-show-card');
const btnShowLast    = document.getElementById('btn-show-last');
const cardEl         = document.getElementById('allergy-card');
const template       = document.getElementById('allergy-template');
const quickOverlay   = document.getElementById('quick-overlay');

// ===== INIT =====
loadProfile();
renderEmptyState();
updateGenerateBtn();

btnAdd.addEventListener('click', () => addAllergyEntry(null));
btnGenerate.addEventListener('click', generateCard);
btnBack.addEventListener('click', goBack);
btnShowCard.addEventListener('click', enterQuickShow);
btnShowLast.addEventListener('click', showLastCard);
quickOverlay.addEventListener('click', exitQuickShow);
document.addEventListener('keydown', e => { if (e.key === 'Escape') exitQuickShow(); });

inputName.addEventListener('input', debouncedSave);
inputEmergency.addEventListener('input', debouncedSave);

// ===== INPUT NORMALIZATION =====

function normalize(str) {
  return str.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Simple plural stripping — only if stem exists in a known map
function depluralize(str) {
  if (str.length > 3 && str.endsWith('s')) {
    const stem = str.slice(0, -1);
    if (ALLERGEN_THAI[stem] || ALLERGEN_ALIASES[stem] || TRIGGER_THAI[stem]) return stem;
  }
  return str;
}

function resolveAllergenKey(rawName) {
  let key = normalize(rawName);
  key = depluralize(key);
  return ALLERGEN_ALIASES[key] || key;
}

function getThaiAllergen(rawName) {
  const key = resolveAllergenKey(rawName);
  return ALLERGEN_THAI[key] || rawName.trim();
}

function resolveThaiTrigger(rawTrigger) {
  const key = normalize(rawTrigger);
  if (TRIGGER_THAI[key]) return TRIGGER_THAI[key];
  const dep = depluralize(key);
  if (TRIGGER_THAI[dep]) return TRIGGER_THAI[dep];
  const nospace = key.replace(/\s/g, '');
  if (TRIGGER_THAI[nospace]) return TRIGGER_THAI[nospace];
  // Fallback: return as-is (display original text — never drop it)
  return rawTrigger.trim();
}

function getHiddenByAllergen(rawName) {
  const key = resolveAllergenKey(rawName);
  return HIDDEN_BY_ALLERGEN[key] || [];
}

function severityClass(sev) { return sev.toLowerCase(); }

// ===== TRIGGER PARSING =====
function parseTriggers(raw) {
  const seen = new Set();
  return raw
    .split(/[,\n\r]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .filter(t => {
      const key = normalize(t);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// ===== EMPTY STATE =====
function renderEmptyState() {
  if (!allergensList.querySelector('.allergy-entry')) {
    let empty = document.getElementById('allergens-empty');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'allergens-empty';
      empty.id = 'allergens-empty';
      empty.textContent = 'No allergies added yet. Tap "+ Add Allergy" to start.';
      allergensList.appendChild(empty);
    }
  }
}

function removeEmptyState() {
  const empty = document.getElementById('allergens-empty');
  if (empty) empty.remove();
}

// ===== ADD / REMOVE ALLERGY ENTRY =====
function addAllergyEntry(savedData) {
  removeEmptyState();

  const id    = ++entryCounter;
  const clone = template.content.cloneNode(true);
  const entry = clone.querySelector('.allergy-entry');

  entry.dataset.id = id;
  const num = allergensList.querySelectorAll('.allergy-entry').length + 1;
  entry.querySelector('.allergy-entry-num').textContent = `Allergy ${num}`;
  entry.querySelector('.btn-remove-allergy').addEventListener('click', () => removeEntry(id));

  const nameInput    = entry.querySelector('.allergen-name');
  const sevSelect    = entry.querySelector('.allergen-severity');
  const triggerInput = entry.querySelector('.allergen-triggers');

  nameInput.addEventListener('input', () => { updateGenerateBtn(); debouncedSave(); });
  sevSelect.addEventListener('change', debouncedSave);
  triggerInput.addEventListener('input', debouncedSave);

  if (savedData) {
    nameInput.value    = savedData.name || '';
    sevSelect.value    = savedData.severity || 'Anaphylactic';
    triggerInput.value = (savedData.triggers || []).join(', ');
  }

  allergensList.appendChild(entry);
  updateGenerateBtn();
}

function removeEntry(id) {
  const entry = allergensList.querySelector(`.allergy-entry[data-id="${id}"]`);
  if (entry) entry.remove();

  allergensList.querySelectorAll('.allergy-entry').forEach((node, i) => {
    node.querySelector('.allergy-entry-num').textContent = `Allergy ${i + 1}`;
  });

  if (!allergensList.querySelector('.allergy-entry')) renderEmptyState();
  updateGenerateBtn();
  debouncedSave();
}

// ===== VALIDATE =====
function updateGenerateBtn() {
  const hasValid = [...allergensList.querySelectorAll('.allergy-entry')].some(node =>
    node.querySelector('.allergen-name').value.trim().length > 0
  );
  btnGenerate.disabled = !hasValid;
}

// ===== COLLECT DATA =====
function collectData() {
  const name      = inputName.value.trim();
  const emergency = inputEmergency.value.trim();
  const allergens = [];

  allergensList.querySelectorAll('.allergy-entry').forEach(node => {
    const allergenName = node.querySelector('.allergen-name').value.trim();
    if (!allergenName) return;
    allergens.push({
      name:     allergenName,
      severity: node.querySelector('.allergen-severity').value,
      triggers: parseTriggers(node.querySelector('.allergen-triggers').value),
    });
  });

  return { name, emergency, allergens };
}

// ===== LOCALSTORAGE =====
function debouncedSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProfile, 300);
}

function saveProfile() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(collectData())); } catch (_) {}
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data) return;

    if (data.name)      inputName.value      = data.name;
    if (data.emergency) inputEmergency.value = data.emergency;

    if (Array.isArray(data.allergens) && data.allergens.length > 0) {
      removeEmptyState();
      data.allergens.forEach(a => addAllergyEntry(a));
      // Show the "Show Last Card" shortcut since we have a saved profile
      if (btnShowLast) btnShowLast.style.display = 'block';
    }
  } catch (_) {}
}

// ===== SHOW LAST CARD (one-tap shortcut from Screen 1) =====
function showLastCard() {
  const data = collectData();
  if (data.allergens.length === 0) return;
  renderCard(data);
  // Go straight to Quick Show without switching screens
  enterQuickShow();
}

// ===== GENERATE CARD =====
function generateCard() {
  const data = collectData();
  if (data.allergens.length === 0) return;

  saveProfile();
  renderCard(data);

  screenProfile.classList.remove('active');
  screenCard.classList.add('active');
  window.scrollTo(0, 0);
}

function goBack() {
  exitQuickShow();
  screenCard.classList.remove('active');
  screenProfile.classList.add('active');
  window.scrollTo(0, 0);
}

// ===== QUICK SHOW MODE =====
function enterQuickShow() {
  isQuickShow = true;
  quickOverlay.innerHTML = '';
  quickOverlay.appendChild(cardEl.cloneNode(true));
  quickOverlay.classList.add('active');

  try {
    const root = document.documentElement;
    if (root.requestFullscreen)            root.requestFullscreen();
    else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
  } catch (_) {}
}

function exitQuickShow() {
  if (!isQuickShow) return;
  isQuickShow = false;
  quickOverlay.classList.remove('active');
  quickOverlay.innerHTML = '';

  try {
    if (document.exitFullscreen && document.fullscreenElement)
      document.exitFullscreen();
    else if (document.webkitExitFullscreen && document.webkitFullscreenElement)
      document.webkitExitFullscreen();
  } catch (_) {}
}

// ===== ALLERGEN EMOJI MAP =====
const ALLERGEN_EMOJI = {
  'shellfish': '🦐',
  'nuts':      '🌰',
  'gluten':    '🌾',
  'peanuts':   '🥜',
  'dairy':     '🥛',
  'eggs':      '🥚',
  'soy':       '🫘',
  'wheat':     '🌾',
};

function getAllergenEmoji(rawName) {
  const key = resolveAllergenKey(rawName);
  return ALLERGEN_EMOJI[key] || '⚠️';
}

// ===== RENDER CARD — WALLET PASS LAYOUT =====
function renderCard(data) {
  cardEl.innerHTML = '';

  // ── FRONT FACE ──────────────────────────────────────────────
  const front = el('div', 'card-face card-front');

  // Red header bar
  const header = el('div', 'wp-header');
  const headerLeft = el('div', 'wp-header-left');
  headerLeft.appendChild(el('span', 'wp-warning-icon', '⚠'));
  const headerText = el('div', 'wp-header-text');
  headerText.appendChild(el('div', 'wp-header-en', 'SEVERE FOOD ALLERGY'));
  headerText.appendChild(el('div', 'wp-header-thai', 'ฉันแพ้อาหารรุนแรง'));
  headerLeft.appendChild(headerText);
  header.appendChild(headerLeft);
  if (data.name) {
    header.appendChild(el('div', 'wp-name-tag', escHtml(data.name)));
  }
  front.appendChild(header);

  // NO: allergen grid
  const noSection = el('div', 'wp-no-section');
  const noLabel = el('div', 'wp-no-label');
  noLabel.appendChild(el('span', 'wp-no-badge', 'NO'));
  noLabel.appendChild(el('span', 'wp-no-label-thai', 'ห้ามมี'));
  noSection.appendChild(noLabel);

  const grid = el('div', 'wp-allergen-grid');
  data.allergens.forEach(a => {
    const row = el('div', 'wp-allergen-row');
    const sevKey = severityClass(a.severity);
    row.classList.add(`sev-${sevKey}`);
    row.appendChild(el('span', 'wp-allergen-emoji', getAllergenEmoji(a.name)));
    const names = el('div', 'wp-allergen-names');
    names.appendChild(el('div', 'wp-allergen-thai', getThaiAllergen(a.name)));
    names.appendChild(el('div', 'wp-allergen-en', a.name));
    row.appendChild(names);
    const badge = el('span', `wp-sev-dot sev-dot-${sevKey}`);
    badge.title = a.severity;
    row.appendChild(badge);
    grid.appendChild(row);
  });
  noSection.appendChild(grid);
  front.appendChild(noSection);

  // Copy line: plain text list for chef
  const copyLine = el('div', 'wp-copy-line');
  const allergenNames = data.allergens.map(a => a.name).join(', ');
  copyLine.innerHTML = `<span class="wp-copy-no">NO:</span> ${escHtml(allergenNames)}`;
  front.appendChild(copyLine);

  // Compressed hidden warning
  const warningBar = el('div', 'wp-warning-bar');
  warningBar.appendChild(el('span', 'wp-warning-icon-sm', '⚠'));
  warningBar.appendChild(el('span', 'wp-warning-text', 'Also hidden in: sauces, oils, pastes, fish sauce (น้ำปลา), shrimp paste (กะปิ)'));
  front.appendChild(warningBar);

  // Instruction footer
  const footer = el('div', 'wp-front-footer');
  footer.appendChild(el('div', 'wp-instruct-thai', 'กรุณาแจ้งพ่อครัว'));
  footer.appendChild(el('div', 'wp-instruct-en', 'Please inform the chef before preparing'));
  front.appendChild(footer);

  cardEl.appendChild(front);

  // ── DIVIDER ──────────────────────────────────────────────────
  const divider = el('div', 'wp-divider');
  divider.appendChild(el('span', 'wp-divider-label', 'ADDITIONAL DETAILS'));
  cardEl.appendChild(divider);

  // ── BACK FACE ────────────────────────────────────────────────
  const back = el('div', 'card-face card-back');

  // Per-allergen detail rows
  data.allergens.forEach(a => {
    const detail = el('div', 'wp-detail-block');
    const dtop = el('div', 'wp-detail-top');
    dtop.appendChild(el('span', 'wp-detail-emoji', getAllergenEmoji(a.name)));
    const dtitle = el('div', 'wp-detail-title');
    dtitle.appendChild(el('span', 'wp-detail-thai', getThaiAllergen(a.name)));
    dtitle.appendChild(el('span', 'wp-detail-en', a.name));
    dtop.appendChild(dtitle);
    const sevBadge = el('span', `wp-detail-sev sev-tag-${severityClass(a.severity)}`,
      (SEVERITY_THAI[a.severity] || a.severity) + ' · ' + a.severity);
    dtop.appendChild(sevBadge);
    detail.appendChild(dtop);

    if (a.triggers.length > 0) {
      const tlist = el('div', 'wp-trigger-list');
      a.triggers.forEach(t => {
        const chip = el('div', 'wp-trigger-chip');
        chip.appendChild(el('span', 'wp-trigger-thai', resolveThaiTrigger(t)));
        chip.appendChild(el('span', 'wp-trigger-en', t.trim()));
        tlist.appendChild(chip);
      });
      detail.appendChild(tlist);
    }

    // Hidden ingredients for this allergen
    const hidden = getHiddenByAllergen(a.name);
    if (hidden.length > 0) {
      const hrow = el('div', 'wp-hidden-row');
      hrow.appendChild(el('span', 'wp-hidden-label', 'Also in:'));
      const hchips = el('span', 'wp-hidden-chips',
        hidden.map(h => `${h.thai} (${h.en})`).join(' · '));
      hrow.appendChild(hchips);
      detail.appendChild(hrow);
    }

    back.appendChild(detail);
  });

  // Polite Thai note
  const polite = el('div', 'wp-polite');
  polite.appendChild(el('div', 'wp-polite-thai', 'ขอบคุณมากที่ช่วยดูแล'));
  polite.appendChild(el('div', 'wp-polite-en', 'Thank you for your care and attention'));
  back.appendChild(polite);

  // Emergency contact
  if (data.emergency) {
    const em = el('div', 'wp-emergency');
    em.appendChild(el('span', 'wp-em-icon', '🆘'));
    const emtext = el('div', '');
    emtext.appendChild(el('div', 'wp-em-thai', `ฉุกเฉิน: ${escHtml(data.emergency)}`));
    emtext.appendChild(el('div', 'wp-em-en', `Emergency: ${escHtml(data.emergency)}`));
    em.appendChild(emtext);
    back.appendChild(em);
  }

  cardEl.appendChild(back);
}

// ===== DOM UTILS =====
function el(tag, className, text) {
  const node = document.createElement(tag || 'div');
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
