function openModal(id) {
	var maskHeight = $(document).height();
	var maskWidth = $(window).width();
	$('#mask').css({'width':maskWidth,'height':maskHeight});
	$('#mask').fadeIn(100);
	$('#mask').fadeTo('fast', 0.8);
	var winH = $(window).height();
	var winW = $(window).width();
	$(id).css('top',  winH/2-$(id).height()/2);
	$(id).css('left', winW/2-$(id).width()/2);
	$(id).fadeIn(1000);
}

function closeModal() {
	
	if (document.getElementById('passw') != null) {
		document.getElementById('passw').value = "";
	}
	
	$('#mask, .window').hide();
}

function addNum(num, elt) {
	document.getElementById(elt).value += num;
}

function delNum(elt) {
	var str = document.getElementById(elt).value;
	if (str.length > 0) {
		str = str.substring(0, str.length-1);
		document.getElementById(elt).value = str;
	}
}

function clearNum(elt) {
	document.getElementById(elt).value = '';
}


function clearFields() {
	document.getElementById('passw').value = '';
}

//$('#mask').click(function () {
//		$(this).hide();
//		$('.window').hide();
//	});
//});
