(() => {
  installSyncButton();
  installArrowNavigation();
  installStrokeReplay();
  installModalCleanup();

  function installSyncButton() {
    queueMicrotask(() => {
      if (document.querySelector('#syncDataBtn')) return;
      const resetBtn = document.querySelector('#resetProgressBtn');
      const btn = document.createElement('button');
      btn.id = 'syncDataBtn';
      btn.className = 'plain-btn';
      btn.textContent = 'Đồng bộ data';
      btn.title = 'Ghi cứng nghĩa đang hiển thị vào các file data/quizlet-minna-bai-XX-lines.js';
      resetBtn?.insertAdjacentElement('beforebegin', btn);
      btn.addEventListener('click', syncDataToFiles);
    });
  }

  async function syncDataToFiles() {
    const btn = document.querySelector('#syncDataBtn');
    const originalText = btn?.textContent || 'Đồng bộ data';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Đang đồng bộ...';
    }

    try {
      const vocab = (window.KANJI_DATA?.vocab || [])
        .filter(v => v.word && v.kana && (v.lesson || v.lessons?.length))
        .map(v => ({
          word: v.word,
          kana: v.kana,
          meaning: (v.meanings || []).join(' / '),
          lessons: v.lessons || (v.lesson ? [v.lesson] : [])
        }));

      const response = await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocab, hanViet: window.HAN_VIET || {} })
      });

      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      alert(`Đã đồng bộ ${result.updated} dòng vào file data. Reload trang để đọc data cứng mới.`);
    } catch (error) {
      alert('Không đồng bộ được. Hãy chạy bằng npm run dev:file.\n\n' + (error?.message || error));
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }

  function installArrowNavigation() {
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
  }

  function installStrokeReplay() {
    document.addEventListener('click', event => {
      const box = event.target.closest?.('#strokeTarget');
      if (!box) return;
      replayStrokeAnimation(box);
    });
  }

  function installModalCleanup() {
    const observer = new MutationObserver(() => {
      hideEditUi();
      injectHanVietInfo();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function hideEditUi() {
    document.querySelectorAll('[data-edit-meaning], [data-reset-meaning], .meaning-editor').forEach(el => el.remove());
    document.querySelectorAll('.detail-section h3').forEach(h3 => {
      if (h3.textContent.trim() === 'Sửa nghĩa') h3.closest('.detail-section')?.remove();
    });
  }

  function injectHanVietInfo() {
    const modal = document.querySelector('#detailModal:not(.hidden)');
    if (!modal || modal.querySelector('.han-viet-line')) return;
    const title = modal.querySelector('.detail-head h2:not(.kana-title)');
    const char = title?.textContent?.trim();
    if (!char || char.length !== 1) return;
    const hv = window.HAN_VIET?.[char];
    if (!hv) return;
    title.insertAdjacentHTML('afterend', `<p class="han-viet-line"><b>Hán-Việt:</b> ${escapeHtml(hv)}</p>`);
  }

  function replayStrokeAnimation(box) {
    const oldSvg = box.querySelector('svg');
    if (!oldSvg) return;

    const freshSvg = rebuildSvg(oldSvg);
    if (!freshSvg) return;

    box.replaceChildren();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => box.replaceChildren(freshSvg));
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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[s]));
  }
})();
