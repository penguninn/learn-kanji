// Loader chung cho data import từ Quizlet Minna.
// Mỗi bài gọi: window.importMinnaLesson(lessonNumber, setId, `KANJI|KANA\n...`)
(() => {
  const data = window.KANJI_DATA;
  const isKanji = ch => /[一-龯]/.test(ch);
  const hasKanji = ch => data.kanji.some(k => k.char === ch);

  window.importMinnaLesson = function importMinnaLesson(lesson, setId, raw) {
    const source = `Quizlet Minna bài ${lesson} - ${setId}`;
    const lines = raw.split('\n').map(x => x.trim()).filter(Boolean);

    for (const line of lines) {
      const [wordRaw, kanaRaw] = line.split('|').map(x => (x || '').trim());
      if (!wordRaw || !kanaRaw) continue;
      if (wordRaw === 'Kanji' || kanaRaw === 'Từ vựng') continue;

      const word = wordRaw.replace(/。$/g, '');
      const kana = kanaRaw.replace(/。$/g, '');
      const existed = data.vocab.find(v => v.word === word && v.kana === kana);

      if (existed) {
        existed.lessons = Array.from(new Set([...(existed.lessons || []), lesson])).sort((a, b) => a - b);
        existed.lesson = existed.lessons[0];
        existed.source = existed.source || source;
      } else {
        data.vocab.push({
          word,
          kana,
          level: 'N5',
          meanings: [`Quizlet bài ${lesson}`],
          lesson,
          lessons: [lesson],
          source,
          particles: inferPatterns(word, kana)
        });
      }

      for (const ch of [...word].filter(isKanji)) {
        if (!hasKanji(ch)) {
          data.kanji.push({
            char: ch,
            level: 'N5',
            meanings: [`Quizlet: ${word}`],
            onyomi: [],
            kunyomi: []
          });
        }
      }
    }
  };

  function inferPatterns(word, kana) {
    if (/ます$|ました$|する$|します$|下さい$|ください$/.test(word)) return [`Nを${word}`, `場所で${word}`];
    if (/時|分|朝|昼|晩|夜|昨日|今日|明日|毎/.test(word)) return [`${word}に...`, `${word}です`];
    if (/駅|学校|大学|病院|銀行|図書館|美術館|会社|教室|食堂|部屋|国|家|売り場|地下/.test(word)) return [`${word}へ/に行きます`, `${word}で...`, `${word}はどこですか`];
    if (/歳|番|番号/.test(word)) return [`${word}です`, `${word}ですか`];
    return [`${word}です`, `${word}があります`];
  }
})();
