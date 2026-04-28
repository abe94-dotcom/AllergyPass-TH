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
  'fish  sauce':   'น้ำปลา',
  'shrimp paste':  'กะปิ',
  'shrimpaste':    'กะปิ',
  'shrimp  paste': 'กะปิ',
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

// Always-show global warnings regardless of allergen type
const GLOBAL_ALWAYS = [
  { thai: 'น้ำปลา', en: 'fish sauce' },
  { thai: 'กะปิ', en: 'shrimp paste' },
  { thai: 'ซอส', en: 'sauces' },
];

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
    }
  } catch (_) {}
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

// ===== RENDER CARD =====
function renderCard(data) {
  cardEl.innerHTML = '';

  // TOP
  const top = el('div', 'card-top');
  top.appendChild(el('div', 'card-icon', '🚫'));
  top.appendChild(el('span', 'card-thai-primary', 'ฉันแพ้อาหาร'));
  top.appendChild(el('span', 'card-en-subtitle', 'Food Allergy Alert'));
  cardEl.appendChild(top);

  // NAME STRIP
  if (data.name) {
    const strip = el('div', 'card-name-strip');
    strip.innerHTML = `Card for: <strong>${escHtml(data.name)}</strong>`;
    cardEl.appendChild(strip);
  }

  // ALLERGEN SECTION
  const sec = el('div', 'card-allergens');
  const hdr = el('div', 'card-allergens-header');
  hdr.appendChild(el('span', 'card-allergens-header-thai', 'ห้ามมี:'));
  hdr.appendChild(el('span', 'card-allergens-header-en', 'Do not include:'));
  sec.appendChild(hdr);
  data.allergens.forEach(a => sec.appendChild(renderAllergenBlock(a)));
  cardEl.appendChild(sec);

  // ALLERGEN-SPECIFIC HIDDEN INGREDIENTS
  const specific = [];
  data.allergens.forEach(a => {
    getHiddenByAllergen(a.name).forEach(h => {
      if (!specific.some(x => x.thai === h.thai)) specific.push(h);
    });
  });

  if (specific.length > 0) {
    const hsec = el('div', 'card-hidden');
    const hhdr = el('div', 'card-hidden-header');
    hhdr.appendChild(el('span', '', 'รวมถึง:'));
    hhdr.appendChild(el('span', 'card-hidden-header-en', 'Also includes:'));
    hsec.appendChild(hhdr);
    const hlist = el('div', 'hidden-list');
    specific.forEach(h => {
      hlist.appendChild(el('div', 'hidden-item-thai', h.thai));
      hlist.appendChild(el('div', 'hidden-item-en', h.en));
    });
    hsec.appendChild(hlist);
    cardEl.appendChild(hsec);
  }

  // GLOBAL ALWAYS-SHOW
  const gsec  = el('div', 'card-global');
  const ghdr  = el('div', 'card-global-header');
  ghdr.appendChild(el('span', 'card-global-header-thai', 'อาจมีในอาหาร:'));
  ghdr.appendChild(el('span', 'card-global-header-en', 'May be present in:'));
  gsec.appendChild(ghdr);
  const glist = el('div', 'hidden-list');
  GLOBAL_ALWAYS.forEach(h => {
    glist.appendChild(el('div', 'hidden-item-thai', h.thai));
    glist.appendChild(el('div', 'hidden-item-en', h.en));
  });
  gsec.appendChild(glist);
  cardEl.appendChild(gsec);

  // BOTTOM
  const bottom = el('div', 'card-bottom');
  bottom.appendChild(el('div', 'card-confirm-thai', 'กรุณายืนยัน'));
  bottom.appendChild(el('div', 'card-confirm-en', 'Please confirm with kitchen before serving'));

  if (data.emergency) {
    const emRow = el('div', 'card-emergency');
    emRow.appendChild(el('div', 'card-emergency-thai', `ฉุกเฉิน: ${escHtml(data.emergency)}`));
    emRow.appendChild(el('div', 'card-emergency-en', `Emergency: ${escHtml(data.emergency)}`));
    bottom.appendChild(emRow);
  }

  cardEl.appendChild(bottom);
}

function renderAllergenBlock(allergen) {
  const block = el('div', 'allergen-block');
  block.appendChild(el('div', 'allergen-block-name-thai', getThaiAllergen(allergen.name)));
  block.appendChild(el('div', 'allergen-block-name-en', allergen.name));

  const sevBadge = el('div', `allergen-severity ${severityClass(allergen.severity)}`);
  sevBadge.appendChild(el('span', '', '⚠️'));
  sevBadge.appendChild(el('span', 'severity-thai', SEVERITY_THAI[allergen.severity] || allergen.severity));
  sevBadge.appendChild(el('span', 'severity-en', allergen.severity));
  block.appendChild(sevBadge);

  if (allergen.triggers.length > 0) {
    const tdiv = el('div', 'allergen-triggers');
    allergen.triggers.forEach(t => {
      const item    = el('div', 'trigger-item');
      const textDiv = el('div', '');
      textDiv.appendChild(el('div', 'trigger-thai', resolveThaiTrigger(t)));
      textDiv.appendChild(el('div', 'trigger-en', t.trim()));
      item.appendChild(el('span', 'trigger-bullet', '▸'));
      item.appendChild(textDiv);
      tdiv.appendChild(item);
    });
    block.appendChild(tdiv);
  }

  return block;
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
