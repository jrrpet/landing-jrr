(function () {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('edit')) return;

  document.body.contentEditable = 'true';
  document.body.style.outline = '2px dashed #999';
  document.body.style.outlineOffset = '-4px';

  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed; bottom:8px; right:8px; background:#000; color:#fff; padding:6px 8px; font-family:monospace; font-size:12px; z-index:9999; border:1px solid #fff;';
  bar.innerHTML = '<strong>modo edición</strong> ';

  function btn(label, onClick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = 'font-family:monospace; font-size:12px; margin-left:4px; background:#fff; color:#000; border:0; cursor:pointer;';
    b.onclick = onClick;
    return b;
  }

  bar.appendChild(btn('tabla', function () {
    const html = '<table class="tabla"><tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr></table>';
    document.execCommand('insertHTML', false, html);
  }));

  bar.appendChild(btn('guardar', function () {
    const clone = document.documentElement.cloneNode(true);
    const scripts = clone.querySelectorAll('script[src="edit.js"]');
    scripts.forEach(s => s.remove());
    const blob = new Blob([clone.outerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.location.pathname.split('/').pop() || 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  }));

  document.body.appendChild(bar);
})();
