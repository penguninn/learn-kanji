(() => {
  const meaningEditKey = 'kanji-list-study.meaning-edits.v1';

  if (window.USER_MEANING_EDITS && Object.keys(window.USER_MEANING_EDITS).length > 0) {
    localStorage.setItem(meaningEditKey, JSON.stringify(window.USER_MEANING_EDITS));
  }

  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function patchedSetItem(key, value) {
    originalSetItem(key, value);
    if (key !== meaningEditKey) return;

    fetch('/api/meaning-edits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: value
    }).catch(() => {
      console.warn('Không ghi được vào file data. Hãy chạy bằng: npm run dev:file');
    });
  };

  document.addEventListener('keydown', event => {
    const modal = document.querySelector('#detailModal:not(.hidden)');
    if (!modal) return;
    if (event.target?.matches?.('input, textarea, select')) return;
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    const current = document.querySelector('tr.study-row.selected');
    if (!current) return;

    const target = event.key === 'ArrowRight'
      ? current.nextElementSibling
      : current.previousElementSibling;

    if (target?.matches?.('tr.study-row')) {
      event.preventDefault();
      target.click();
    }
  });

  document.addEventListener('click', event => {
    const box = event.target.closest?.('#strokeTarget');
    if (!box) return;
    replayStrokeAnimation(box);
  });

  function replayStrokeAnimation(box) {
    const svg = box.querySelector('svg');
    if (!svg) return;

    const clone = svg.cloneNode(true);
    clone.querySelectorAll('.stroke-path, .stroke-text').forEach(el => {
      el.style.animation = 'none';
      el.getBoundingClientRect();
      el.style.animation = '';
    });

    svg.replaceWith(clone);
  }
})();
