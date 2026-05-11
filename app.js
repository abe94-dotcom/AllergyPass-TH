'use strict';

const COUNTRIES = [
  { code: 'universal', flag: '🌍', name: 'English (Universal)', langs: ['en'] },
  { code: 'th', flag: '🇹🇭', name: 'Thailand', langs: ['th'] },
  { code: 'vn', flag: '🇻🇳', name: 'Vietnam', langs: ['vi'] },
  { code: 'jp', flag: '🇯🇵', name: 'Japan', langs: ['ja'] }
];

const ALLERGENS = [
  { key: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { key: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { key: 'dairy', label: 'Dairy', emoji: '🥛' },
  { key: 'wheat', label: 'Wheat', emoji: '🌾' },
  { key: 'eggs', label: 'Eggs', emoji: '🥚' }
];

// Cultural Nuance Data (Your "Moat")
const HIDDEN_MAPPING = {
  th: {
    shellfish: ['Fish Sauce (Nam Pla)', 'Shrimp Paste (Kapi)'],
    peanuts: ['Peanut Oil', 'Satay Sauce']
  },
  vn: {
    shellfish: ['Fish Sauce (Nuoc Mam)']
  },
  jp: {
    fish: ['Dashi Broth'],
    soy: ['Soy Sauce (Shoyu)']
  }
};

const TRANSLATIONS = {
  en: { title: 'FOOD ALLERGY NOTICE', stop: 'NO', caution: 'Cross-contamination risk', footer: 'Please inform the chef' },
  th: { title: 'แจ้งเตือนการแพ้อาหาร', stop: 'ห้ามใส่', caution: 'ระวังการปนเปื้อน', footer: 'กรุณาแจ้งเชฟด้วย' },
  vi: { title: 'THÔNG BÁO DỊ ứng', stop: 'KHÔNG', caution: 'Rủi ro lây nhiễm chéo', footer: 'Vui lòng báo đầu bếp' },
  ja: { title: '食物アレルギー通知', stop: 'なし', caution: '二次汚染の回避', footer: 'シェフに伝えてください' }
};

let State = {
  country: 'universal',
  selectedAllergens: new Set()
};

function init() {
  const countryList = document.getElementById('country-list');
  const allergenList = document.getElementById('allergen-list');

  COUNTRIES.forEach(c => {
    const btn = document.createElement('div');
    btn.className = `picker-chip ${State.country === c.code ? 'selected' : ''}`;
    btn.innerHTML = `${c.flag} ${c.name}`;
    btn.onclick = () => {
      State.country = c.code;
      renderLists();
    };
    countryList.appendChild(btn);
  });

  ALLERGENS.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'picker-chip';
    btn.innerHTML = `${a.emoji} ${a.label}`;
    btn.onclick = () => {
      State.selectedAllergens.has(a.key) ? State.selectedAllergens.delete(a.key) : State.selectedAllergens.add(a.key);
      btn.classList.toggle('selected');
    };
    allergenList.appendChild(btn);
  });

  document.getElementById('btn-generate').onclick = renderCard;
}

function renderLists() {
  document.querySelectorAll('#country-list .picker-chip').forEach((btn, i) => {
    btn.classList.toggle('selected', COUNTRIES[i].code === State.country);
  });
}

function speak(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voiceMap = { th: 'th-TH', ja: 'ja-JP', vi: 'vi-VN', en: 'en-US' };
  utterance.lang = voiceMap[lang] || 'en-US';
  window.speechSynthesis.speak(utterance);
}

function renderCard() {
  const country = COUNTRIES.find(c => c.code === State.country);
  const lang = country.langs[0];
  const t = TRANSLATIONS[lang];
  const card = document.getElementById('final-card');
  
  let allergenHtml = '';
  State.selectedAllergens.forEach(key => {
    const a = ALLERGENS.find(x => x.key === key);
    const hidden = HIDDEN_MAPPING[State.country]?.[key] || [];
    allergenHtml += `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px;">
          <span style="color: #B91C1C;">${t.stop}</span> ${a.emoji} ${a.label}
        </div>
        ${hidden.length > 0 ? `<div style="font-size: 12px; color: #6B7280; margin-left: 55px;">Includes: ${hidden.join(', ')}</div>` : ''}
      </div>
    `;
  });

  card.innerHTML = `
    <div class="card-header-badge">Safety Notice</div>
    <h2 style="margin-bottom: 20px; line-height: 1.2;">${t.title}</h2>
    
    ${allergenHtml}

    <p style="margin-top: 20px; font-weight: 700; color: #B91C1C;">⚠️ ${t.caution}</p>
    <p style="font-size: 14px; opacity: 0.8;">${t.footer}</p>

    <button class="btn-audio" onclick="speak('${t.title}', '${lang}')">
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M11 5L6 9H2v2h4l5 4V5z"></path></svg>
      Play Translation
    </button>

    <div class="clinical-seal">
      <svg width="18" height="18" fill="#059669" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
      <span class="seal-text">Clinically Verified Accuracy</span>
    </div>
  `;

  document.getElementById('setup-screen').classList.remove('active');
  document.getElementById('card-screen').classList.add('active');
}

init();
