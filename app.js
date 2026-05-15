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

const VOCAB = dedupe([...RAW_VOCAB, ...EXTRA_VOCAB]);
const learnedKey = 'kanji-list-study.learned';
const learnedSet = new Set(JSON.parse(localStorage.getItem(learnedKey) || '[]'));
const state = { query: '', levels: new Set(['N5', 'N4', 'Extra', 'Kana']), group: 'all', sortMode: 'gojuon', selectedKey: '' };

const $ = s => document.querySelector(s);
const resultBody = $('#resultBody');
const emptyState = $('#emptyState');
const detailPanel = $('#detailPanel');
const groupFilter = $('#groupFilter');
const levelFilters = [...document.querySelectorAll('.levelFilter')];

init();

function init() {
  groupFilter.innerHTML = '<option value="all">Tất cả nhóm</option>' + Object.entries(GROUPS).map(([id, g]) => `<option value="${id}">${g.label}</option>`).join('') + '<option value="kana">Từ hiragana thuần</option>';
  $('#searchInput').addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); render(); });
  groupFilter.addEventListener('change', e => { state.group = e.target.value; render(); });
  $('#sortMode').addEventListener('change', e => { state.sortMode = e.target.value; render(); });
  $('#resetProgressBtn').addEventListener('click', () => { learnedSet.clear(); localStorage.removeItem(learnedKey); render(); });
  $('#collapseBtn').addEventListener('click', () => { state.selectedKey = ''; detailPanel.innerHTML = '<p class="muted">Chọn một hàng để xem chi tiết.</p>'; render(); });
  levelFilters.forEach(x => x.addEventListener('change', () => { state.levels = new Set(levelFilters.filter(i => i.checked).map(i => i.value)); render(); }));
  resultBody.addEventListener('click', onTableClick);
  detailPanel.addEventListener('click', onDetailClick);
  render();
}

function buildRows() {
  const kanjiRows = KANJI.map(k => {
    const words = wordsForKanji(k.char);
    const main = words[0] || null;
    return { type: 'kanji', key: `k-${k.char}`, char: k.char, kana: main?.kana || firstKun(k) || '', mainWord: main?.word || k.char, meaning: main?.meanings?.join(' / ') || k.meanings.join(' / '), level: k.level, groups: groupsFor(k.char), item: k, words };
  });
  const kanaRows = VOCAB.filter(v => !hasKanji(v.word)).map(v => ({ type: 'kana', key: `v-${v.word}-${v.kana}`, char: '—', kana: v.kana, mainWord: v.word, meaning: v.meanings.join(' / '), level: v.level, groups: ['kana'], item: v, words: [v] }));
  return [...kanjiRows, ...kanaRows].filter(rowMatches).sort(sortRows);
}

function rowMatches(row) {
  if (!state.levels.has(row.level)) return false;
  if (state.group !== 'all' && !row.groups.includes(state.group)) return false;
  const text = normalize([row.char, row.kana, row.mainWord, row.meaning, groupLabels(row.groups), row.words.map(w => [w.word, w.kana, w.meanings])]);
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
  $('#statsPanel').innerHTML = `<b>${rows.length}</b> dòng đang hiển thị<br><b>${learnedSet.size}</b> mục đã nhớ<br><span>${state.group === 'all' ? 'Tất cả nhóm' : (GROUPS[state.group]?.label || 'Hiragana thuần')}</span>`;
  emptyState.classList.toggle('hidden', rows.length > 0);
  resultBody.innerHTML = rows.map(rowTemplate).join('');
}

function rowTemplate(r) {
  const learned = learnedSet.has(r.key) || learnedSet.has(r.char);
  return `<tr class="study-row ${state.selectedKey === r.key ? 'selected' : ''}" data-key="${esc(r.key)}" data-type="${r.type}">
    <td><span class="kana-col">${esc(gojuonColumn(r.kana))}</span><small>${esc(r.kana || '—')}</small></td>
    <td class="kanji-cell">${esc(r.char)}</td>
    <td><strong>${esc(r.mainWord)}</strong><small>${esc(r.level)}</small></td>
    <td>${esc(r.meaning)}</td>
    <td>${r.groups.map(g => `<span class="tag">${esc(shortGroup(g))}</span>`).join('')}</td>
    <td><button class="remember-btn ${learned ? 'active' : ''}" data-remember="${esc(r.key)}">${learned ? '✓' : '+'}</button></td>
  </tr>`;
}

function onTableClick(e) {
  const remember = e.target.closest('[data-remember]');
  if (remember) { toggleLearned(remember.dataset.remember); e.stopPropagation(); return; }
  const tr = e.target.closest('tr[data-key]');
  if (!tr) return;
  state.selectedKey = tr.dataset.key;
  const row = buildRows().find(x => x.key === state.selectedKey);
  if (row) renderDetail(row);
  render();
}

function onDetailClick(e) {
  const remember = e.target.closest('[data-remember]');
  if (remember) { toggleLearned(remember.dataset.remember); render(); return; }
  const kanji = e.target.closest('[data-open-kanji]');
  if (kanji) {
    const row = buildRows().find(r => r.char === kanji.dataset.openKanji);
    if (row) { state.selectedKey = row.key; renderDetail(row); render(); }
  }
}

function renderDetail(row) {
  if (row.type === 'kana') return renderKanaDetail(row);
  const k = row.item;
  detailPanel.innerHTML = `<div class="detail-head"><div><p class="eyebrow">${esc(row.level)} · ${esc(groupLabels(row.groups))}</p><h2>${esc(k.char)}</h2><p>${esc(k.meanings.join(' / '))}</p></div><button class="remember-btn" data-remember="${esc(row.key)}">✓ nhớ</button></div>
    <div id="strokeTarget" class="stroke-box"></div>
    <section class="detail-section"><h3>Âm On/Kun</h3><div class="reading-grid"><div><b>On</b>${reading(k.onyomi)}</div><div><b>Kun</b>${reading(k.kunyomi)}</div></div></section>
    <section class="detail-section"><h3>Từ vựng chứa 「${esc(k.char)}」</h3>${vocabList(row.words, k.char)}</section>`;
  renderStrokeAnimation($('#strokeTarget'), k.char);
}

function renderKanaDetail(row) {
  const v = row.item;
  detailPanel.innerHTML = `<div class="detail-head"><div><p class="eyebrow">Hiragana thuần</p><h2>${esc(v.word)}</h2><p>${esc(v.kana)} · ${esc(v.meanings.join(' / '))}</p></div><button class="remember-btn" data-remember="${esc(row.key)}">✓ nhớ</button></div>
    <section class="detail-section"><h3>Mẫu đi kèm</h3>${particleList(v, '')}</section>`;
}

function vocabList(words, char) {
  if (!words.length) return '<p class="muted">Chưa có từ ghép trong data.</p>';
  return words.map(v => `<article class="vocab-line"><div><b>${esc(v.word)}</b><span>${esc(v.kana)} · ${esc(v.meanings.join(' / '))}</span></div>${particleList(v, char)}${kanjiButtons(v.word, char)}</article>`).join('');
}

function particleList(v, char) {
  const items = v.particles || DEFAULT_PARTICLES[char] || inferParticles(v);
  return `<ul class="particle-list">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function inferParticles(v) {
  if (v.meanings.some(m => /ăn|uống|đọc|viết|mua|xem|nghe|rửa|giặt|mở|đóng|bán|gửi|dùng|làm|tạo/.test(m))) return [`${v.word}を...`, `場所で${v.word}`];
  if (v.meanings.some(m => /đi|đến|về|vào|ra|sống|tới/.test(m))) return [`場所に/へ${v.word}`, `場所で${v.word}`];
  if (v.meanings.some(m => /cao|thấp|rộng|hẹp|mới|cũ|rẻ|đắt|dài|ngắn|sáng|tối|gần|xa|nhiều|ít/.test(m))) return [`Nは${v.word}です`, `とても${v.word}`, `あまり${v.word}ないです`];
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

function gojuonColumn(kana = '') { const ch = kana[0] || ''; if ('あいうえお'.includes(ch)) return 'あ'; if ('かきくけこがぎぐげご'.includes(ch)) return 'か'; if ('さしすせそざじずぜぞ'.includes(ch)) return 'さ'; if ('たちつてとだぢづでど'.includes(ch)) return 'た'; if ('なにぬねの'.includes(ch)) return 'な'; if ('はひふへほばびぶべぼぱぴぷぺぽ'.includes(ch)) return 'は'; if ('まみむめも'.includes(ch)) return 'ま'; if ('やゆよ'.includes(ch)) return 'や'; if ('らりるれろ'.includes(ch)) return 'ら'; if ('わをん'.includes(ch)) return 'わ'; return '#'; }
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
