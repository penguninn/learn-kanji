// Import từ Quizlet set: kanji minna bai 1
// URL: https://quizlet.com/vn/1166182886/kanji-minna-bai-1-flash-cards/
(() => {
  const data = window.KANJI_DATA;
  const source = 'Quizlet - kanji minna bai 1 - 1166182886';
  const hasVocab = (word, kana) => data.vocab.some(v => v.word === word && v.kana === kana);
  const hasKanji = ch => data.kanji.some(k => k.char === ch);
  const isKanji = ch => /[一-龯]/.test(ch);

  const importedVocab = [
    ['私', 'わたし', 'tôi'],
    ['私達', 'わたしたち', 'chúng tôi / chúng ta'],
    ['貴方', 'あなた', 'bạn'],
    ['あの人', 'あのひと', 'người kia'],
    ['あの方', 'あのかた', 'vị kia / người kia, lịch sự'],
    ['皆さん', 'みなさん', 'mọi người / các bạn'],
    ['～君', '～くん', 'hậu tố gọi thân mật, thường dùng với nam'],
    ['～人', '～じん', 'người nước nào đó'],
    ['先生', 'せんせい', 'giáo viên / thầy cô'],
    ['教師', 'きょうし', 'giáo viên, dùng để nói nghề của mình'],
    ['学生', 'がくせい', 'học sinh / sinh viên'],
    ['会社員', 'かいしゃいん', 'nhân viên công ty'],
    ['社員', 'しゃいん', 'nhân viên công ty'],
    ['銀行員', 'ぎんこういん', 'nhân viên ngân hàng'],
    ['医者', 'いしゃ', 'bác sĩ'],
    ['研究者', 'けんきゅうしゃ', 'nhà nghiên cứu'],
    ['大学', 'だいがく', 'đại học'],
    ['病院', 'びょういん', 'bệnh viện'],
    ['電気', 'でんき', 'điện'],
    ['誰', 'だれ', 'ai'],
    ['何方', 'どなた', 'vị nào / ai, lịch sự'],
    ['～歳', '～さい', 'tuổi'],
    ['何歳', 'なんさい', 'mấy tuổi / bao nhiêu tuổi'],
    ['御幾つ', 'おいくつ', 'bao nhiêu tuổi, lịch sự'],
    ['韓国', 'かんこく', 'Hàn Quốc'],
    ['中国', 'ちゅうごく', 'Trung Quốc'],
    ['日本', 'にほん', 'Nhật Bản'],
    ['失礼ですが', 'しつれいですが', 'xin lỗi / thất lễ nhưng...'],
    ['お名前は？', 'おなまえは？', 'tên bạn là gì?'],
    ['初めまして', 'はじめまして', 'rất hân hạnh được gặp lần đầu'],
    ['どうぞ宜しくお願いします', 'どうぞよろしくおねがいします', 'rất mong được giúp đỡ / rất hân hạnh'],
    ['～から来ました', '～からきました', 'đến từ...']
  ];

  const imported = importedVocab.map(([word, kana, meaning]) => ({
    word,
    kana,
    level: 'N5',
    meanings: [meaning],
    source,
    particles: inferPatterns(word, kana)
  }));

  imported.forEach(v => {
    if (!hasVocab(v.word, v.kana)) data.vocab.push(v);
  });

  imported.forEach(v => {
    [...v.word].filter(isKanji).forEach(ch => {
      if (!hasKanji(ch)) {
        data.kanji.push({
          char: ch,
          level: 'N5',
          meanings: [`Quizlet bài 1: ${v.word}`],
          onyomi: [],
          kunyomi: []
        });
      }
    });
  });

  function inferPatterns(word, kana) {
    if (word.includes('歳')) return [`${word}です`, `${word}ですか`, `${word}になります`];
    if (word.includes('国') || word === '日本' || word === '中国') return [`${word}から来ました`, `${word}の人です`, `${word}へ/に行きます`];
    if (word.includes('員') || word.includes('者') || word === '先生' || word === '教師' || word === '学生') return [`私は${word}です`, `${word}ではありません`, `${word}ですか`];
    if (word.includes('大学') || word.includes('病院')) return [`${word}へ/に行きます`, `${word}で勉強します/働きます`, `${word}はどこですか`];
    if (word.includes('名前')) return [`お名前は？`, `私の名前は...です`];
    if (word.includes('来ました')) return [`国から来ました`, `会社から来ました`];
    return [`${word}です`, `${word}ではありません`, `${word}ですか`];
  }
})();
