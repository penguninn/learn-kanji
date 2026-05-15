const { kanji: KANJI, vocab: RAW_VOCAB } = window.KANJI_DATA;

const VOCAB = dedupeVocab(RAW_VOCAB);
const learnedKey = 'kanji-n4-study.learned';
const learnedSet = new Set(JSON.parse(localStorage.getItem(learnedKey) || '[]'));

const state = {
  mode: 'kanji',
  query: '',
  levels: new Set(['N5', 'N4'])
};

const resultArea = document.querySelector('#resultArea');
const searchInput = document.querySelector('#searchInput');
const levelFilters = [...document.querySelectorAll('.levelFilter')];
const modeBtns = [...document.querySelectorAll('.modeBtn')];
const statsPanel = document.querySelector('#statsPanel');
const dialog = document.querySelector('#detailDialog');
const detailContent = document.querySelector('#detailContent');
const quizPanel = document.querySelector('#quizPanel');

searchInput.addEventListener('input', e => {
  state.query = e.target.value.trim().toLowerCase();
  render();
});

levelFilters.forEach(input => {
  input.addEventListener('change', () => {
    state.levels = new Set(levelFilters.filter(x => x.checked).map(x => x.value));
    render();
  });
});

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.mode = btn.dataset.mode;
    modeBtns.forEach(b => b.classList.toggle('active', b === btn));
    quizPanel.classList.add('hidden');
    render();
  });
});

document.querySelector('#closeDialogBtn').addEventListener('click', () => dialog.close());
document.querySelector('#resetProgressBtn').addEventListener('click', () => {
  learnedSet.clear();
  localStorage.removeItem(learnedKey);
  render();
});
document.querySelector('#quizBtn').addEventListener('click', renderQuiz);

function handleInteractiveClick(e) {
  const kanjiBtn = e.target.closest('[data-open-kanji]');
  const vocabBtn = e.target.closest('[data-open-vocab]');
  const learnBtn = e.target.closest('[data-toggle-learned]');

  if (kanjiBtn) showKanjiDetail(kanjiBtn.dataset.openKanji);
  if (vocabBtn) showVocabDetail(vocabBtn.dataset.openVocab, vocabBtn.dataset.openKana);
  if (learnBtn) toggleLearned(learnBtn.dataset.toggleLearned);
}

resultArea.addEventListener('click', handleInteractiveClick);
detailContent.addEventListener('click', handleInteractiveClick);

function saveLearned() {
  localStorage.setItem(learnedKey, JSON.stringify([...learnedSet]));
}

function toggleLearned(char) {
  if (learnedSet.has(char)) learnedSet.delete(char);
  else learnedSet.add(char);
  saveLearned();
  render();
}

function dedupeVocab(vocab) {
  const map = new Map();
  for (const item of vocab) {
    const key = `${item.word}|${item.kana}|${item.level}`;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

function getWordsForKanji(char, levels = null) {
  return VOCAB.filter(v => v.word.includes(char) && (!levels || levels.has(v.level)));
}

function normalizeText(parts) {
  return parts.flat().filter(Boolean).join(' ').toLowerCase();
}

function textMatches(text) {
  if (!state.query) return true;
  return text.includes(state.query) || kanaToRomaji(text).includes(state.query);
}

function kanjiMatches(k) {
  const words = getWordsForKanji(k.char);
  const text = normalizeText([
    k.char, k.meanings, k.onyomi, k.kunyomi,
    words.map(w => `${w.word} ${w.kana} ${kanaToRomaji(w.kana)} ${w.meanings.join(' ')}`)
  ]);
  return textMatches(text);
}

function vocabMatches(v) {
  const text = normalizeText([v.word, v.kana, kanaToRomaji(v.kana), v.meanings]);
  return textMatches(text);
}

function filteredKanji() {
  return KANJI.filter(k => state.levels.has(k.level) && kanjiMatches(k));
}

function filteredVocab() {
  return VOCAB.filter(v => state.levels.has(v.level) && vocabMatches(v));
}

function getHomophoneGroups() {
  const grouped = new Map();
  for (const item of filteredVocab()) {
    if (!grouped.has(item.kana)) grouped.set(item.kana, []);
    grouped.get(item.kana).push(item);
  }
  return [...grouped.entries()]
    .map(([kana, items]) => [kana, dedupeBy(items, x => x.word)])
    .filter(([, items]) => items.length >= 2)
    .filter(([kana, items]) => textMatches(normalizeText([kana, items.map(v => `${v.word} ${v.meanings.join(' ')}`)])));
}

function render() {
  renderStats();
  if (state.mode === 'kanji') renderKanji();
  if (state.mode === 'vocab') renderVocab();
  if (state.mode === 'homophone') renderHomophones();
}

function renderStats() {
  const fk = filteredKanji();
  const fv = filteredVocab();
  const groups = getHomophoneGroups();
  statsPanel.innerHTML = `
    <div><strong>${fk.length}</strong> Kanji đang lọc</div>
    <div><strong>${fv.length}</strong> từ vựng đang lọc</div>
    <div><strong>${groups.length}</strong> nhóm đồng âm</div>
    <div><strong>${learnedSet.size}</strong> Kanji đã đánh dấu nhớ</div>
  `;
}

function renderKanji() {
  const list = filteredKanji();
  if (!list.length) return renderEmpty();
  resultArea.innerHTML = list.map(k => {
    const words = getWordsForKanji(k.char);
    const visibleWords = words.slice(0, 10);
    const learned = learnedSet.has(k.char);
    return `
      <article class="kanji-card">
        <div class="kanji-head">
          <button class="kanji-char" data-open-kanji="${escapeHtml(k.char)}" title="Xem chi tiết">${escapeHtml(k.char)}</button>
          <div>
            <div class="badge-row"><span class="badge level">${k.level}</span>${learned ? '<span class="badge">Đã nhớ</span>' : ''}</div>
            <h2 class="card-title">${escapeHtml(k.meanings.join(' / '))}</h2>
            <p class="meaning">${words.length} từ trong data chứa chữ này</p>
          </div>
        </div>
        <div class="readings">
          <div class="reading-box"><b>On</b>${renderReading(k.onyomi)}</div>
          <div class="reading-box"><b>Kun</b>${renderReading(k.kunyomi)}</div>
        </div>
        <div class="word-list">
          ${visibleWords.map(w => wordChip(w)).join('')}
          ${words.length > visibleWords.length ? `<span class="badge extra">+${words.length - visibleWords.length}</span>` : ''}
        </div>
        <div class="card-actions">
          <button class="mini-btn" data-open-kanji="${escapeHtml(k.char)}">Animation + chi tiết</button>
          <button class="mini-btn ${learned ? 'learned' : ''}" data-toggle-learned="${escapeHtml(k.char)}">${learned ? 'Đã nhớ' : 'Đánh dấu nhớ'}</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderVocab() {
  const list = filteredVocab();
  if (!list.length) return renderEmpty();
  resultArea.innerHTML = list.map(v => vocabCard(v)).join('');
}

function renderHomophones() {
  const groups = getHomophoneGroups();
  if (!groups.length) return renderEmpty('Không có nhóm đồng âm trong bộ lọc hiện tại. Bật Extra để thấy nhiều ví dụ hơn.');
  resultArea.innerHTML = groups.map(([kana, items]) => `
    <article class="homophone-card">
      <span class="kana">${escapeHtml(kana)} · ${escapeHtml(kanaToRomaji(kana))}</span>
      <h3>${escapeHtml(items.length)} từ đồng âm</h3>
      <div class="word-list">
        ${items.map(w => wordChip(w)).join('')}
      </div>
      ${items.map(v => `
        <div class="example">
          <b>${escapeHtml(v.word)}</b>：${escapeHtml(v.meanings.join(' / '))}
          ${v.example ? `<br><span>${escapeHtml(v.example)}</span>` : ''}
        </div>`).join('')}
    </article>
  `).join('');
}

function renderEmpty(message = 'Không tìm thấy dữ liệu phù hợp.') {
  resultArea.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function renderReading(items) {
  return items?.length ? items.map(x => `<span>${escapeHtml(x)}</span>`).join('') : '<span class="muted">—</span>';
}

function wordChip(w) {
  return `<button class="word-chip" data-open-vocab="${escapeHtml(w.word)}" data-open-kana="${escapeHtml(w.kana)}">${escapeHtml(w.word)} · ${escapeHtml(w.kana)}</button>`;
}

function vocabCard(v) {
  const chars = [...v.word].filter(ch => KANJI.some(k => k.char === ch));
  const sameKana = VOCAB.filter(x => x.kana === v.kana && x.word !== v.word);
  return `
    <article class="vocab-card">
      <div class="badge-row"><span class="badge level">${v.level}</span>${sameKana.length ? '<span class="badge">đồng âm</span>' : ''}</div>
      <h3>${escapeHtml(v.word)}</h3>
      <span class="kana">${escapeHtml(v.kana)} · ${escapeHtml(kanaToRomaji(v.kana))}</span>
      <p class="meaning">${escapeHtml(v.meanings.join(' / '))}</p>
      ${v.example ? `<div class="example">${escapeHtml(v.example)}</div>` : ''}
      <div class="word-list">${chars.map(ch => `<button class="word-chip" data-open-kanji="${escapeHtml(ch)}">${escapeHtml(ch)}</button>`).join('')}</div>
      <div class="card-actions"><button class="mini-btn" data-open-vocab="${escapeHtml(v.word)}" data-open-kana="${escapeHtml(v.kana)}">Chi tiết</button></div>
    </article>
  `;
}

function showKanjiDetail(char) {
  const k = KANJI.find(x => x.char === char);
  if (!k) return;
  const words = getWordsForKanji(char);
  detailContent.innerHTML = `
    <div class="detail-grid">
      <div>
        <h2 class="detail-title">${escapeHtml(k.char)}</h2>
        <p class="meaning"><b>${k.level}</b> · ${escapeHtml(k.meanings.join(' / '))}</p>
        <div id="strokeTarget" class="stroke-box"></div>
        <p class="muted">Ưu tiên lấy nét từ KanjiVG khi có mạng. Nếu không lấy được, app tự fallback sang animation outline.</p>
      </div>
      <div>
        <h3>Âm đọc</h3>
        <div class="readings">
          <div class="reading-box"><b>On</b>${renderReading(k.onyomi)}</div>
          <div class="reading-box"><b>Kun</b>${renderReading(k.kunyomi)}</div>
        </div>
        <h3>Tất cả từ vựng trong data có chứa 「${escapeHtml(k.char)}」</h3>
        <div class="word-list">${words.map(wordChip).join('')}</div>
      </div>
    </div>
  `;
  if (!dialog.open) dialog.showModal();
  renderStrokeAnimation(document.querySelector('#strokeTarget'), char);
}

function showVocabDetail(word, kana) {
  const v = VOCAB.find(x => x.word === word && x.kana === kana);
  if (!v) return;
  const chars = [...v.word].filter(ch => KANJI.some(k => k.char === ch));
  const homophones = VOCAB.filter(x => x.kana === v.kana && x.word !== v.word);
  detailContent.innerHTML = `
    <div>
      <div class="badge-row"><span class="badge level">${v.level}</span>${homophones.length ? '<span class="badge">có đồng âm</span>' : ''}</div>
      <h2>${escapeHtml(v.word)}</h2>
      <p class="kana">${escapeHtml(v.kana)} · ${escapeHtml(kanaToRomaji(v.kana))}</p>
      <p class="meaning">${escapeHtml(v.meanings.join(' / '))}</p>
      ${v.example ? `<div class="example">${escapeHtml(v.example)}</div>` : ''}
      <h3>Kanji trong từ này</h3>
      <div class="word-list">${chars.map(ch => `<button class="word-chip" data-open-kanji="${escapeHtml(ch)}">${escapeHtml(ch)}</button>`).join('')}</div>
      ${homophones.length ? `<h3>Từ đồng âm</h3><div class="word-list">${homophones.map(wordChip).join('')}</div>` : ''}
    </div>
  `;
  if (!dialog.open) dialog.showModal();
  detailContent.querySelectorAll('[data-open-kanji]').forEach(btn => {
    btn.addEventListener('click', () => showKanjiDetail(btn.dataset.openKanji));
  });
}

async function renderStrokeAnimation(container, char) {
  container.innerHTML = '<span class="muted">Đang tạo animation...</span>';
  const hex = char.codePointAt(0).toString(16).padStart(5, '0');
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error('KanjiVG not found');
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const paths = [...doc.querySelectorAll('path[d]')].map(p => p.getAttribute('d')).filter(Boolean);
    if (!paths.length) throw new Error('No paths');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 109 109');
    svg.classList.add('stroke-svg');
    paths.forEach((d, index) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.classList.add('stroke-path');
      p.style.animationDelay = `${index * 0.28}s`;
      svg.appendChild(p);
    });
    container.innerHTML = '';
    container.appendChild(svg);
  } catch (error) {
    renderFallbackStroke(container, char);
  }
}

function renderFallbackStroke(container, char) {
  container.innerHTML = `
    <svg class="stroke-svg" viewBox="0 0 250 250" aria-label="Animation fallback">
      <line x1="125" y1="10" x2="125" y2="240" stroke="#ded3c4" stroke-dasharray="5 8" />
      <line x1="10" y1="125" x2="240" y2="125" stroke="#ded3c4" stroke-dasharray="5 8" />
      <text class="stroke-text" x="125" y="172" text-anchor="middle">${escapeHtml(char)}</text>
    </svg>
  `;
}

function renderQuiz() {
  const list = filteredVocab();
  if (list.length < 4) return;
  const answer = sample(list);
  const wrongs = shuffle(list.filter(x => x.word !== answer.word)).slice(0, 3);
  const options = shuffle([answer, ...wrongs]);
  quizPanel.classList.remove('hidden');
  quizPanel.innerHTML = `
    <div class="badge-row"><span class="badge level">Quiz</span><span class="badge">${answer.level}</span></div>
    <h2>${escapeHtml(answer.word)} <span class="kana">${escapeHtml(answer.kana)}</span></h2>
    <p class="muted">Chọn nghĩa đúng:</p>
    <div class="quiz-options">
      ${options.map(o => `<button class="quiz-option" data-correct="${o === answer}">${escapeHtml(o.meanings.join(' / '))}</button>`).join('')}
    </div>
  `;
  quizPanel.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      quizPanel.querySelectorAll('.quiz-option').forEach(x => {
        x.classList.toggle('correct', x.dataset.correct === 'true');
      });
      if (btn.dataset.correct !== 'true') btn.classList.add('wrong');
    });
  });
}

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }
function dedupeBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) if (!map.has(keyFn(item))) map.set(keyFn(item), item);
  return [...map.values()];
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[s]));
}

function kanaToRomaji(input = '') {
  const map = {
    'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho','ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo','ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo','りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo','じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo','ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
    'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n','が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po','ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o','ー':'-'
  };
  let s = input;
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (map[two]) { out += map[two]; i++; continue; }
    const ch = s[i];
    if (ch === 'っ') {
      const nextTwo = s.slice(i + 1, i + 3);
      const nextOne = s[i + 1];
      const nextRomaji = map[nextTwo] || map[nextOne] || '';
      out += nextRomaji[0] || '';
      continue;
    }
    out += map[ch] || ch;
  }
  return out.toLowerCase();
}

render();
