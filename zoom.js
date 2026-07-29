(function () {
  const KEY = 'jrr-zoom';
  const DEFAULT = '1';

  function apply(value) {
    const zoom = value || localStorage.getItem(KEY) || DEFAULT;
    if (document.body) {
      document.body.style.zoom = zoom;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply();
  });

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'zoom') {
      apply(event.data.value);
    }
  });
})();
