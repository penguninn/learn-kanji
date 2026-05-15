const { kanji: KANJI, vocab: RAW_VOCAB } = window.KANJI_DATA;

const GROUPS = {
  g1: { label: 'Nhóm 1: Động từ hay dùng', chars: [...'行来帰食飲見聞読書買会話作使待持入出休'] },
  g2: { label: 'Nhóm 2: Thời gian', chars: [...'日月火水木金土曜年時分今毎朝昼晩夜午前後間'] },
  g3: { label: 'Nhóm 3: Người và cuộc sống', chars: [...'人男女子友父母兄姉弟妹家族私名生先'] },
  g4: { label: 'Nhóm 4: Địa điểm', chars: [...'国学校会社店駅道町村市外中上下左右東西南北'] },
  g5: { label: 'Nhóm 5: Tính từ N5/N4', chars: [...'大小新古高安長短多少早明暗近遠広狭強弱'] },
  g6: { label: 'Nhóm 6: Kanji N4 quan trọng', chars: [...'思考知言教習働住歩走開閉始終売貸借送洗着'] }
};

const EXTRA_VOCAB = [
  { word: 'ここ', kana: 'ここ', level: 'Kana', meanings: ['ở đây'], particles: ['ここにあります', 'ここで食べます', 'ここへ来ます'] },
  { word: 'そこ', kana: 'そこ', level: 'Kana', meanings: ['ở đó'], particles: ['そこにあります', 'そこへ行きます'] },
  { word: 'あそこ', kana: 'あそこ', level: 'Kana', meanings: ['ở đằng kia'], particles: ['あそこにいます', 'あそこまで行きます'] },
  { word: 'これ', kana: 'これ', level: 'Kana', meanings: ['cái này'], particles: ['これは本です', 'これをください'] },
  { word: 'それ', kana: 'それ', level: 'Kana', meanings: ['cái đó'], particles: ['それは何ですか', 'それを見ます'] },
  { word: 'あれ', kana: 'あれ', level: 'Kana', meanings: ['cái kia'], particles: ['あれは学校です'] },
  { word: 'とても', kana: 'とても', level: 'Kana', meanings: ['rất'], particles: ['とても高いです', 'とても便利です'] },
  { word: 'あまり', kana: 'あまり', level: 'Kana', meanings: ['không ... lắm'], particles: ['あまり高くないです', 'あまり行きません'] },
  { word: 'もう', kana: 'もう', level: 'Kana', meanings: ['đã', 'nữa'], particles: ['もう食べました', 'もう一度'] },
  { word: 'まだ', kana: 'まだ', level: 'Kana', meanings: ['vẫn/chưa'], particles: ['まだ食べていません', 'まだ学生です'] }
];

const DEFAULT_PARTICLES = {
  行: ['場所へ/に行く', '人と行く', '乗り物で行く'], 来: ['場所へ/に来る', '人と来る', 'いつ来る'], 帰: ['家へ/に帰る', '国へ帰る'],
  食: ['Nを食べる', '場所で食べる', '人と食べる'], 飲: ['Nを飲む', '場所で飲む', '人と飲む'], 見: ['Nを見る', '人と見る', '場所で見る'],
  聞: ['Nを聞く', '人に聞く', '人から聞く'], 読: ['Nを読む', '場所で読む'], 書: ['Nを書く', 'Nに書く', '道具で書く'],
  買: ['Nを買う', '場所で買う', '人に買う'], 会: ['人に会う', '場所で会う'], 話: ['人と話す', 'Nについて話す', '日本語で話す'],
  作: ['Nを作る', '材料で作る', '人に作る'], 使: ['Nを使う', 'Nに使う'], 待: ['人を待つ', '場所で待つ'], 持: ['Nを持つ', 'Nに持って行く'],
  入: ['場所に入る', 'Nを入れる'], 出: ['場所を出る', 'Nを出す'], 休: ['学校/会社を休む', '家で休む'],
  思: ['〜と思う', 'Nを思い出す'], 考: ['Nを考える', '〜について考える'], 知: ['Nを知っている', '人に知らせる'], 言: ['〜と言う', '人に言う'],
  教: ['人にNを教える', '場所を教える'], 習: ['人にNを習う', 'Nを習う'], 働: ['会社で働く', '人と働く'], 住: ['場所に住む'],
  歩: ['道を歩く', '駅まで歩く'], 走: ['道を走る', '駅まで走る'], 開: ['Nを開ける', 'Nが開く'], 閉: ['Nを閉める', 'Nが閉まる'],
  始: ['Nを始める', 'Nが始まる'], 終: ['Nを終わる/終える', 'Nが終わる'], 売: ['Nを売る', '人に売る'], 貸: ['人にNを貸す'],
  借: ['人に/からNを借りる'], 送: ['人にNを送る', '人を駅まで送る'], 洗: ['Nを洗う'], 着: ['服を着る', '場所に着く']
};

const learnedKey = 'kanji-list-study.learned';
const meaningEditKey = 'kanji-list-study.meaning-edits.v1';
const learnedSet = new Set(JSON.parse(localStorage.getItem(learnedKey) || '[]'));
const meaningEdits = JSON.parse(localStorage.getItem(meaningEditKey) || '{}');
const VOCAB = dedupe([...RAW_VOCAB, ...EXTRA_VOCAB]);

for (const v of VOCAB) {
  v.defaultMeanings = [...(v.meanings || [])];
  const key = vocabKey(v);
  if (meaningEdits[key]) {
    v.meanings = [meaningEdits[key]];
    v.isEdited = true;
  }
}

const state = {
  query: '',
  levels: new Set(['N5', 'N4', 'Extra', 'Kana']),
  group: 'all',
  lesson: 'all',
  sortMode: 'gojuon',
  selectedKey: '',
  editingVocabKey: ''
};

const $ = s => document.querySelector(s);
const resultBody = $('#resultBody');
const emptyState = $('#emptyState');
const groupFilter = $('#groupFilter');
const lessonFilter = $('#lessonFilter');
const levelFilters = [...document.querySelectorAll('.levelFilter')];

init();

function init() {
  ensureModal();
  groupFilter.innerHTML = '<option value="all">Tất cả nhóm</option>' + Object.entries(GROUPS).map(([id, g]) => `<option value="${id}">${g.label}</option>`).join('') + '<option value="kana">Từ hiragana thuần</option>';
  lessonFilter.innerHTML = '<option value="all">Tất cả bài</option>' + getLessons().map(n => `<option value="${n}">Bài ${n}</option>`).join('');

  $('#searchInput').addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); render(); });
  groupFilter.addEventListener('change', e => { state.group = e.target.value; render(); });
  lessonFilter.addEventListener('change', e => { state.lesson = e.target.value; state.selectedKey = ''; closeModal(); render(); });
  $('#sortMode').addEventListener('change', e => { state.sortMode = e.target.value; render(); });
  $('#resetProgressBtn').addEventListener('click', () => { learnedSet.clear(); localStorage.removeItem(learnedKey); render(); });
  levelFilters.forEach(x => x.addEventListener('change', () => { state.levels = new Set(levelFilters.filter(i => i.checked).map(i => i.value)); render(); }));
  resultBody.addEventListener('click', onTableClick);
  document.addEventListener('click', onModalClick);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && state.editingVocabKey) {
      e.preventDefault();
      saveMeaningFromForm(state.editingVocabKey);
    }
  });
  render();
}

function ensureModal() {
  if ($('#detailModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="detailModal" class="modal hidden" aria-hidden="true">
      <div class="modal-backdrop" data-close-modal></div>
      <section class="modal-card" role="dialog" aria-modal="true">
        <button class="modal-close" data-close-modal>×</button>
        <div id="modalContent"></div>
      </section>
    </div>`);
}

function getLessons() {
  return [...new Set(VOCAB.flatMap(v => v.lessons || (v.lesson ? [v.lesson] : [])))].filter(Boolean).sort((a, b) => a - b);
}

function buildRows() {
  const kanjiRows = KANJI.map(k => {
    const words = wordsForKanji(k.char).filter(wordMatchesLesson);
    const main = words[0] || null;
    return {
      type: 'kanji', key: `k-${k.char}`, char: k.char,
      kana: main?.kana || firstKun(k) || '', mainWord: main?.word || k.char,
      meaning: main?.meanings?.join(' / ') || k.meanings.join(' / '),
      level: k.level, groups: groupsFor(k.char), lessons: lessonsForWords(words), item: k, words
    };
  });
  const kanaRows = VOCAB.filter(v => !hasKanji(v.word)).filter(wordMatchesLesson).map(v => ({
    type: 'kana', key: `v-${v.word}-${v.kana}`, char: '—', kana: v.kana,
    mainWord: v.word, meaning: v.meanings.join(' / '), level: v.level,
    groups: ['kana'], lessons: lessonsForWords([v]), item: v, words: [v]
  }));
  return [...kanjiRows, ...kanaRows].filter(rowMatches).sort(sortRows);
}

function wordMatchesLesson(v) {
  return state.lesson === 'all' || (v.lessons || (v.lesson ? [v.lesson] : [])).includes(Number(state.lesson));
}

function lessonsForWords(words) {
  return [...new Set(words.flatMap(v => v.lessons || (v.lesson ? [v.lesson] : [])))].filter(Boolean).sort((a, b) => a - b);
}

function rowMatches(row) {
  if (!state.levels.has(row.level)) return false;
  if (state.group !== 'all' && !row.groups.includes(state.group)) return false;
  if (state.lesson !== 'all' && !row.lessons.includes(Number(state.lesson))) return false;
  if (state.lesson !== 'all' && row.type === 'kanji' && row.words.length === 0) return false;
  const text = normalize([row.char, row.kana, row.mainWord, row.meaning, groupLabels(row.groups), row.lessons.map(x => `bài ${x}`), row.words.map(w => [w.word, w.kana, w.meanings])]);
  return !state.query || text.includes(state.query) || kanaToRomaji(text).includes(state.query);
}

function sortRows(a, b) {
  if (state.sortMode === 'group') return groupRank(a) - groupRank(b) || gojuonKey(a.kana).localeCompare(gojuonKey(b.kana), 'ja');
  if (state.sortMode === 'level') return a.level.localeCompare(b.level) || gojuonKey(a.kana).localeCompare(gojuonKey(b.kana), 'ja');
  return gojuonKey(a.kana).localeCompare(gojuonKey(b.kana), 'ja');
}

function render() {
  const rows = buildRows();
  $('#resultTitle').textContent = `Danh sách học (${rows.length})`;
  const lessonLabel = state.lesson === 'all' ? 'Tất cả bài' : `Bài ${state.lesson}`;
  $('#statsPanel').innerHTML = `<b>${rows.length}</b> dòng đang hiển thị<br><b>${learnedSet.size}</b> mục đã nhớ<br><b>${Object.keys(meaningEdits).length}</b> nghĩa đã sửa<br><span>${lessonLabel}</span><br><span>${state.group === 'all' ? 'Tất cả nhóm' : (GROUPS[state.group]?.label || 'Hiragana thuần')}</span>`;
  emptyState.classList.toggle('hidden', rows.length > 0);
  resultBody.innerHTML = rows.map(rowTemplate).join('');
}

function rowTemplate(r) {
  const learned = learnedSet.has(r.key) || learnedSet.has(r.char);
  const lessonTags = r.lessons.slice(0, 4).map(n => `<span class="tag lesson-tag">B${n}</span>`).join('') + (r.lessons.length > 4 ? `<span class="tag">+${r.lessons.length - 4}</span>` : '');
  return `<tr class="study-row ${state.selectedKey === r.key ? 'selected' : ''}" data-key="${esc(r.key)}">
    <td class="kanji-cell">${esc(r.char)}</td>
    <td><strong>${esc(r.mainWord)}</strong><small>${esc(r.kana || '—')} · ${esc(r.level)}</small></td>
    <td>${esc(r.meaning)}</td>
    <td>${r.groups.map(g => `<span class="tag">${esc(shortGroup(g))}</span>`).join('')}${lessonTags}</td>
    <td><button class="remember-btn ${learned ? 'active' : ''}" data-remember="${esc(r.key)}">${learned ? '✓' : '+'}</button></td>
  </tr>`;
}

function onTableClick(e) {
  const remember = e.target.closest('[data-remember]');
  if (remember) { toggleLearned(remember.dataset.remember); e.stopPropagation(); render(); return; }
  const tr = e.target.closest('tr[data-key]');
  if (!tr) return;
  state.selectedKey = tr.dataset.key;
  state.editingVocabKey = '';
  const row = currentRow();
  if (row) openDetail(row);
  render();
}

function onModalClick(e) {
  if (e.target.closest('[data-close-modal]')) return closeModal();
  const remember = e.target.closest('[data-remember]');
  if (remember) { toggleLearned(remember.dataset.remember); render(); return; }

  const editBtn = e.target.closest('[data-edit-meaning]');
  if (editBtn) { state.editingVocabKey = editBtn.dataset.editMeaning; reopenCurrentDetail(); return; }

  const cancelBtn = e.target.closest('[data-cancel-edit]');
  if (cancelBtn) { state.editingVocabKey = ''; reopenCurrentDetail(); return; }

  const saveBtn = e.target.closest('[data-save-meaning]');
  if (saveBtn) { saveMeaningFromForm(saveBtn.dataset.saveMeaning); return; }

  const resetBtn = e.target.closest('[data-reset-meaning]');
  if (resetBtn) { resetMeaning(resetBtn.dataset.resetMeaning); return; }

  const kanji = e.target.closest('[data-open-kanji]');
  if (kanji) {
    const row = buildRows().find(r => r.char === kanji.dataset.openKanji);
    if (row) { state.selectedKey = row.key; state.editingVocabKey = ''; openDetail(row); render(); }
  }
}

function openDetail(row) {
  if (row.type === 'kana') renderKanaDetail(row); else renderKanjiDetail(row);
  const modal = $('#detailModal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = $('#detailModal');
  if (!modal) return;
  state.editingVocabKey = '';
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderKanjiDetail(row) {
  const k = row.item;
  $('#modalContent').innerHTML = `<div class="detail-head"><div><p class="eyebrow">${esc(row.level)} · ${esc(groupLabels(row.groups))}${row.lessons.length ? ' · Bài ' + row.lessons.join(', ') : ''}</p><h2>${esc(k.char)}</h2><p>${esc(k.meanings.join(' / '))}</p></div><button class="remember-btn" data-remember="${esc(row.key)}">✓</button></div>
    <div id="strokeTarget" class="stroke-box"></div>
    <section class="detail-section"><h3>Âm On/Kun</h3><div class="reading-grid"><div><b>On</b>${reading(k.onyomi)}</div><div><b>Kun</b>${reading(k.kunyomi)}</div></div></section>
    <section class="detail-section"><h3>Từ vựng chứa 「${esc(k.char)}」</h3>${vocabList(row.words, k.char)}</section>`;
  renderStrokeAnimation($('#strokeTarget'), k.char);
}

function renderKanaDetail(row) {
  const v = row.item;
  $('#modalContent').innerHTML = `<div class="detail-head"><div><p class="eyebrow">Hiragana thuần${row.lessons.length ? ' · Bài ' + row.lessons.join(', ') : ''}</p><h2 class="kana-title">${esc(v.word)}</h2><p>${esc(v.kana)} · ${esc(v.meanings.join(' / '))}</p></div><button class="remember-btn" data-remember="${esc(row.key)}">✓</button></div>
    <section class="detail-section"><h3>Mẫu đi kèm</h3>${particleList(v, '')}</section>
    <section class="detail-section"><h3>Sửa nghĩa</h3>${vocabList([v], '')}</section>`;
}

function vocabList(words, char) {
  if (!words.length) return '<p class="muted">Chưa có từ ghép trong data.</p>';
  return words.map(v => vocabLine(v, char)).join('');
}

function vocabLine(v, char) {
  const key = vocabKey(v);
  const edited = !!meaningEdits[key];
  const lessons = (v.lessons || v.lesson) ? ' · Bài ' + (v.lessons || [v.lesson]).join(', ') : '';
  const editForm = state.editingVocabKey === key ? meaningEditForm(v, key) : '';
  return `<article class="vocab-line">
    <div class="vocab-main">
      <div><b>${esc(v.word)}</b><span>${esc(v.kana)} · ${esc(v.meanings.join(' / '))}${lessons}${edited ? ' · đã sửa' : ''}</span></div>
      <div class="vocab-actions">
        <button type="button" data-edit-meaning="${esc(key)}">Sửa nghĩa</button>
        ${edited ? `<button type="button" data-reset-meaning="${esc(key)}">Reset</button>` : ''}
      </div>
    </div>
    ${editForm}
    ${particleList(v, char)}
    ${kanjiButtons(v.word, char)}
  </article>`;
}

function meaningEditForm(v, key) {
  return `<div class="meaning-editor">
    <label>Nghĩa tiếng Việt</label>
    <textarea data-meaning-input="${esc(key)}" rows="3">${esc(v.meanings.join(' / '))}</textarea>
    <div class="meaning-editor-actions">
      <button type="button" class="primary-btn" data-save-meaning="${esc(key)}">Lưu</button>
      <button type="button" data-cancel-edit>Hủy</button>
      <small>Ctrl+S để lưu nhanh</small>
    </div>
  </div>`;
}

function saveMeaningFromForm(key) {
  const input = document.querySelector(`[data-meaning-input="${cssEscape(key)}"]`);
  const value = input?.value.trim();
  if (!value) return;
  const v = findVocabByKey(key);
  if (!v) return;
  meaningEdits[key] = value;
  localStorage.setItem(meaningEditKey, JSON.stringify(meaningEdits));
  v.meanings = [value];
  v.isEdited = true;
  state.editingVocabKey = '';
  render();
  reopenCurrentDetail();
}

function resetMeaning(key) {
  const v = findVocabByKey(key);
  if (!v) return;
  delete meaningEdits[key];
  localStorage.setItem(meaningEditKey, JSON.stringify(meaningEdits));
  v.meanings = [...(v.defaultMeanings || v.meanings)];
  v.isEdited = false;
  state.editingVocabKey = '';
  render();
  reopenCurrentDetail();
}

function reopenCurrentDetail() {
  const row = currentRow();
  if (row) openDetail(row);
}

function currentRow() {
  return buildRows().find(x => x.key === state.selectedKey);
}

function findVocabByKey(key) {
  return VOCAB.find(v => vocabKey(v) === key);
}

function vocabKey(v) {
  return `${encodeURIComponent(v.word)}|${encodeURIComponent(v.kana)}`;
}

function particleList(v, char) {
  const items = v.particles || DEFAULT_PARTICLES[char] || inferParticles(v);
  return `<ul class="particle-list">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function inferParticles(v) {
  if (v.meanings.some(m => /ăn|uống|đọc|viết|mua|xem|nghe|rửa|giặt|mở|đóng|bán|gửi|dùng|làm|tạo|đặt|bật|tắt|nộp|trả|gọi|đón|chụp|cắt|mượn/.test(m))) return [`Nを${v.word}`, `場所で${v.word}`];
  if (v.meanings.some(m => /đi|đến|về|vào|ra|sống|tới|lên|xuống|rẽ|băng qua|leo/.test(m))) return [`場所に/へ${v.word}`, `場所で${v.word}`];
  if (v.meanings.some(m => /cao|thấp|rộng|hẹp|mới|cũ|rẻ|đắt|dài|ngắn|sáng|tối|gần|xa|nhiều|ít|mạnh|yếu|trẻ|ngon|vui/.test(m))) return [`Nは${v.word}です`, `とても${v.word}`, `あまり${v.word}ないです`];
  return [`Nは${v.word}です`, `${v.word}があります/います`];
}

function kanjiButtons(word, current) {
  const chars = [...word].filter(ch => KANJI.some(k => k.char === ch) && ch !== current);
  return chars.length ? `<div class="kanji-links">${chars.map(ch => `<button data-open-kanji="${esc(ch)}">${esc(ch)}</button>`).join('')}</div>` : '';
}

function wordsForKanji(char) { return VOCAB.filter(v => v.word.includes(char)).sort((a, b) => gojuonKey(a.kana).localeCompare(gojuonKey(b.kana), 'ja')); }
function groupsFor(char) { const ids = Object.entries(GROUPS).filter(([, g]) => g.chars.includes(char)).map(([id]) => id); return ids.length ? ids : ['other']; }
function groupRank(row) { const first = row.groups[0]; return first === 'kana' ? 99 : Number(first.replace('g', '')) || 50; }
function groupLabels(ids) { return ids.map(id => GROUPS[id]?.label || (id === 'kana' ? 'Hiragana thuần' : 'Khác')).join(' / '); }
function shortGroup(id) { return id === 'kana' ? 'かな' : id === 'other' ? 'Khác' : id.toUpperCase(); }
function firstKun(k) { return (k.kunyomi?.[0] || k.onyomi?.[0] || '').replaceAll('.', ''); }
function hasKanji(s) { return /[一-龯]/.test(s); }
function dedupe(list) { const m = new Map(); list.forEach(x => m.set(`${x.word}|${x.kana}`, x)); return [...m.values()]; }
function normalize(parts) { return parts.flat(Infinity).filter(Boolean).join(' ').toLowerCase(); }
function reading(list) { return list?.length ? list.map(x => `<span>${esc(x)}</span>`).join('') : '<span class="muted">—</span>'; }
function toggleLearned(key) { learnedSet.has(key) ? learnedSet.delete(key) : learnedSet.add(key); localStorage.setItem(learnedKey, JSON.stringify([...learnedSet])); }
function esc(v) { return String(v ?? '').replace(/[&<>"]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[s])); }
function cssEscape(v) { return String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"'); }
function gojuonKey(kana = '') { const order = 'あいうえおかがきぎくぐけげこごさざしじすずせぜそぞただちぢつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもやゆよらりるれろわをん'; return [...kana].map(ch => String(order.indexOf(ch)).padStart(3, '0')).join('-') || '999'; }
function kanaToRomaji(input = '') { const map = { 'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho','ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo','ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo','りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo','じゃ':'ja','じゅ':'ju','じょ':'jo','あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n','が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po','ー':'-' }; let out = ''; for (let i = 0; i < input.length; i++) { const two = input.slice(i, i + 2); if (map[two]) { out += map[two]; i++; } else out += map[input[i]] || input[i]; } return out.toLowerCase(); }

async function renderStrokeAnimation(container, char) {
  container.innerHTML = '<span class="muted">Đang tạo animation...</span>';
  const hex = char.codePointAt(0).toString(16).padStart(5, '0');
  try {
    const res = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`, { cache: 'force-cache' });
    if (!res.ok) throw new Error('not found');
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const paths = [...doc.querySelectorAll('path[d]')].map(p => p.getAttribute('d'));
    if (!paths.length) throw new Error('no path');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 109 109'); svg.classList.add('stroke-svg');
    paths.forEach((d, i) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.classList.add('stroke-path'); p.style.animationDelay = `${i * .22}s`; svg.appendChild(p); });
    container.innerHTML = ''; container.appendChild(svg);
  } catch { container.innerHTML = `<svg class="stroke-svg" viewBox="0 0 250 250"><text class="stroke-text" x="125" y="170" text-anchor="middle">${esc(char)}</text></svg>`; }
}
