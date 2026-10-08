(function () {
  'use strict';
  
  window.addEventListener('load', function () {
    var input = document.getElementById('promocode_input');
    var keyboard = document.getElementById('promo_keyboard');
    var originalApply = window.applyEnterPromoCode;
    function render() {
      keyboard.innerHTML = '';
      var rows = ['123', '456', '789'];
      rows.forEach(function (row) {
        var line = document.createElement('div'); line.className = 'promo-key-row';
        Array.from(row).forEach(function (key) { addKey(line, key, function () { edit(key); }); });
        keyboard.appendChild(line);
      });
      var line = document.createElement('div'); line.className = 'promo-key-row promo-tools';
      addKey(line, 'Очистить', function () { input.value = ''; input.focus(); });
      addKey(line, '0', function () { edit('0'); });
      addKey(line, '⌫', function () { edit(null); });
      keyboard.appendChild(line);
    }
    function addKey(line, label, action) {
      var button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      if (label === '⌫') button.setAttribute('aria-label', 'Удалить символ');
      button.addEventListener('mousedown', function (e) { e.preventDefault(); });
      button.addEventListener('click', action); line.appendChild(button);
    }
    function edit(value) {
      var start = input.selectionStart, end = input.selectionEnd;
      if (value === null && start === end) start = Math.max(0, start - 1);
      var next = input.value.slice(0, start) + (value || '') + input.value.slice(end);
      if (next.length > input.maxLength) return;
      input.value = next; input.focus(); input.setSelectionRange(start + (value || '').length, start + (value || '').length);
      input.dispatchEvent(new Event('input', {bubbles:true}));
    }
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('pattern', '[0-9]*');
    input.addEventListener('input', function () { input.value = input.value.replace(/[^0-9]/g, ''); });
    render();
    window.addPromoCode = function () {
      input.value = ''; document.getElementById('promocode_result_msg').textContent = '';
      openModal('#promocode_dialog'); setTimeout(function () { input.focus(); }, 220);
    };
    window.applyEnterPromoCode = function () {
      input.value = input.value.replace(/[^0-9]/g, '');
      var message = document.getElementById('promocode_result_msg');
      if (!input.value) { message.textContent = 'Введите промокод'; input.focus(); return; }
      if (window.paymentPreviewEnabled) {
        message.textContent = 'Деморежим: проверка промокода доступна после подключения к ПО.';
        return;
      }
      originalApply();
    };
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); window.applyEnterPromoCode(); }
      if (event.key === 'Escape') closeModal();
    });
    if (window.paymentPreviewEnabled) document.getElementById('btn_promocode').disabled = false;
  });
})();
