(function () {
  'use strict';

  const filename = window.location.pathname.split('/').pop() || 'index.html';
  let isEditing = false;

  const icon = document.createElement('button');
  icon.textContent = '✎';
  icon.title = 'editar página';
  icon.style.cssText = 'position:fixed; bottom:8px; right:8px; width:28px; height:28px; background:#000; color:#fff; border:1px solid #fff; font-family:monospace; font-size:16px; cursor:pointer; z-index:9999; display:flex; align-items:center; justify-content:center;';
  icon.setAttribute('contenteditable', 'false');

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'position:fixed; bottom:42px; right:8px; background:#000; color:#fff; padding:6px; font-family:monospace; font-size:12px; z-index:9999; border:1px solid #fff; display:none; gap:4px;';
  toolbar.setAttribute('contenteditable', 'false');

  function btn(label, title, onClick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.title = title;
    b.style.cssText = 'font-family:monospace; font-size:12px; background:#fff; color:#000; border:0; cursor:pointer; margin-right:4px;';
    b.onclick = onClick;
    return b;
  }

  toolbar.appendChild(btn('B', 'negrita', function () {
    document.execCommand('bold');
  }));

  toolbar.appendChild(btn('tabla', 'insertar tabla', function () {
    const cols = parseInt(prompt('columnas', '2'), 10) || 2;
    const rows = parseInt(prompt('filas', '2'), 10) || 2;
    let html = '<table class="tabla"><tr>';
    for (let c = 0; c < cols; c++) html += '<th>col ' + (c + 1) + '</th>';
    html += '</tr>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td></td>';
      html += '</tr>';
    }
    html += '</table><p></p>';
    document.execCommand('insertHTML', false, html);
  }));

  toolbar.appendChild(btn('guardar', 'guardar cambios', function () {
    save();
  }));

  toolbar.appendChild(btn('cancelar', 'descartar cambios', function () {
    window.location.reload();
  }));

  function toggleEdit() {
    isEditing = !isEditing;
    document.body.contentEditable = isEditing ? 'true' : 'false';
    document.body.style.outline = isEditing ? '2px dashed #999' : 'none';
    toolbar.style.display = isEditing ? 'flex' : 'none';
    icon.textContent = isEditing ? '✕' : '✎';
  }

  icon.onclick = function () {
    toggleEdit();
  };

  function cleanBodyForSave() {
    const clone = document.body.cloneNode(true);
    const ui = [].slice.call(clone.querySelectorAll('[data-editor-ui]'));
    ui.forEach(function (el) { el.remove(); });
    clone.removeAttribute('contenteditable');
    clone.removeAttribute('style');
    return clone.innerHTML.trim();
  }

  function save() {
    const bodyHtml = cleanBodyForSave();
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: filename, body: bodyHtml })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          window.location.reload();
        } else {
          alert('error al guardar: ' + (data.error || 'desconocido'));
        }
      })
      .catch(function (err) {
        alert('error de red: ' + err.message);
      });
  }

  function handlePaste(e) {
    if (!isEditing) return;
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file' && item.type.indexOf('image/') === 0) {
        files.push(item.getAsFile());
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      files.forEach(uploadImage);
    }
  }

  function uploadImage(file) {
    fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-File-Name': file.name
      },
      body: file
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.url) {
          const html = '<img src="' + data.url + '" alt="" style="max-width:100%;"><p></p>';
          document.execCommand('insertHTML', false, html);
        } else {
          alert('error al subir imagen');
        }
      })
      .catch(function (err) {
        alert('error de red: ' + err.message);
      });
  }

  icon.setAttribute('data-editor-ui', '');
  toolbar.setAttribute('data-editor-ui', '');
  document.body.appendChild(icon);
  document.body.appendChild(toolbar);
  document.body.addEventListener('paste', handlePaste);
})();
