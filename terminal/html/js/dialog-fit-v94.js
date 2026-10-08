(function () {
  'use strict';
  function fit(element) {
    if (!element || getComputedStyle(element).display === 'none') return;
    var height = Math.max(element.offsetHeight, element.scrollHeight);
    var width = Math.max(element.offsetWidth, element.scrollWidth);
    var scale = Math.min(1, (innerHeight - 32) / height, (innerWidth - 32) / width);
    var value = String(scale);
    if (element.style.getPropertyValue('--dialog-fit') !== value) element.style.setProperty('--dialog-fit', value);
  }
  function fitAll() { document.querySelectorAll('.window, dialog[open]').forEach(fit); }
  window.addEventListener('load', function () {
    var policy = document.getElementById('personal_data_content');
    if (policy) {
      var pages = document.createElement('div'); pages.className = 'policy-pages';
      while (policy.firstChild) pages.appendChild(policy.firstChild);
      policy.appendChild(pages);
      var navigation = document.createElement('div'); navigation.className = 'policy-navigation';
      var prev = document.createElement('button'), next = document.createElement('button'), label = document.createElement('span');
      prev.textContent = 'Назад'; next.textContent = 'Далее'; label.setAttribute('aria-live', 'polite');
      navigation.appendChild(prev);navigation.appendChild(label);navigation.appendChild(next);policy.after(navigation);
      var page = 0;
      function update() {
        var width = policy.clientWidth;
        if (!width) return;
        pages.style.columnWidth = width + 'px';
        var count = Math.max(1, Math.round((pages.scrollWidth + 32) / (width + 32)));
        page = Math.min(page, count - 1);
        pages.style.transform = 'translateX(-' + (page * (width + 32)) + 'px)';
        prev.disabled = page === 0; next.disabled = page >= count - 1;
        label.textContent = (page + 1) + ' / ' + count;
      }
      prev.onclick = function () { page = Math.max(0, page - 1); update(); };
      next.onclick = function () { page++; update(); };
      new ResizeObserver(update).observe(policy);
    }
    var scheduled = false;
    new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;requestAnimationFrame(function () { scheduled = false;fitAll(); });
    }).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['style','class','open']});
    fitAll();
  });
  window.addEventListener('resize', fitAll);
})();
