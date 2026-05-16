import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const lessonFiles = fs.readdirSync(dataDir).filter(f => /^quizlet-minna-bai-\d{2}-lines\.js$/.test(f)).sort();

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dataDir, 'han-viet.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(dataDir, 'kanji-meta.js'), 'utf8'), sandbox);

const HAN_VIET = sandbox.window.HAN_VIET || {};
const KANJI_META = sandbox.window.KANJI_META || {};

const GROUP_MAP = {
  verbs: [...'行来帰食飲見聞読書買会話作使待持入出休思考知言教習働住歩走開閉始終売貸借送洗着'],
  time: [...'日月火水木金土曜年時分今毎朝昼晩夜午前後間昨'],
  people_life: [...'人男女子友父母兄姉弟妹家族私名生先医者学生先生会社員'],
  places: [...'国学校会社店駅道町村市外中上下左右東西南北大学病院銀行図書館'],
  adjectives: [...'大小新古高安長短多少早明暗近遠広狭強弱']
};

const getGroup = (ch) => {
  for (const [group, chars] of Object.entries(GROUP_MAP)) if (chars.includes(ch)) return group;
  return 'other';
};

const LEVEL_HINTS = {
  N5: new Set('一二三四五六七八九十百千万円日時分先学生人月火水木金土曜年語読書食飲行来帰見聞話買会社国名何私友間半今午前後毎週'.split(''))
};

const hasKanji = (s) => /[一-龯々]/.test(s);
const extractKanji = (s) => [...new Set((s.match(/[一-龯々]/g) || []))];

const lessons = [];
for (const file of lessonFiles) {
  const raw = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const m = raw.match(/importMinnaLesson\((\d+),\s*(\d+),\s*`([\s\S]*?)`\s*\)/);
  if (!m) continue;
  const lesson = Number(m[1]);
  const setId = Number(m[2]);
  const lines = m[3].split('\n').map(x => x.trim()).filter(Boolean);
  const vocab = lines.map(line => {
    const [word, kana, meaning = ''] = line.split('|').map(x => (x || '').trim());
    return { word, kana, meaning };
  }).filter(v => v.word && v.kana && v.word !== 'Kanji');
  lessons.push({ lesson, setId, vocab });
}

const kanjiSet = new Map();
for (const l of lessons) for (const v of l.vocab) for (const ch of extractKanji(v.word)) {
  if (!kanjiSet.has(ch)) kanjiSet.set(ch, { char: ch, words: [] });
  kanjiSet.get(ch).words.push({ lesson: l.lesson, word: v.word, kana: v.kana, meaning: v.meaning });
}

const master = [...kanjiSet.values()].sort((a,b)=>a.char.localeCompare(b.char,'ja')).map(k => {
  const meta = KANJI_META[k.char] || {};
  const level = LEVEL_HINTS.N5.has(k.char) ? 'N5' : 'N4';
  return {
    char: k.char,
    hanViet: HAN_VIET[k.char] || '',
    onyomi: meta.onyomi || [],
    kunyomi: meta.kunyomi || [],
    level,
    group: getGroup(k.char),
    examples: k.words.slice(0, 5)
  };
});

fs.writeFileSync(path.join(dataDir, 'minna-lessons-n5.js'), `window.MINNA_LESSONS_N5 = ${JSON.stringify(lessons, null, 2)};\n`);
fs.writeFileSync(path.join(dataDir, 'kanji-master.js'), `window.KANJI_MASTER = ${JSON.stringify(master, null, 2)};\n`);
console.log(`Generated minna-lessons-n5.js (${lessons.length} lessons)`);
console.log(`Generated kanji-master.js (${master.length} kanji)`);
