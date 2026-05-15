# Kanji N5/N4 Study Static Web

Web học Kanji JLPT N5/N4 chạy hoàn toàn bằng HTML/CSS/JavaScript, không backend, không database.

## Chức năng

- Chọn cấp độ: N5, N4, Extra
- Tìm kiếm theo Kanji, kana, romaji đơn giản, nghĩa tiếng Việt
- Xem từng Kanji gồm:
  - nghĩa
  - âm On/Kun
  - toàn bộ từ vựng trong data có chứa Kanji đó
  - animation cách viết
- Xem từ vựng gồm:
  - cách đọc
  - nghĩa
  - ví dụ nếu có
  - các Kanji cấu thành
  - từ đồng âm nếu có
- Nhóm từ đồng âm/khác nghĩa, ví dụ:
  - 暑い / 熱い / 厚い = あつい
  - 橋 / 箸 / 端 = はし
  - 帰る / 変える / 返る = かえる
  - 会う / 合う = あう
- Quiz nhanh
- Đánh dấu Kanji đã nhớ bằng localStorage

## Chạy local

Cách nhanh nhất:

```bash
python -m http.server 5173
```

Sau đó mở:

```text
http://localhost:5173
```

Có thể mở trực tiếp `index.html`, nhưng dùng local server sẽ ổn hơn khi tải animation KanjiVG.

## Cấu trúc

```text
.
├── index.html
├── styles.css
├── app.js
├── data/
│   └── kanji-data.js
└── docs/
    └── dataset-format.md
```

## Thêm Kanji/từ mới

Sửa file:

```text
data/kanji-data.js
```

Thêm Kanji vào `kanji`:

```js
{ char: '食', level: 'N5', meanings: ['ăn'], onyomi: ['ショク'], kunyomi: ['た.べる', 'く.う'] }
```

Thêm từ vựng vào `vocab`:

```js
{ word: '食事', kana: 'しょくじ', level: 'N5', meanings: ['bữa ăn'], example: '朝、食事をします。' }
```

App sẽ tự gom từ vựng vào Kanji tương ứng nếu `word` có chứa Kanji đó.

## Push lên GitHub repo mới

Vì connector GitHub hiện không có quyền tạo repo mới, tạo repo bằng GitHub CLI:

```bash
git init
git add .
git commit -m "init kanji n5 n4 study web"
gh repo create kanji-n5-n4-study --public --source=. --remote=origin --push
```

Hoặc tạo repo rỗng trên GitHub web rồi chạy:

```bash
git remote add origin https://github.com/penguninn/kanji-n5-n4-study.git
git branch -M main
git push -u origin main
```

## Ghi chú về animation nét viết

App sẽ thử tải SVG nét viết từ KanjiVG qua GitHub raw. Nếu mạng bị chặn hoặc không có SVG, app tự dùng fallback animation outline bằng SVG text.

Không dùng database. Tiến độ học lưu trong localStorage của trình duyệt.
