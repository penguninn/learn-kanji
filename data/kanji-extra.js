// Bổ sung các chữ/từ còn thiếu để 6 nhóm học luôn hiển thị đủ.
(() => {
  const data = window.KANJI_DATA;
  const hasKanji = ch => data.kanji.some(k => k.char === ch);
  const hasVocab = (word, kana) => data.vocab.some(v => v.word === word && v.kana === kana);

  const extraKanji = [
    { char: '作', level: 'N4', meanings: ['làm', 'tạo ra'], onyomi: ['サク', 'サ'], kunyomi: ['つく.る'] },
    { char: '朝', level: 'N5', meanings: ['buổi sáng'], onyomi: ['チョウ'], kunyomi: ['あさ'] },
    { char: '昼', level: 'N5', meanings: ['buổi trưa'], onyomi: ['チュウ'], kunyomi: ['ひる'] },
    { char: '晩', level: 'N5', meanings: ['buổi tối'], onyomi: ['バン'], kunyomi: [] },
    { char: '夜', level: 'N5', meanings: ['đêm'], onyomi: ['ヤ'], kunyomi: ['よる'] },
    { char: '族', level: 'N5', meanings: ['gia đình', 'bộ tộc'], onyomi: ['ゾク'], kunyomi: [] },
    { char: '私', level: 'N5', meanings: ['tôi'], onyomi: ['シ'], kunyomi: ['わたし'] },
    { char: '店', level: 'N5', meanings: ['cửa hàng'], onyomi: ['テン'], kunyomi: ['みせ'] },
    { char: '道', level: 'N5', meanings: ['đường'], onyomi: ['ドウ'], kunyomi: ['みち'] },
    { char: '町', level: 'N5', meanings: ['thị trấn', 'khu phố'], onyomi: ['チョウ'], kunyomi: ['まち'] },
    { char: '村', level: 'N5', meanings: ['làng'], onyomi: ['ソン'], kunyomi: ['むら'] },
    { char: '市', level: 'N5', meanings: ['thành phố', 'chợ'], onyomi: ['シ'], kunyomi: ['いち'] },
    { char: '大', level: 'N5', meanings: ['to', 'lớn'], onyomi: ['ダイ', 'タイ'], kunyomi: ['おお.きい'] },
    { char: '小', level: 'N5', meanings: ['nhỏ'], onyomi: ['ショウ'], kunyomi: ['ちい.さい', 'こ'] },
    { char: '弱', level: 'N4', meanings: ['yếu'], onyomi: ['ジャク'], kunyomi: ['よわ.い'] }
  ];

  const extraVocab = [
    { word: '作ります', kana: 'つくります', level: 'N4', meanings: ['làm', 'tạo ra'], particles: ['Nを作ります', '材料で作ります', '人にNを作ります'] },
    { word: '朝', kana: 'あさ', level: 'N5', meanings: ['buổi sáng'], particles: ['朝に起きます', '朝ご飯を食べます'] },
    { word: '昼', kana: 'ひる', level: 'N5', meanings: ['buổi trưa'], particles: ['昼に食べます', '昼ご飯を食べます'] },
    { word: '今晩', kana: 'こんばん', level: 'N5', meanings: ['tối nay'], particles: ['今晩、勉強します', '今晩は暇です'] },
    { word: '夜', kana: 'よる', level: 'N5', meanings: ['buổi tối', 'đêm'], particles: ['夜に寝ます', '夜まで勉強します'] },
    { word: '私', kana: 'わたし', level: 'N5', meanings: ['tôi'], particles: ['私は学生です', '私の本です'] },
    { word: '店', kana: 'みせ', level: 'N5', meanings: ['cửa hàng'], particles: ['店で買います', '店に行きます'] },
    { word: '道', kana: 'みち', level: 'N5', meanings: ['đường'], particles: ['道を歩きます', '道で会います'] },
    { word: '町', kana: 'まち', level: 'N5', meanings: ['thị trấn', 'khu phố'], particles: ['町に住んでいます', '町を歩きます'] },
    { word: '村', kana: 'むら', level: 'N5', meanings: ['làng'], particles: ['村に住んでいます', '村へ帰ります'] },
    { word: '市', kana: 'し', level: 'N5', meanings: ['thành phố'], particles: ['市に住んでいます', '市へ行きます'] },
    { word: '大きい', kana: 'おおきい', level: 'N5', meanings: ['to', 'lớn'], particles: ['Nは大きいです', 'とても大きいです'] },
    { word: '小さい', kana: 'ちいさい', level: 'N5', meanings: ['nhỏ'], particles: ['Nは小さいです', 'あまり小さくないです'] },
    { word: '弱い', kana: 'よわい', level: 'N4', meanings: ['yếu'], particles: ['Nは弱いです', 'Nに弱いです'] },
    { word: '家族', kana: 'かぞく', level: 'N5', meanings: ['gia đình'], particles: ['家族と住んでいます', '家族に会います'] }
  ];

  extraKanji.forEach(k => { if (!hasKanji(k.char)) data.kanji.push(k); });
  extraVocab.forEach(v => { if (!hasVocab(v.word, v.kana)) data.vocab.push(v); });
})();
