(function () {
 window.paymentPreviewEnabled = !!(window.paymentPreviewConfig && window.paymentPreviewConfig.enabled);
 if (!window.paymentPreviewEnabled) return;
 var method = 'card';
 function enable() {
  ['btn_by_card','btn_by_sbp','btn_pay'].forEach(function(id){var el=document.getElementById(id);if(el)el.disabled=false;});
  ['card','sbp'].forEach(function(value){var el=document.getElementById(value==='card'?'btn_by_card':'btn_by_sbp');if(el){el.style.outline=method===value?'3px solid #ef3f43':'none';el.setAttribute('aria-pressed',String(method===value));}});
 }
 // В деморежиме не запускаем связь с платёжным оборудованием.
 window.setCashmachineEnabled = function () {};
 window.updateCostField = function () { document.getElementById('paymentCost').textContent=commonCost;enable(); };
 window.payByCard = function () { method='card';enable();showDialog('card'); };
 window.payBySbp = function () { method='sbp';enable();showDialog('sbp'); };
 window.pay = function () { showDialog('cash'); };
 
 var dialog, previousFocus;
 function closeDialog(){dialog.close();if(previousFocus)previousFocus.focus();}
 function showDialog(kind){
  previousFocus=document.activeElement;
  var titles={card:'Оплата картой',sbp:'Оплата через СБП',cash:'Оплата наличными'};
  var instructions={card:'Приложите карту или телефон к банковскому терминалу',sbp:'Наведите камеру телефона на QR-код для оплаты',cash:'Внесите купюры в купюроприёмник терминала'};
  dialog.querySelector('h2').textContent=titles[kind];
  dialog.querySelector('.preview-amount').textContent=commonCost+' ₽';
  dialog.querySelector('.preview-instruction').textContent=instructions[kind];
  dialog.querySelector('.preview-sbp').hidden=kind!=='sbp';
  dialog.querySelector('.preview-complete').onclick=function(){location.href='ticket.html?demoPayment=true&method='+kind;};
  dialog.showModal();
 }

 window.addEventListener('load',function(){
  dialog=document.createElement('dialog');dialog.className='preview-payment-dialog';dialog.setAttribute('aria-labelledby','preview-payment-title');
  dialog.innerHTML='<div class="preview-modal-body"><h2 id="preview-payment-title"></h2><div class="preview-caption">К оплате</div><div class="preview-amount"></div><p class="preview-instruction"></p><div class="preview-sbp" hidden><img src="images/sbp_short.png" alt="СБП"><p>QR-код появится после подключения<br>платёжного сервиса</p></div><p class="preview-disclaimer">Демонстрация · деньги не списываются</p><div class="preview-modal-actions"><button class="preview-cancel">Отмена</button><button class="preview-complete">Завершить демо</button></div></div>';
  document.body.appendChild(dialog);dialog.querySelector('.preview-cancel').onclick=closeDialog;dialog.addEventListener('cancel',function(e){e.preventDefault();closeDialog();});

  enable();
  var note=document.createElement('p');note.textContent='Демонстрация · без списания денег';note.style.cssText='font:16px Arial;color:#142c5d;text-align:center;margin:8px 0 0';
  document.querySelector('.payment-submit').appendChild(note);
  var cashNote=document.querySelector('.payment-methods p');if(cashNote)cashNote.textContent='Для оплаты наличными нажмите «Оплатить»';
 });
})();
