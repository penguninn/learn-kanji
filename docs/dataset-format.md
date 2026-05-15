# Dataset format

Toàn bộ dữ liệu nằm trong `data/kanji-data.js`.

## Kanji item

```js
{
  char: '食',
  level: 'N5',
  meanings: ['ăn'],
  onyomi: ['ショク'],
  kunyomi: ['た.べる', 'く.う']
}
```

`level` có thể là `N5`, `N4`, hoặc `Extra`.

## Vocab item

```js
{
  word: '食事',
  kana: 'しょくじ',
  level: 'N5',
  meanings: ['bữa ăn', 'việc ăn uống'],
  example: '朝、食事をします。'
}
```

`example` không bắt buộc.

## Cách app gom dữ liệu

Nếu từ vựng là `食事`, app sẽ tự đưa từ này vào cả card `食` và card `事` vì chuỗi `word` có chứa 2 Kanji đó.

Vì vậy khi bổ sung data, bạn chỉ cần thêm từ vựng một lần.
