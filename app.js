'use strict';

// ─────────────────────────────────────────────────────────────
// MODULE: MASTER ALLERGEN LIST
// Single source of truth. Keys are used everywhere — state,
// translations, card rendering. No user text ever reaches the
// rendering pipeline.
// ─────────────────────────────────────────────────────────────
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

// Trigger suggestions per allergen key (shown as datalist hints)
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

// ─────────────────────────────────────────────────────────────
// MODULE: COUNTRY REGISTRY
// ─────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'th', flag: '🇹🇭', name: 'Thailand',   langs: ['th'] },
  { code: 'jp', flag: '🇯🇵', name: 'Japan',      langs: ['ja'] },
  { code: 'vn', flag: '🇻🇳', name: 'Vietnam',    langs: ['vi'] },
  { code: 'kr', flag: '🇰🇷', name: 'Korea',      langs: ['ko'] },
  { code: 'cn', flag: '🇨🇳', name: 'China',      langs: ['zh'] },
  { code: 'tw', flag: '🇹🇼', name: 'Taiwan',     langs: ['zh'] },
  { code: 'hk', flag: '🇭🇰', name: 'Hong Kong',  langs: ['zh'] },
  { code: 'sg', flag: '🇸🇬', name: 'Singapore',  langs: ['en','zh','ms','ta'], multi: true },
  { code: 'id', flag: '🇮🇩', name: 'Indonesia',  langs: ['id'] },
  { code: 'bn', flag: '🇧🇳', name: 'Brunei',     langs: ['ms'] },
  { code: 'kh', flag: '🇰🇭', name: 'Cambodia',   langs: ['km'] },
  { code: 'la', flag: '🇱🇦', name: 'Laos',       langs: ['lo'] },
  { code: 'mm', flag: '🇲🇲', name: 'Myanmar',    langs: ['my'] },
  { code: 'lk', flag: '🇱🇰', name: 'Sri Lanka',  langs: ['si','ta'], multi: true },
];

// ─────────────────────────────────────────────────────────────
// MODULE: TRANSLATION BUNDLES (inline, offline-first)
// Keys must match ALLERGENS[].key exactly.
// ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  th: {
    card: {
      severe:        '⚠️ แพ้อาหารรุนแรงมาก — อาจเสียชีวิตได้',
      moderate:      'แพ้อาหาร — อาจทำให้ไม่สบาย',
      cross_contact: 'กรุณาระวังการปนเปื้อนจากอุปกรณ์ทำอาหาร',
      instruction:   'กรุณาแจ้งพ่อครัวก่อนปรุงอาหาร',
    },
    allergens: {
      peanuts:   'ถั่วลิสง',
      tree_nuts: 'ถั่วเปลือกแข็ง',
      shellfish: 'อาหารทะเล (กุ้ง / ปู)',
      fish:      'ปลา',
      dairy:     'นม / ผลิตภัณฑ์นม',
      eggs:      'ไข่',
      soy:       'ถั่วเหลือง',
      wheat:     'แป้งสาลี',
      gluten:    'กลูเตน',
      sesame:    'งา',
    },
    triggers: {
      'peanut oil': 'น้ำมันถั่วลิสง', 'peanut sauce': 'ซอสถั่ว', 'satay sauce': 'ซาเต้',
      cashew: 'มะม่วงหิมพานต์', walnut: 'วอลนัท', almond: 'อัลมอนด์',
      shrimp: 'กุ้ง', prawn: 'กุ้ง', crab: 'ปู', lobster: 'ล็อบสเตอร์',
      'oyster sauce': 'ซอสหอยนางรม', 'shrimp paste': 'กะปิ', 'fish sauce': 'น้ำปลา',
      'soy sauce': 'ซีอิ๊ว', tofu: 'เต้าหู้', miso: 'มิโซะ',
      milk: 'นม', butter: 'เนย', cream: 'ครีม', cheese: 'ชีส',
      flour: 'แป้ง', 'sesame oil': 'น้ำมันงา', tahini: 'ทาฮินี',
    },
    hidden: {
      shellfish: [{ local: 'กะปิ', en: 'shrimp paste' }, { local: 'น้ำปลา', en: 'fish sauce' }, { local: 'ซอสหอยนางรม', en: 'oyster sauce' }],
      peanuts:   [{ local: 'น้ำมันถั่วลิสง', en: 'peanut oil' }, { local: 'ซาเต้', en: 'satay sauce' }],
      soy:       [{ local: 'ซีอิ๊ว', en: 'soy sauce' }, { local: 'เต้าหู้', en: 'tofu' }],
      gluten:    [{ local: 'ซีอิ๊ว', en: 'soy sauce' }, { local: 'แป้ง', en: 'wheat flour' }],
    },
  },

  ja: {
    card: {
      severe:        '⚠️ 重篤なアレルギーがあります — 命に関わります',
      moderate:      '食物アレルギーがあります — 体調不良を引き起こします',
      cross_contact: '調理器具・調理台の交差汚染にご注意ください',
      instruction:   '調理前にシェフへお知らせください',
    },
    allergens: {
      peanuts:   '落花生（ピーナッツ）',
      tree_nuts: '木の実類（ナッツ）',
      shellfish: '甲殻類（えび・かに）',
      fish:      '魚介類',
      dairy:     '乳製品',
      eggs:      '卵',
      soy:       '大豆',
      wheat:     '小麦',
      gluten:    'グルテン',
      sesame:    'ごま',
    },
    triggers: {
      'peanut oil': '落花生油', 'satay sauce': 'サテーソース',
      cashew: 'カシューナッツ', walnut: 'くるみ', almond: 'アーモンド',
      shrimp: 'えび', crab: 'かに', lobster: 'ロブスター',
      'fish sauce': 'ナンプラー', 'shrimp paste': 'えびペースト',
      'soy sauce': 'しょうゆ', tofu: '豆腐', miso: 'みそ', edamame: 'えだまめ',
      milk: '牛乳', butter: 'バター', cream: 'クリーム',
      flour: '小麦粉', 'sesame oil': 'ごま油', tahini: 'タヒニ',
    },
    hidden: {
      shellfish: [{ local: 'だし', en: 'dashi broth' }, { local: 'えびせんべい', en: 'shrimp crackers' }],
      peanuts:   [{ local: '落花生油', en: 'peanut oil' }],
      soy:       [{ local: 'しょうゆ', en: 'soy sauce' }, { local: 'みそ', en: 'miso' }, { local: '豆腐', en: 'tofu' }],
      gluten:    [{ local: 'しょうゆ', en: 'soy sauce' }, { local: '天ぷら衣', en: 'tempura batter' }],
    },
  },

  vi: {
    card: {
      severe:        '⚠️ Tôi bị dị ứng thực phẩm nghiêm trọng — có thể nguy hiểm đến tính mạng',
      moderate:      'Tôi bị dị ứng thực phẩm — có thể gây khó chịu',
      cross_contact: 'Vui lòng tránh nhiễm chéo từ dụng cụ nấu ăn',
      instruction:   'Xin thông báo cho đầu bếp trước khi chế biến',
    },
    allergens: {
      peanuts:   'Lạc (đậu phộng)',
      tree_nuts: 'Các loại hạt cây',
      shellfish: 'Hải sản (tôm, cua)',
      fish:      'Cá',
      dairy:     'Sữa và sản phẩm từ sữa',
      eggs:      'Trứng',
      soy:       'Đậu nành',
      wheat:     'Lúa mì',
      gluten:    'Gluten',
      sesame:    'Mè (vừng)',
    },
    triggers: {
      'peanut oil': 'dầu lạc', 'peanut sauce': 'tương lạc',
      cashew: 'hạt điều', shrimp: 'tôm', prawn: 'tôm', crab: 'cua',
      'fish sauce': 'nước mắm', 'shrimp paste': 'mắm tôm',
      'soy sauce': 'nước tương', tofu: 'đậu phụ', miso: 'tương miso',
      milk: 'sữa', butter: 'bơ', flour: 'bột mì', 'sesame oil': 'dầu mè',
    },
    hidden: {
      shellfish: [{ local: 'nước mắm', en: 'fish sauce' }, { local: 'mắm tôm', en: 'shrimp paste' }],
      peanuts:   [{ local: 'dầu lạc', en: 'peanut oil' }, { local: 'tương lạc', en: 'peanut sauce' }],
      gluten:    [{ local: 'nước tương', en: 'soy sauce' }, { local: 'bột mì', en: 'wheat flour' }],
    },
  },

  ko: {
    card: {
      severe:        '⚠️ 심각한 식품 알레르기가 있습니다 — 생명이 위험할 수 있습니다',
      moderate:      '식품 알레르기가 있습니다 — 불쾌감을 유발할 수 있습니다',
      cross_contact: '조리 기구의 교차 오염을 주의해 주세요',
      instruction:   '조리 전에 반드시 주방에 알려주세요',
    },
    allergens: {
      peanuts:   '땅콩',
      tree_nuts: '견과류',
      shellfish: '갑각류 (새우, 게)',
      fish:      '생선',
      dairy:     '유제품',
      eggs:      '계란',
      soy:       '대두 (콩)',
      wheat:     '밀',
      gluten:    '글루텐',
      sesame:    '참깨',
    },
    triggers: {
      'peanut oil': '땅콩 기름', cashew: '캐슈넛',
      shrimp: '새우', crab: '게', 'fish sauce': '액젓',
      'soy sauce': '간장', tofu: '두부', miso: '된장',
      milk: '우유', butter: '버터', flour: '밀가루', 'sesame oil': '참기름',
    },
    hidden: {
      shellfish: [{ local: '액젓', en: 'fish sauce' }, { local: '새우젓', en: 'fermented shrimp' }],
      peanuts:   [{ local: '땅콩 기름', en: 'peanut oil' }],
      soy:       [{ local: '간장', en: 'soy sauce' }, { local: '된장', en: 'doenjang' }, { local: '고추장', en: 'gochujang' }],
    },
  },

  zh: {
    card: {
      severe:        '⚠️ 我有严重食物过敏 — 可能危及生命',
      moderate:      '我有食物过敏 — 可能引起不适',
      cross_contact: '请避免炊具和砧板的交叉污染',
      instruction:   '烹饪前请告知厨师',
    },
    allergens: {
      peanuts:   '花生',
      tree_nuts: '坚果',
      shellfish: '甲壳类 (虾/蟹)',
      fish:      '鱼类',
      dairy:     '乳制品',
      eggs:      '鸡蛋',
      soy:       '大豆',
      wheat:     '小麦',
      gluten:    '麸质',
      sesame:    '芝麻',
    },
    triggers: {
      'peanut oil': '花生油', cashew: '腰果',
      shrimp: '虾', crab: '蟹', 'oyster sauce': '蚝油',
      'soy sauce': '酱油', tofu: '豆腐', miso: '味噌',
      milk: '牛奶', butter: '黄油', flour: '面粉', 'sesame oil': '芝麻油',
    },
    hidden: {
      shellfish: [{ local: '蚝油', en: 'oyster sauce' }, { local: '虾酱', en: 'shrimp paste' }],
      peanuts:   [{ local: '花生油', en: 'peanut oil' }],
      soy:       [{ local: '酱油', en: 'soy sauce' }, { local: '豆腐', en: 'tofu' }],
    },
  },

  id: {
    card: {
      severe:        '⚠️ Saya alergi makanan parah — bisa mengancam jiwa',
      moderate:      'Saya alergi makanan — dapat menyebabkan ketidaknyamanan',
      cross_contact: 'Mohon hindari kontaminasi silang dari peralatan masak',
      instruction:   'Harap beritahu koki sebelum memasak',
    },
    allergens: {
      peanuts:   'Kacang tanah',
      tree_nuts: 'Kacang pohon',
      shellfish: 'Makanan laut berkulit (udang, kepiting)',
      fish:      'Ikan',
      dairy:     'Produk susu',
      eggs:      'Telur',
      soy:       'Kedelai',
      wheat:     'Gandum',
      gluten:    'Gluten',
      sesame:    'Wijen',
    },
    triggers: {
      shrimp: 'udang', crab: 'kepiting', 'fish sauce': 'kecap ikan',
      'soy sauce': 'kecap asin', tofu: 'tahu', tempeh: 'tempe',
      milk: 'susu', butter: 'mentega', flour: 'tepung terigu',
      'sesame oil': 'minyak wijen',
    },
    hidden: {
      shellfish: [{ local: 'terasi', en: 'shrimp paste' }, { local: 'kecap ikan', en: 'fish sauce' }],
      soy:       [{ local: 'kecap asin', en: 'soy sauce' }, { local: 'tahu', en: 'tofu' }, { local: 'tempe', en: 'tempeh' }],
    },
  },

  ms: {
    card: {
      severe:        '⚠️ Saya ada alahan makanan yang teruk — boleh mengancam nyawa',
      moderate:      'Saya ada alahan makanan — boleh menyebabkan ketidakselesaan',
      cross_contact: 'Sila elakkan pencemaran silang dari peralatan memasak',
      instruction:   'Sila maklumkan kepada tukang masak sebelum memasak',
    },
    allergens: {
      peanuts:   'Kacang tanah',
      tree_nuts: 'Kacang pokok',
      shellfish: 'Makanan laut berkulit keras (udang, ketam)',
      fish:      'Ikan',
      dairy:     'Produk tenusu',
      eggs:      'Telur',
      soy:       'Kacang soya',
      wheat:     'Gandum',
      gluten:    'Gluten',
      sesame:    'Bijan',
    },
    triggers: {
      shrimp: 'udang', crab: 'ketam', 'fish sauce': 'sos ikan',
      'soy sauce': 'kicap', tofu: 'tauhu', milk: 'susu',
      butter: 'mentega', flour: 'tepung gandum', 'sesame oil': 'minyak bijan',
    },
    hidden: {
      shellfish: [{ local: 'belacan', en: 'shrimp paste' }, { local: 'sos ikan', en: 'fish sauce' }],
      soy:       [{ local: 'kicap', en: 'soy sauce' }, { local: 'tauhu', en: 'tofu' }],
    },
  },

  // Singapore multi-language bundle
  sg: {
    multi: true,
    languages: ['en', 'zh', 'ms', 'ta'],
    card: {
      severe: {
        en: '⚠️ I have a SEVERE food allergy — life-threatening',
        zh: '⚠️ 我有严重食物过敏 — 可能危及生命',
        ms: '⚠️ Saya ada ALAHAN makanan TERUK — boleh mengancam nyawa',
        ta: '⚠️ எனக்கு தீவிர உணவு ஒவ்வாமை — உயிருக்கு ஆபத்தானது',
      },
      moderate: {
        en: 'I have a food allergy — causes discomfort',
        zh: '我有食物过敏 — 可能引起不适',
        ms: 'Saya ada alahan makanan — boleh menyebabkan ketidakselesaan',
        ta: 'எனக்கு உணவு ஒவ்வாமை உள்ளது',
      },
      cross_contact: {
        en: 'Please avoid cross-contamination from cooking utensils',
        zh: '请避免炊具的交叉污染',
        ms: 'Sila elakkan pencemaran silang dari peralatan memasak',
        ta: 'சமையல் பாத்திரங்களில் இருந்து குறுக்கு மாசுபாட்டை தவிர்க்கவும்',
      },
      instruction: {
        en: 'Please inform the chef before cooking',
        zh: '烹饪前请告知厨师',
        ms: 'Sila maklumkan kepada tukang masak',
        ta: 'சமைக்கும் முன் சமையல்காரருக்கு தெரிவிக்கவும்',
      },
    },
    allergens: {
      peanuts:   { en: 'Peanuts',    zh: '花生',    ms: 'Kacang tanah',            ta: 'வேர்க்கடலை' },
      tree_nuts: { en: 'Tree Nuts',  zh: '坚果',    ms: 'Kacang pokok',            ta: 'மர கொட்டைகள்' },
      shellfish: { en: 'Shellfish',  zh: '甲壳类',  ms: 'Makanan laut berkulit',   ta: 'கடல் உணவு' },
      fish:      { en: 'Fish',       zh: '鱼类',    ms: 'Ikan',                    ta: 'மீன்' },
      dairy:     { en: 'Dairy',      zh: '乳制品',  ms: 'Produk tenusu',           ta: 'பால் பொருட்கள்' },
      eggs:      { en: 'Eggs',       zh: '鸡蛋',    ms: 'Telur',                   ta: 'முட்டை' },
      soy:       { en: 'Soy',        zh: '大豆',    ms: 'Kacang soya',             ta: 'சோயா' },
      wheat:     { en: 'Wheat',      zh: '小麦',    ms: 'Gandum',                  ta: 'கோதுமை' },
      gluten:    { en: 'Gluten',     zh: '麸质',    ms: 'Gluten',                  ta: 'குளுட்டன்' },
      sesame:    { en: 'Sesame',     zh: '芝麻',    ms: 'Bijan',                   ta: 'எள்' },
    },
  },
};

// Fallback for countries without their own bundle yet
const TRANSLATION_FALLBACKS = { km: 'th', lo: 'th', my: 'ms', si: 'ms', 'zh-TW': 'zh', 'zh-HK': 'zh' };

function getBundle(langCode) {
  if (TRANSLATIONS[langCode]) return TRANSLATIONS[langCode];
  const fb = TRANSLATION_FALLBACKS[langCode];
  return fb ? TRANSLATIONS[fb] : null;
}

// ─────────────────────────────────────────────────────────────
// MODULE: APP STATE
// Single mutable state object. All UI reads from here.
// ─────────────────────────────────────────────────────────────
const State = {
  country: null,           // country code string
  mode: 'single',          // 'single' | 'trip' (trip = PRO, locked)
  tripCountries: [],       // array of country codes (trip mode)
  allergens: [],           // [{ key, severity, triggers[] }]
  name: '',
  emergency: '',
  tripIndex: 0,            // active card index in trip pack

  // Allergen helpers
  hasAllergen(key) { return this.allergens.some(a => a.key === key); },
  addAllergen(key) {
    if (this.hasAllergen(key)) return;
    this.allergens.push({ key, severity: 'anaphylactic', triggers: [] });
    this.save();
    // Picker chip already toggled visually by click handler — only update list + btn
    renderSelectedAllergens();
    updateGenerateBtn();
  },
  removeAllergen(key) {
    this.allergens = this.allergens.filter(a => a.key !== key);
    this.save();
    syncPickerState();
    renderSelectedAllergens();
    updateGenerateBtn();
  },
  setSeverity(key, sev) {
    const a = this.allergens.find(a => a.key === key);
    if (a) { a.severity = sev; this.save(); }
  },
  setTriggers(key, triggers) {
    const a = this.allergens.find(a => a.key === key);
    if (a) { a.triggers = triggers; this.save(); }
  },

  // Sync all reactive UI after state change (picker uses in-place update, no rebuild)
  sync() {
    syncPickerState();
    renderSelectedAllergens();
    updateGenerateBtn();
  },

  // Persistence
  save() {
    try {
      localStorage.setItem('allergycard_v4', JSON.stringify({
        country: this.country,
        mode: this.mode,
        allergens: this.allergens,
        name: this.name,
        emergency: this.emergency,
      }));
    } catch (_) {}
  },
  load() {
    try {
      const raw = localStorage.getItem('allergycard_v4');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.country)   this.setCountry(d.country, true);
      if (d.allergens) this.allergens = d.allergens.filter(a => ALLERGENS.find(x => x.key === a.key));
      if (d.name)      this.name = d.name;
      if (d.emergency) this.emergency = d.emergency;
    } catch (_) {}
  },

  setCountry(code, silent) {
    this.country = code;
    // Update flag UI
    document.querySelectorAll('.flag-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.code === code);
    });
    const label = document.getElementById('selected-country-label');
    if (label) {
      const c = COUNTRIES.find(x => x.code === code);
      label.textContent = c ? `${c.flag} ${c.name}` : '';
    }
    if (!silent) { this.save(); updateGenerateBtn(); }
  },
};

// ─────────────────────────────────────────────────────────────
// MODULE: ALLERGEN CHIP PICKER
// Shows all ALLERGENS as tappable chips. Selected state driven
// entirely by State.allergens[]. No text input involved.
// ─────────────────────────────────────────────────────────────
function buildAllergenPicker() {
  const grid = document.getElementById('allergen-picker-grid');
  if (!grid || grid.dataset.built) return; // build once only
  grid.dataset.built = '1';
  grid.innerHTML = '';

  ALLERGENS.forEach(a => {
    const chip = document.createElement('button');
    chip.className = 'picker-chip';
    chip.setAttribute('aria-pressed', 'false');
    chip.setAttribute('aria-label', a.label);
    chip.dataset.key = a.key;
    chip.innerHTML = `<span class="chip-emoji">${a.emoji}</span><span class="chip-label">${a.label}</span>`;
    chip.addEventListener('click', () => {
      // Toggle immediately in DOM for instant feedback, then update state
      const nowSelected = chip.classList.contains('selected');
      if (nowSelected) {
        chip.classList.remove('selected');
        chip.setAttribute('aria-pressed', 'false');
        State.removeAllergen(a.key);
      } else {
        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');
        State.addAllergen(a.key);
      }
    });
    grid.appendChild(chip);
  });
}

// Sync picker visual state without rebuilding DOM
function syncPickerState() {
  const grid = document.getElementById('allergen-picker-grid');
  if (!grid) return;
  grid.querySelectorAll('.picker-chip').forEach(chip => {
    const sel = State.hasAllergen(chip.dataset.key);
    chip.classList.toggle('selected', sel);
    chip.setAttribute('aria-pressed', String(sel));
  });
}

function renderAllergenPicker() {
  buildAllergenPicker(); // no-op after first call
  syncPickerState();     // only updates classes
}

// ─────────────────────────────────────────────────────────────
// MODULE: SELECTED ALLERGEN CARDS
// Each selected allergen gets a card with:
//   - Emoji + name
//   - Severity toggle (3 levels)
//   - Optional trigger input
//   - Remove button
// ─────────────────────────────────────────────────────────────
const SEV_LEVELS = [
  { value: 'anaphylactic', label: 'Anaphylactic', short: 'Ana' },
  { value: 'severe',       label: 'Severe',       short: 'Sev' },
  { value: 'intolerance',  label: 'Intolerance',  short: 'Int' },
];

function renderSelectedAllergens() {
  const container = document.getElementById('selected-allergens');
  if (!container) return;

  // Empty state
  const emptyEl = document.getElementById('selected-empty');
  if (State.allergens.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  container.innerHTML = '';

  State.allergens.forEach(entry => {
    const def = ALLERGENS.find(a => a.key === entry.key);
    if (!def) return;

    const card = document.createElement('div');
    card.className = `selected-allergen sev-bg-${entry.severity}`;
    card.dataset.key = entry.key;

    // Header row: emoji + name + remove
    const hdr = document.createElement('div');
    hdr.className = 'sa-header';
    hdr.innerHTML = `
      <span class="sa-emoji">${def.emoji}</span>
      <span class="sa-name">${def.label}</span>
      <button class="sa-remove" aria-label="Remove ${def.label}">✕</button>`;
    hdr.querySelector('.sa-remove').addEventListener('click', () => State.removeAllergen(entry.key));

    // Severity toggle
    const sevRow = document.createElement('div');
    sevRow.className = 'sa-sev-row';
    SEV_LEVELS.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'sev-btn' + (entry.severity === s.value ? ' active sev-active-' + s.value : '');
      btn.textContent = s.label;
      btn.setAttribute('aria-pressed', String(entry.severity === s.value));
      btn.addEventListener('click', () => {
        State.setSeverity(entry.key, s.value);
        renderSelectedAllergens(); // re-render for color update
      });
      sevRow.appendChild(btn);
    });

    // Trigger input
    const trigRow = document.createElement('div');
    trigRow.className = 'sa-trigger-row';
    const hints = TRIGGER_HINTS[entry.key] || [];
    const listId = `trig-hints-${entry.key}`;

    const trigLabel = document.createElement('label');
    trigLabel.className = 'sa-trig-label';
    trigLabel.setAttribute('for', `trig-${entry.key}`);
    trigLabel.textContent = 'Specific triggers';

    const trigSpan = document.createElement('span');
    trigSpan.className = 'sa-trig-hint';
    trigSpan.textContent = '(comma-separated, optional)';
    trigLabel.appendChild(trigSpan);

    const trigInput = document.createElement('input');
    trigInput.type = 'text';
    trigInput.id = `trig-${entry.key}`;
    trigInput.className = 'field-input sa-trig-input';
    trigInput.placeholder = hints.slice(0, 3).join(', ');
    trigInput.value = entry.triggers.join(', ');
    trigInput.setAttribute('list', listId);
    trigInput.autocomplete = 'off';

    const datalist = document.createElement('datalist');
    datalist.id = listId;
    hints.forEach(h => { const o = document.createElement('option'); o.value = h; datalist.appendChild(o); });

    trigInput.addEventListener('change', () => {
      const triggers = trigInput.value.split(',').map(t => t.trim()).filter(Boolean);
      State.setTriggers(entry.key, triggers);
    });

    trigRow.appendChild(trigLabel);
    trigRow.appendChild(trigInput);
    trigRow.appendChild(datalist);

    card.appendChild(hdr);
    card.appendChild(sevRow);
    card.appendChild(trigRow);
    container.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────
// MODULE: FLAG SELECTOR
// ─────────────────────────────────────────────────────────────
function buildFlagSelector() {
  const grid = document.getElementById('flag-selector');
  if (!grid) return;
  COUNTRIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'flag-btn';
    btn.dataset.code = c.code;
    btn.setAttribute('aria-label', c.name);
    btn.innerHTML = `<span class="flag-emoji">${c.flag}</span><span class="flag-name">${c.name}</span>`;
    btn.addEventListener('click', () => State.setCountry(c.code));
    grid.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────
// MODULE: GENERATE BUTTON GATE
// Enabled only when: country selected + ≥1 allergen selected.
// ─────────────────────────────────────────────────────────────
function updateGenerateBtn() {
  const btn = document.getElementById('btn-generate');
  if (!btn) return;
  const ok = !!State.country && State.allergens.length > 0;
  btn.disabled = !ok;
}

// ─────────────────────────────────────────────────────────────
// MODULE: CARD RENDERER
// Reads only from State + TRANSLATIONS[langCode].allergens[key].
// User text never reaches this function except triggers (display only).
// ─────────────────────────────────────────────────────────────
function el(tag, cls, text) {
  const n = document.createElement(tag || 'div');
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function highestSeverity(allergens) {
  if (allergens.some(a => a.severity === 'anaphylactic')) return 'anaphylactic';
  if (allergens.some(a => a.severity === 'severe'))       return 'severe';
  return 'intolerance';
}

function isSerious(sev) { return sev === 'anaphylactic' || sev === 'severe'; }

// Resolve allergen display name from bundle
function resolveAllergenName(bundle, key) {
  if (!bundle || !bundle.allergens) return key;
  const entry = bundle.allergens[key];
  if (!entry) return key;
  // Multi-language (Singapore): entry is { en, zh, ms, ta }
  if (typeof entry === 'object') {
    return Object.values(entry).filter(Boolean).join(' / ');
  }
  return entry;
}

// Resolve a single trigger string through the bundle's trigger map
function resolveTrigger(bundle, raw) {
  if (!bundle || !bundle.triggers) return raw;
  const key = raw.trim().toLowerCase();
  return bundle.triggers[key] || raw.trim();
}

// Build the card DOM for one country
function buildCardForCountry(countryCode, profile) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return null;

  const isSg = countryCode === 'sg' || (country.multi && country.langs.length > 1);
  const worstSev = highestSeverity(profile.allergens);
  const serious  = isSerious(worstSev);

  // For multi-language we use the sg bundle; for single-lang we pick the first lang
  const primaryLang  = isSg ? 'sg' : country.langs[0];
  const bundle       = getBundle(primaryLang);

  const card = el('div', 'allergy-card');

  // ── HEADER ────────────────────────────────────────────────
  const hdr = el('div', 'wp-header');
  const hdrLeft = el('div', 'wp-header-left');
  hdrLeft.appendChild(el('span', 'wp-warning-icon', '⚠'));

  const hdrText = el('div', 'wp-header-text');
  if (bundle) {
    let headerMsg;
    if (isSg) {
      const msgObj = serious ? bundle.card.severe : bundle.card.moderate;
      headerMsg = Object.values(msgObj).join('\n');
    } else {
      headerMsg = serious ? bundle.card.severe : bundle.card.moderate;
    }
    const localDiv = el('div', 'wp-header-local');
    localDiv.textContent = headerMsg;
    hdrText.appendChild(localDiv);
  }
  hdrText.appendChild(el('div', 'wp-header-en', serious ? 'SEVERE FOOD ALLERGY — LIFE-THREATENING' : 'FOOD ALLERGY / INTOLERANCE'));
  hdrLeft.appendChild(hdrText);
  hdr.appendChild(hdrLeft);
  if (profile.name) hdr.appendChild(el('div', 'wp-name-tag', profile.name));
  card.appendChild(hdr);

  // ── COUNTRY BADGE ─────────────────────────────────────────
  const badge = el('div', 'wp-country-badge');
  badge.appendChild(el('span', 'wp-country-flag', country.flag));
  badge.appendChild(el('span', 'wp-country-name', country.name));
  card.appendChild(badge);

  // ── NO SECTION ────────────────────────────────────────────
  const noLabel = el('div', 'wp-no-label');
  noLabel.appendChild(el('span', 'wp-no-badge', 'NO'));
  card.appendChild(noLabel);

  const grid = el('div', 'wp-allergen-grid');
  profile.allergens.forEach(a => {
    const def = ALLERGENS.find(x => x.key === a.key);
    if (!def) return;

    const row = el('div', `wp-allergen-row sev-${a.severity}`);
    row.appendChild(el('span', 'wp-allergen-emoji', def.emoji));

    const names = el('div', 'wp-allergen-names');

    if (isSg && bundle) {
      // Render language chips for Singapore
      const chipsDiv = el('div', 'sg-chips');
      const allergenObj = bundle.allergens[a.key] || {};
      country.langs.forEach(l => {
        if (!allergenObj[l]) return;
        const chip = el('div', 'sg-chip');
        chip.appendChild(el('span', 'sg-chip-lang', l.toUpperCase()));
        chip.appendChild(el('span', 'sg-chip-text', allergenObj[l]));
        chipsDiv.appendChild(chip);
      });
      names.appendChild(chipsDiv);
    } else {
      names.appendChild(el('div', 'wp-allergen-local', resolveAllergenName(bundle, a.key)));
      names.appendChild(el('div', 'wp-allergen-en', def.label));
    }

    row.appendChild(names);

    const dot = el('span', `wp-sev-dot sev-dot-${a.severity}`);
    dot.title = a.severity;
    row.appendChild(dot);
    grid.appendChild(row);
  });
  card.appendChild(grid);

  // ── CROSS-CONTACT WARNING ─────────────────────────────────
  if (bundle) {
    let crossMsg;
    if (isSg) {
      crossMsg = Object.values(bundle.card.cross_contact).join(' · ');
    } else {
      crossMsg = bundle.card.cross_contact;
    }
    if (crossMsg) {
      const wb = el('div', 'wp-warning-bar');
      wb.appendChild(el('span', 'wp-warning-icon-sm', '⚠'));
      const wt = el('span', 'wp-warning-text');
      wt.textContent = crossMsg;
      wb.appendChild(wt);
      card.appendChild(wb);
    }
  }

  // ── INSTRUCTION FOOTER ────────────────────────────────────
  if (bundle) {
    let instrMsg;
    if (isSg) {
      instrMsg = Object.values(bundle.card.instruction).join('\n');
    } else {
      instrMsg = bundle.card.instruction;
    }
    if (instrMsg) {
      const footer = el('div', 'wp-front-footer');
      const local = el('div', 'wp-instruct-local');
      local.textContent = instrMsg;
      footer.appendChild(local);
      footer.appendChild(el('div', 'wp-instruct-en', 'Please inform the chef before preparing'));
      card.appendChild(footer);
    }
  }

  // ── DIVIDER ───────────────────────────────────────────────
  const divider = el('div', 'wp-divider');
  divider.appendChild(el('span', 'wp-divider-label', 'DETAILS'));
  card.appendChild(divider);

  // ── DETAILS (triggers + hidden) ───────────────────────────
  const back = el('div', 'card-back');
  profile.allergens.forEach(a => {
    const def = ALLERGENS.find(x => x.key === a.key);
    if (!def) return;

    const block = el('div', 'wp-detail-block');

    const dtop = el('div', 'wp-detail-top');
    dtop.appendChild(el('span', 'wp-detail-emoji', def.emoji));

    const dtitle = el('div', 'wp-detail-title');
    if (bundle) {
      if (isSg) {
        const allergenObj = bundle.allergens[a.key] || {};
        const nameStr = Object.values(allergenObj).join(' / ');
        dtitle.appendChild(el('span', 'wp-detail-local', nameStr));
      } else {
        dtitle.appendChild(el('span', 'wp-detail-local', resolveAllergenName(bundle, a.key)));
      }
    }
    dtitle.appendChild(el('span', 'wp-detail-en', def.label));
    dtop.appendChild(dtitle);

    const sevLabel = SEV_LEVELS.find(s => s.value === a.severity)?.label || a.severity;
    dtop.appendChild(el('span', `wp-detail-sev sev-tag-${a.severity}`, sevLabel));
    block.appendChild(dtop);

    // Triggers
    if (a.triggers.length > 0 && bundle) {
      const tlist = el('div', 'wp-trigger-list');
      a.triggers.forEach(t => {
        const chip = el('div', 'wp-trigger-chip');
        chip.appendChild(el('span', 'wp-trigger-local', resolveTrigger(bundle, t)));
        chip.appendChild(el('span', 'wp-trigger-en', t.trim()));
        tlist.appendChild(chip);
      });
      block.appendChild(tlist);
    }

    // Hidden ingredients
    if (bundle && !isSg) {
      const hidden = (bundle.hidden || {})[a.key] || [];
      if (hidden.length > 0) {
        const hrow = el('div', 'wp-hidden-row');
        hrow.appendChild(el('span', 'wp-hidden-label', 'Also in:'));
        hrow.appendChild(el('span', 'wp-hidden-chips', hidden.map(h => `${h.local} (${h.en})`).join(' · ')));
        block.appendChild(hrow);
      }
    }

    back.appendChild(block);
  });

  // Polite close
  const polite = el('div', 'wp-polite');
  polite.appendChild(el('div', 'wp-polite-en', 'Thank you for your care — ขอบคุณ · ありがとう · 谢谢'));
  back.appendChild(polite);

  // Emergency
  if (profile.emergency) {
    const em = el('div', 'wp-emergency');
    em.appendChild(el('span', 'wp-em-icon', '🆘'));
    em.appendChild(el('div', 'wp-em-en', `Emergency: ${profile.emergency}`));
    back.appendChild(em);
  }

  card.appendChild(back);
  return card;
}

// ─────────────────────────────────────────────────────────────
// MODULE: SCREEN NAVIGATION + QUICK SHOW
// ─────────────────────────────────────────────────────────────
let isQuickShow = false;
let touchStartX = 0;

function getProfile() {
  return {
    name:      State.name,
    emergency: State.emergency,
    allergens: State.allergens,
  };
}

function renderSingleCard() {
  const wrap = document.getElementById('allergy-card');
  if (!wrap) return;
  wrap.innerHTML = '';
  const cardEl = buildCardForCountry(State.country, getProfile());
  if (cardEl) wrap.appendChild(cardEl);
}

function generateCard() {
  if (!State.country || !State.allergens.length) return;
  State.save();
  renderSingleCard();
  document.getElementById('screen-profile')?.classList.remove('active');
  document.getElementById('screen-card')?.classList.add('active');
  window.scrollTo(0, 0);
  // Show "Show Last" on profile screen for next time
  const sl = document.getElementById('btn-show-last');
  if (sl) sl.style.display = 'block';
}

function goBack() {
  exitQuickShow();
  document.getElementById('screen-card')?.classList.remove('active');
  document.getElementById('screen-profile')?.classList.add('active');
  window.scrollTo(0, 0);
}

function enterQuickShow() {
  isQuickShow = true;
  const overlay = document.getElementById('quick-overlay');
  if (!overlay) return;

  const cardWrap = document.getElementById('allergy-card');
  const clone = cardWrap?.firstElementChild?.cloneNode(true);

  overlay.innerHTML = '';
  if (clone) overlay.appendChild(clone);
  overlay.classList.add('active');

  try {
    const root = document.documentElement;
    if (root.requestFullscreen) root.requestFullscreen();
    else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
  } catch (_) {}
}

function exitQuickShow() {
  if (!isQuickShow) return;
  isQuickShow = false;
  const overlay = document.getElementById('quick-overlay');
  overlay?.classList.remove('active');
  setTimeout(() => { if (overlay) overlay.innerHTML = ''; }, 200);
  try {
    if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen();
    else if (document.webkitExitFullscreen && document.webkitFullscreenElement) document.webkitExitFullscreen();
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────
// MODULE: TRIP MODE (locked — PRO)
// UI is fully built and functional; paywall intercepts on toggle.
// ─────────────────────────────────────────────────────────────
const TRIP_UNLOCKED = false; // flip to true when monetization ships

function showPaywall() {
  document.getElementById('paywall-overlay')?.classList.add('active');
}
function hidePaywall() {
  document.getElementById('paywall-overlay')?.classList.remove('active');
  // Snap mode toggle back to single
  document.getElementById('btn-mode-single')?.classList.add('active');
  document.getElementById('btn-mode-trip')?.classList.remove('active');
}

// ─────────────────────────────────────────────────────────────
// MODULE: INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1. Restore saved state FIRST so UI builds with correct values
  State.load();
  if (!State.country) State.country = 'th'; // default before DOM is ready

  // 2. Build static UI (flag grid + allergen picker — built once, never rebuilt)
  buildFlagSelector();
  buildAllergenPicker();

  // 3. Sync visual state to loaded data
  State.setCountry(State.country); // updates flag highlights + label
  syncPickerState();
  renderSelectedAllergens();
  updateGenerateBtn();

  // 4. Restore form fields
  const nameEl = document.getElementById('input-name');
  const emEl   = document.getElementById('input-emergency');
  if (nameEl) nameEl.value = State.name;
  if (emEl)   emEl.value   = State.emergency;

  // 5. Show empty state hint if no allergens loaded
  const emptyEl = document.getElementById('selected-empty');
  if (emptyEl) emptyEl.style.display = State.allergens.length === 0 ? 'block' : 'none';

  // Show "Show Last" if we have saved allergens
  const sl = document.getElementById('btn-show-last');
  if (sl && State.allergens.length > 0) sl.style.display = 'block';

  // ── Event: name / emergency ─────────────────────────────
  nameEl?.addEventListener('input', () => { State.name = nameEl.value.trim(); State.save(); });
  emEl?.addEventListener('input',   () => { State.emergency = emEl.value.trim(); State.save(); });

  // ── Event: generate / back / show card ──────────────────
  document.getElementById('btn-generate')?.addEventListener('click', generateCard);
  document.getElementById('btn-back')?.addEventListener('click', goBack);
  document.getElementById('btn-show-card')?.addEventListener('click', enterQuickShow);
  document.getElementById('btn-show-last')?.addEventListener('click', () => {
    renderSingleCard();
    enterQuickShow();
  });

  // ── Event: quick overlay dismiss ───────────────────────
  const overlay = document.getElementById('quick-overlay');
  overlay?.addEventListener('click', exitQuickShow);
  overlay?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) exitQuickShow(); // any swipe closes (single mode)
  }, { passive: true });

  // ── Event: mode toggle (trip mode paywall) ───────────────
  document.getElementById('btn-mode-single')?.addEventListener('click', () => {
    document.getElementById('btn-mode-single')?.classList.add('active');
    document.getElementById('btn-mode-trip')?.classList.remove('active');
    State.mode = 'single';
  });
  document.getElementById('btn-mode-trip')?.addEventListener('click', () => {
    if (!TRIP_UNLOCKED) { showPaywall(); return; }
    document.getElementById('btn-mode-trip')?.classList.add('active');
    document.getElementById('btn-mode-single')?.classList.remove('active');
    State.mode = 'trip';
  });

  // ── Event: paywall ───────────────────────────────────────
  document.getElementById('btn-paywall-dismiss')?.addEventListener('click', hidePaywall);
  document.getElementById('btn-paywall-cta')?.addEventListener('click', () => {
    // TODO: hook into payment flow
    hidePaywall();
  });
  document.getElementById('paywall-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('paywall-overlay')) hidePaywall();
  });

  // ── Event: keyboard ──────────────────────────────────────
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { exitQuickShow(); hidePaywall(); } });
});

// ── Service Worker ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
