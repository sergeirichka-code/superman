/* Presentation only: retain service IDs, handlers, prices and availability. */
function layoutPayment() {
 var box=document.getElementById('box_extra');
 ['a','i','b','d'].forEach(function(code){var card=document.getElementById('extra_cell_'+code);if(card){card.classList.add('popular-extra');box.appendChild(card);}});
 var heading=document.createElement('h2');heading.className='other-services-heading';heading.textContent='ДРУГИЕ УСЛУГИ';box.appendChild(heading);
 ['c','f','o','p','e','g','h','j','k','m'].sort(function(a,b){return getService('extra',b).cost-getService('extra',a).cost;}).forEach(function(code){var card=document.getElementById('extra_cell_'+code);if(card)box.appendChild(card);});
 var pictures={a:['wash','Мытьё головы с пеной'],i:['fade','Переход фейд, вид сзади'],b:['beard-trim','Оформление бороды машинкой'],d:['beard-model','Моделирование бороды бритвой']};
 Object.keys(pictures).forEach(function(code){var content=document.getElementById('extra_content_'+code);if(content){var pic=document.createElement('img');pic.src='images/payment-'+pictures[code][0]+'.png';pic.alt=pictures[code][1];pic.className='popular-art';content.appendChild(pic);}});
 document.querySelectorAll('.extra_count_btn').forEach(function(btn){btn.setAttribute('aria-label',(btn.id.indexOf('_m_')>=0?'Убрать: ':'Добавить: ')+document.getElementById('extra_name_'+btn.id.split('_').pop()).textContent);});
 if(TYPE==='haircut' && (CODE==='a'||CODE==='e')) document.getElementById('positionName').textContent=getService(TYPE,CODE).name;
 resizePayment();
}
function resizePayment(){var s=Math.min(innerWidth/1280,innerHeight/1024);document.documentElement.style.setProperty('--payment-scale',s);document.documentElement.style.setProperty('--payment-width',1280*s+'px');document.documentElement.style.setProperty('--payment-height',1024*s+'px');}
window.addEventListener('resize',resizePayment);
