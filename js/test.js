function init(eventObj) {
//	toCmInfo("");
//	toFrInfo("");
	getPayoutsVolume();
	setCashmachineEnabled(false,false);


	if (eventObj.terminalId != null) {
		document.getElementById("terminal").innerHTML = "Терминал: " + eventObj.terminalId + " (" + getDate() + ")";
	}

	if (eventObj.version != null) {
		document.getElementById("version").innerHTML = "(ver " + eventObj.version + ")";
	}

	var OPTIONS = eventObj.options;
	var	IS_PAYOUT_ENABLED = OPTIONS != null && OPTIONS['payout'] == 'true';

	if (!IS_PAYOUT_ENABLED) {
		$("#cashmachine_payouts_btn").hide();
		$("#cashmachine_empty_btn").hide();
	}
}

function handleCashmachineEvent(eventType, eventValue) {
	var str = "";
	
	if (eventType == "escrow") {
		str = "Банкнота распознана " + (eventValue / 100);
		stackingBanknote();
	}
	if (eventType == "banknote") {
		str = "Банкнота принята " + (eventValue / 100);
	}
	else if (eventType == "started")
		str = "Купюроприемник запущен";
	else if (eventType == "stopped")
		str = "Купюроприемник остановлен";
	else if (eventType == "error")
		str = "Ошибка купюроприемника " + eventValue;
	else 
		str = eventType;

	toCmInfo(str);
}


function handleFRResponse(result, obj) {

	$.overlay.hide();

	var info = "";
	if (obj.cmd == 'printxreport') {
		info = obj.result == 'ok' ? 'Отчет успешно напечатан' : ('Ошибка при печати отчета: ' + obj.text);
	}
	else if (obj.cmd == 'printzreports') {
		info = obj.result == 'ok' ? 'Смена успешно закрыта' : ('Ошибка при закрытии смены: ' + obj.text);
	}
	else if (obj.cmd == 'continue_print') {
		info = obj.result == 'ok' ? 'Печать продолжена' : ('Ошибка: ' + obj.text);
	}
	else if (obj.cmd == 'cancel_check') {
		info = obj.result == 'ok' ? 'Чек отменен' : ('Ошибка: ' + obj.text);
	}
	else if (obj.cmd == 'getstate') {
		info = "Проверка состояния: " + obj.result;
		if (obj.result == 'error') {
			info += ", ошибка: " + obj.text;
			if (obj.text == 'connection problems') {
				info += " (касса не отвечает, попробуйте перезагрузить терминал)"
			}
		}
		if (obj.frInfo.isPaper != null) {
			info += "<BR/>Бумага: " + (obj.frInfo.isPaper ? 'есть' : 'нет');
		}
		if (obj.frInfo.messagesInOrderToSend != null) {
			info += "<BR/>Количество документов на отправку в ОФД: " + obj.frInfo.messagesInOrderToSend;
		}
		if (obj.frInfo.firstDocInOrderDate != null) {
			info += "<BR/>Первый документ на отправку в ОФД: " + obj.frInfo.firstDocInOrderDate;
		}
		if (obj.frInfo.mode != null && obj.frInfo.modeInfo != "null") {
			info += "<BR/>Режим: " + obj.frInfo.mode + " (" + obj.frInfo.modeInfo + ")";
		}
		if (obj.frInfo.submode != null && obj.frInfo.submodeInfo != "null") {
			info += "<BR/>Подрежим: " + obj.frInfo.submode + " (" + obj.frInfo.submodeInfo + ")";
		}
		if (obj.frInfo.date != null) {
			info += "<BR/>Дата/время на кассе: " + obj.frInfo.date;
		}
		if (obj.frInfo.softVer != null) {
			info += "<BR/>Версия кассового ПО: " + obj.frInfo.softVer + " (" + obj.frInfo.softDate + ")";
		}
		if (obj.frInfo.fnNumber != null) {
			info += "<BR/>Номер ФН: " + obj.frInfo.fnNumber;
			info += " (дата окончания: " + obj.frInfo.fnExpiryDate + ")";
		}
	}
	else if (obj.cmd == 'reset') {
		info = obj.result == 'ok' ? 'Касса перезагружена' : ('Ошибка: ' + obj.text);
	}
	else {
		info = result + ", " + JSON.stringify(obj);
	}

	toFrInfo(info);
}

function printCheck() {
	frPrintCheck('Тестовая Стрижка;3;1;cut;c;1;1;|Тестовая Мойка;1;2;cut;c;1;1;|Тестовая Укладка;1;1;cut;c;1;1;', 6);
}

/* POS TERMINAL */

function handlePosCheck(isWorking, dateTime) {

	var info = "Соединение: " + (isWorking ? 'да' : 'нет');
	// if (isWorking) {
	// 	info += ", статус транзакции: " + transactionStatus + ", дата/время: " + dateTime;
	// }

	toPosInfo(info);
}

function handlePosCheckResults(result, printData, dateTime, transaction_id) {
	toPosInfo("Сверка итогов: " + result
			+ ", дата/время: " + dateTime
			+ ", id: " + transaction_id
			+ ", чек: <pre>" + printData + "</pre> ");
}

function handlePayoutsVolume(result, terminalSumm, stackerSumm) {
	var str = "";
	
	str = "<table cellpadding='7' border='1' style='border: 1px solid black; border-collapse: collapse;' ><tr><td align='center'>Номинал</td><td align='center'>Количество на сдачу</td></tr>";
	
	if (result != null && result != '') {
		var list = result.split(';');
		for (var i = 0; i < list.length; i++) {
			var obj = list[i];
			if (obj != null && obj.includes(":")) {
				var params = obj.split(':');
				if (params.length > 1) {
					str += "<tr><td>" + params[0] + "</td><td align='center'>" + params[1] + "</td></tr>"; 
				}
			}
		}
		
		toCmInfo("Ok");
	}
	
	str += "</table>";
	
	var pElt = document.getElementById("nominals_table");
	pElt.innerHTML = str;
	
	document.getElementById("common_summ").innerHTML = (terminalSumm != null ? terminalSumm : 0);
	document.getElementById("stacker_summ").innerHTML = (stackerSumm != null ? stackerSumm : 0);
}

function handlePayoutSumm(result) {
	toCmInfo("Выдано: " + result);
}

function handleEmptyCashmachine(result) {
	toCmInfo("Опустошение " + result);
}


function handleCheckUpdate(eventObj) {

	$.overlay.hide();

	if (eventObj.result == 'ok') {
		alert("Обновлено успешно, требуется перезагрузка терминала");
	}
	else if (eventObj.result == 'Update not required') {
		alert("Обновление не требуется, у вас последняя актуальная версия")
	}
	else if (eventObj.result == 'error') {
		alert("Во время обновления возникли проблемы, попробуйте повторить позже");
	}
	else {
		alert("Во время обновления возникли проблемы, попробуйте повторить позже");
	}
}


function toCmInfo(message) {
	var pElt = document.getElementById("cm_info");
	pElt.innerHTML =  getDate()  + " : " + message;
}

function toFrInfo(message) {
	var pElt = document.getElementById("fr_info");
	pElt.innerHTML =  getDate()  + " : " + message;
}

function toPosInfo(message) {
	var pElt = document.getElementById("pos_info");
	pElt.innerHTML =  getDate()  + " : " + message;
}


function getDate() {
	var time = new Date();
	
	var month = ((time.getMonth()<9)?"0":"")+(time.getMonth() + 1);
	var day = ((time.getDate()<10)?"0":"")+time.getDate();
	var hour = ((time.getHours()<10)?"0":"")+time.getHours();
	var minutes = ((time.getMinutes()<10)?"0":"")+time.getMinutes();
	var seconds =  ((time.getSeconds()<10)?"0":"")+time.getSeconds();
	 
	var strDate = "" + day + "-" + month + "-" + time.getFullYear() + " " + hour + ":" + minutes + ":" + seconds;
	
	return strDate;
}
