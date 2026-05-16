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
    const oldSvg = box.querySelector('svg');
    if (!oldSvg) return;

    const freshSvg = rebuildSvg(oldSvg);
    if (!freshSvg) return;

    box.replaceChildren();

    // Insert on the next paint cycle so CSS animation starts from initial state.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        box.replaceChildren(freshSvg);
      });
    });
  }

  function rebuildSvg(oldSvg) {
    const ns = 'http://www.w3.org/2000/svg';
    const viewBox = oldSvg.getAttribute('viewBox') || '0 0 109 109';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('class', oldSvg.getAttribute('class') || 'stroke-svg');

    const oldPaths = [...oldSvg.querySelectorAll('path[d]')];
    if (oldPaths.length) {
      oldPaths.forEach((oldPath, index) => {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', oldPath.getAttribute('d'));
        path.setAttribute('class', 'stroke-path');
        path.style.animationDelay = oldPath.style.animationDelay || `${index * 0.22}s`;
        svg.appendChild(path);
      });
      return svg;
    }

    const oldText = oldSvg.querySelector('text');
    if (oldText) {
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('class', 'stroke-text');
      text.setAttribute('x', oldText.getAttribute('x') || '125');
      text.setAttribute('y', oldText.getAttribute('y') || '170');
      text.setAttribute('text-anchor', oldText.getAttribute('text-anchor') || 'middle');
      text.textContent = oldText.textContent || '';
      svg.appendChild(text);
      return svg;
    }

    return null;
  }
})();
