// Import từ Quizlet folder Kanji Minna 1 N5 / set 1128289878.
// Dữ liệu gốc trong Quizlet dùng nghĩa tiếng Indonesia, nên file này giữ nguyên nghĩa gốc.
(() => {
  const data = window.KANJI_DATA;
  const source = 'Quizlet Minhhi92 - kanji Minna 1';
  const hasVocab = (word, kana) => data.vocab.some(v => v.word === word && v.kana === kana);
  const hasKanji = ch => data.kanji.some(k => k.char === ch);
  const isKanji = ch => /[一-龯]/.test(ch);

  const importedVocab = [
    ['何歳', 'なんさい', 'umur berapa'],
    ['歳', 'さい', 'umur'],
    ['失礼', 'しつれい', 'tidak sopan'],
    ['失礼ですが', 'しつれいですが', 'maaf jika kurang sopan'],
    ['失礼します', 'しつれいします', 'permisi'],
    ['初めて', 'はじめて', 'pertama kali'],
    ['初めまして', 'はじめまして', 'senang bertemu dengan anda'],
    ['辞書', 'じしょ', 'kamus'],
    ['手帳', 'てちょう', 'buku agenda pribadi'],
    ['名刺', 'めいし', 'kartu nama'],
    ['雑誌', 'ざっし', 'majalah'],
    ['お世話になります', 'おせわになります', 'mohon bimbingannya'],
    ['お土産', 'おみやげ', 'oleh-oleh'],
    ['自動販売機', 'じどうはんばいき', 'mesin penjual otomatis'],
    ['食堂', 'しょくどう', 'kantin'],
    ['会議室', 'かいぎしつ', 'ruang rapat'],
    ['事務所', 'じむしょ', 'kantor'],
    ['階段', 'かいだん', 'tangga'],
    ['大阪', 'おおさか', 'kota Osaka'],
    ['部屋', 'へや', 'kamar'],
    ['試験', 'しけん', 'ujian'],
    ['美術館', 'びじゅつかん', 'galeri seni'],
    ['新幹線', 'しんかんせん', 'kereta cepat'],
    ['誕生日', 'たんじょうび', 'hari ulang tahun'],
    ['北海道', 'ほっかいど', 'Hokkaido'],
    ['広島', 'ひろしま', 'Hiroshima'],
    ['お酒', 'おさけ', 'minuman sake / alkohol'],
    ['紅茶', 'こうちゃ', 'teh hitam'],
    ['新聞', 'しんぶん', 'koran'],
    ['石', 'いし', 'batu'],
    ['庭', 'にわ', 'halaman'],
    ['手紙', 'てがみ', 'surat'],
    ['年賀状', 'ねんがじょ', 'kartu ucapan tahun baru'],
    ['切符', 'きっぷ', 'tiket'],
    ['お上がりください', 'おあがりください', 'silakan masuk / naik'],
    ['荷物', 'にもつ', 'barang bawaan'],
    ['宿題', 'しゅくだい', 'PR / pekerjaan rumah'],
    ['時々', 'ときどき', 'kadang-kadang'],
    ['易しい', 'やさしい', 'baik hati / lembut / mudah'],
    ['地下鉄', 'ちかてつ', 'kereta bawah tanah'],
    ['寮', 'りょう', 'asrama'],
    ['暇', 'ひま', 'senggang / waktu luang'],
    ['全然', 'ぜんぜん', 'tidak sama sekali / tidak pernah'],
    ['細かい', 'こまかい', 'uang kecil / hal kecil / detail'],
    ['野球', 'やきゅう', 'baseball'],
    ['約束', 'やくそく', 'janji'],
    ['主人', 'しゅじん', 'suami'],
    ['残念', 'ざんねん', 'sayang sekali / maaf'],
    ['奥さん', 'おくさん', 'istri'],
    ['喫茶店', 'きっさてん', 'kafe tradisional Jepang'],
    ['冷蔵庫', 'れいぞうこ', 'kulkas'],
    ['窓', 'まど', 'jendela'],
    ['箱', 'はこ', 'kotak'],
    ['象', 'ぞう', 'gajah'],
    ['電池', 'でんち', 'baterai'],
    ['隣', 'となり', 'sebelah'],
    ['切手', 'きって', 'perangko'],
    ['お出かけ', 'おでかけ', 'jalan-jalan / bepergian'],
    ['船便', 'ふなびん', 'pengiriman laut'],
    ['航空便', 'こうくうびん', 'pengiriman udara'],
    ['飛行機', 'ひこうき', 'pesawat'],
    ['封筒', 'ふうとう', 'amplop'],
    ['葉書', 'はがき', 'kartu pos'],
    ['撮ります', 'とります', 'mengambil gambar'],
    ['疲れる', 'つかれる', 'capek / lelah'],
    ['暖かい', 'あたたかい', 'hangat'],
    ['簡単', 'かんたん', 'mudah / gampang'],
    ['曇り', 'くもり', 'berawan'],
    ['果物', 'くだもの', 'buah-buahan'],
    ['棚', 'たな', 'rak / lemari'],
    ['～杯', 'っぱい', 'jumlah gelas / counter gelas'],
    ['美術', 'びじゅつ', 'seni'],
    ['欲しい', 'ほしい', 'ingin'],
    ['散歩します', 'さんぽします', 'jalan-jalan'],
    ['食事', 'しょくじ', 'makan / makan teratur'],
    ['釣り', 'つり', 'memancing ikan'],
    ['迎えます', 'むかえます', 'menjemput'],
    ['狭い', 'せまい', 'sempit'],
    ['降る', 'ふる', 'turun untuk hujan/salju'],
    ['信号', 'しんごう', 'lampu lalu lintas'],
    ['曲がる', 'まがる', 'berbelok'],
    ['座る', 'すわる', 'duduk'],
    ['呼ぶ', 'よぶ', 'memanggil'],
    ['電子辞書', 'でんしじしょ', 'kamus elektronik'],
    ['市役所', 'しやくしょ', 'kantor balai kota'],
    ['独身', 'どくしん', 'single / lajang'],
    ['教師', 'きょうし', 'pengajar / guru'],
    ['鉛筆', 'えんぴつ', 'pensil'],
    ['知る', 'しる', 'tahu / kenal'],
    ['研究', 'けんきゅう', 'penelitian'],
    ['経済', 'けいざい', 'ekonomi'],
    ['歯医者', 'はいしゃ', 'dokter gigi'],
    ['髪', 'かみ', 'rambut'],
    ['神', 'かみ', 'dewa'],
    ['次', 'つぎ', 'selanjutnya'],
    ['金額', 'きんがく', 'jumlah / nominal uang'],
    ['確認', 'かくにん', 'konfirmasi / memastikan'],
    ['乗り換えます', 'のりかえます', 'transit / berganti kendaraan'],
    ['緑', 'みどり', 'hijau'],
    ['背', 'せ', 'punggung'],
    ['お寺', 'おてら', 'kuil Buddha'],
    ['浴びる', 'あびる', 'mandi'],
    ['大丈夫', 'だいじょうぶ', 'baik-baik saja / tidak apa-apa'],
    ['出張する', 'しゅっちょうする', 'dinas keluar kota'],
    ['払う', 'はらう', 'membayar'],
    ['お大事に', 'おだいじに', 'jaga diri / lekas sembuh'],
    ['置く', 'おく', 'menaruh / meletakkan'],
    ['覚える', 'おぼえる', 'mengingat / menghafal'],
    ['脱ぎます', 'ぬぎます', 'melepaskan pakaian'],
    ['反対', 'はんたい', 'berlawanan / kebalikan'],
    ['趣味', 'しゅみ', 'hobi'],
    ['動物', 'どうぶつ', 'binatang'],
    ['空港', 'くうこう', 'bandara'],
    ['祈り', 'いのり', 'doa'],
    ['お祈りします', 'おいのりします', 'berdoa'],
    ['掃除', 'そうじ', 'bersih-bersih'],
    ['富士山', 'ふじさん', 'Gunung Fuji'],
    ['着物', 'きもの', 'kimono'],
    ['物価', 'ぶっか', 'harga barang'],
    ['意見', 'いけん', 'pendapat'],
    ['自動車', 'じどうしゃ', 'mobil'],
    ['忘れる', 'わすれる', 'lupa'],
    ['探す', 'さがす', 'mencari'],
    ['家賃', 'やちん', 'sewa rumah'],
    ['眼鏡', 'めがね', 'kacamata'],
    ['帽子', 'ぼうし', 'topi'],
    ['お釣り', 'おつり', 'kembalian']
  ];

  const imported = importedVocab.map(([word, kana, meaning]) => ({
    word,
    kana,
    level: 'N5',
    meanings: [meaning],
    source,
    particles: inferParticles(word, meaning)
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
          meanings: [`Quizlet: ${v.word}`],
          onyomi: [],
          kunyomi: []
        });
      }
    });
  });

  function inferParticles(word, meaning) {
    if (/ます$|る$|する$|ぶ$|う$|く$/.test(word)) {
      if (/membayar|lupa|mencari|mengambil|menjemput|memanggil|menaruh|mengingat|menghafal|melepaskan|berdoa|jalan-jalan/.test(meaning)) {
        return [`Nを${word}`, `場所で${word}`];
      }
      if (/transit|berbelok|duduk|turun/.test(meaning)) return [`場所で${word}`, `場所に${word}`];
    }
    if (/い$/.test(word)) return [`Nは${word}です`, `とても${word}です`, `あまり${word}くないです`];
    if (/店|館|室|所|屋|寺|港|寮|庭|大阪|北海道|広島|富士山/.test(word)) return [`場所にあります`, `${word}へ/に行きます`, `${word}で...`];
    if (/歳|誕生日|時々/.test(word)) return [`${word}です`, `${word}に...`];
    return [`Nは${word}です`, `${word}があります`];
  }
})();
