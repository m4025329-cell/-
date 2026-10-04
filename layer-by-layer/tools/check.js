/* Проверка вёрстки: текстовые блоки не должны накладываться друг на друга и выходить за экран */
module.exports=`(() => {
  const modal = document.querySelector('#modal .modal');
  const skip = el => el.closest('svg,canvas,script,style,#fx,#actionbar,#toast,.sr-only,.skip,[hidden]') || (modal && !modal.contains(el));
  const items = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const tx = n.nodeValue.trim(); if (!tx) continue;
    const el = n.parentElement; if (!el || skip(el)) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const fs = parseFloat(cs.fontSize) || 14, pad = 0.17 * fs; /* поля у строки: чернила глифов занимают не весь ящик */
    for (const r of rg.getClientRects()) { if (r.width < 3 || r.height < 6) continue; items.push({el, tx: tx.slice(0, 28), l: r.left, t: r.top + scrollY + pad, r: r.right, b: r.bottom + scrollY - pad}); }
  }
  const bad = [];
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (a.r > innerWidth + 1 || a.l < -1) bad.push('вне экрана: «' + a.tx + '»');
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]; if (a.el === b.el) continue;
      const iw = Math.min(a.r, b.r) - Math.max(a.l, b.l), ih = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (iw > 2 && ih > 3) {
        const small = Math.min((a.r - a.l) * (a.b - a.t), (b.r - b.l) * (b.b - b.t));
        if (iw * ih > 0.25 * small) bad.push('наложение: «' + a.tx + '» и «' + b.tx + '»');
      }
    }
  }
  return bad.slice(0, 6);
})()`;
