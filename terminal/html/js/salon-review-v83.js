var salonReviewOptions = null;
function renderSalonReview(options) {
 if (options) salonReviewOptions = options;
 var local=window.salonReviewConfig||{},o=salonReviewOptions||{};
 var url=o.reviewUrl||local.reviewUrl||'',name=o.salonName||local.salonName||'';
 document.getElementById('review_salon').textContent=name;
 var holder=document.getElementById('review_qr');holder.innerHTML='';
 var valid=/^https?:\/\//i.test(url);
 document.querySelector('.review-panel').classList.toggle('has-review',valid);
 document.getElementById('review_empty').style.display=valid?'none':'block';
 document.getElementById('review_hint').style.display=valid?'block':'none';
 if(valid) new QRCode(holder,{text:url,width:256,height:256,colorDark:'#142c5d',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
}
window.addEventListener('load',function(){renderSalonReview(null);});
