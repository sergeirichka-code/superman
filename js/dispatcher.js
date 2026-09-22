var dispatcherURL = 'ws://localhost:8011';
var lockedPage = 'locked.html';

var ws;

document.oncontextmenu = function (){return false};

function DispatcherWebSocket() {

  if ("WebSocket" in window) {

     // Let us open a web socket
     ws = new WebSocket(dispatcherURL);
     
     ws.onopen = function() {
    	var msg = '{"object": "common", "cmd": "connect", "page": "' + document.title + '"}';
        ws.send(msg);
     };
     
     ws.onmessage = function (evt) {

        var eventObj = eval("(" + evt.data + ")");
        
        if (eventObj.object == "common") {

        	if (eventObj.result == "connected") {

				if (eventObj.isLocked) {
					document.location.href = lockedPage;
				}
				init(eventObj);
			} else if (eventObj.cmd == "refreshSettings") {
				refreshSettings();
			}
        } else if (eventObj.object == "cashmachine" && eventObj.cmd == "checkchange") {
    		handleCheckSummChange(eventObj.result); 
    	} else if (eventObj.object == "cashmachine" && eventObj.cmd == "getpayouts") {
    		handlePayoutsVolume(eventObj.result, eventObj.terminal_smm, eventObj.stacker_summ);
    	} else if (eventObj.object == "cashmachine" && eventObj.cmd == "payout") {
    		handlePayoutSumm(eventObj.result);
    	} else if (eventObj.object == "cashmachine" && eventObj.cmd == "empty") {
			handleEmptyCashmachine(eventObj.result);
		} else if (eventObj.object == "cashmachine") {
    		if (eventObj.event != null) 
    			handleCashmachineEvent(eventObj.event, eventObj.eventValue);
    	} else if (eventObj.object == "fr") {
    		handleFRResponse(eventObj.result, eventObj);
    	}
    	else if (eventObj.object == "misc" && eventObj.cmd == "login") {
    		handleLogin(eventObj.result, eventObj.summ, eventObj.message);
    	}
    	else if (eventObj.object == "misc" && eventObj.cmd == "pay") {
    		handlePayCmd(eventObj.result, eventObj.message, eventObj.dispensed, eventObj.change, eventObj.terminalId,
				eventObj.transactionId, eventObj.checkSentToEmail, eventObj.checkSentToSMS);
    	}
    	else if (eventObj.object == "misc" && eventObj.cmd == "get_admin_pin") {
    		handleGetAdminPin(eventObj.result);
    	}
    	else if (eventObj.object == "misc" && eventObj.cmd == "clientinfo") {
			handleReqClientInfo(eventObj.options);
    	}
		else if (eventObj.object == "misc" && eventObj.cmd == "client_bonus") {
			handleReqClientBonus(eventObj);
    	}
		else if (eventObj.object == "misc" && eventObj.cmd == "check_promo_code") {
			handleCheckPromoCode(eventObj);
		}
		else if (eventObj.object == "misc" && eventObj.cmd == "check_update") {
			handleCheckUpdate(eventObj);
		}
		else if (eventObj.object == "misc" && eventObj.cmd == "pay_cancel") {
			handlePayCancel(eventObj);
		}
    	else if (eventObj.object == "pos") {
	 		if (eventObj.cmd == "check")
	 			handlePosCheck(eventObj.isWorking, eventObj.dateTime);
	 		else if (eventObj.cmd == "check_results")
	 			handlePosCheckResults(eventObj.result, decodeURIComponent(eventObj.text), eventObj.dateTime, eventObj.transactionId);
	 	}
		else if (eventObj.object == "sbp") {
			handleSbpResponse(eventObj);
		}
		else if (eventObj.object == "staff") {
			if (eventObj.cmd == "shift_operation")
				handleStaffShiftOperation(eventObj);
			else if (eventObj.cmd == "posts_list")
				handleStaffPostsListRequest(eventObj);
		}
     };
     
     ws.onclose = function() {};
  }
  else {
     // The browser doesn't support WebSocket
	 alert("WebSocket NOT supported by your Browser!");
  }
}


/**
 * 
 * Блокировка/разблокировка купюрника
 *
 */
function setCashmachineEnabled(flag, isPayment) {
	if (flag == true)
		ws && ws.send('{"object": "cashmachine", "cmd": "enabled", "enable": true' + (isPayment ? ', "text":"start_payment"' : '') + '}');
	else if (flag == false)
		ws && ws.send('{"object": "cashmachine", "cmd": "enabled", "enable": false}');
}


function stackingBanknote() {
	ws.send('{"object": "cashmachine", "cmd": "stacking"}');
}

function returnBanknote() {
	ws.send('{"object": "cashmachine", "cmd": "return"}');
}

function checkSummChange(balance, summ) {
	ws.send('{"object": "cashmachine", "cmd": "checkchange", "text": "' + balance + '", "summ": ' + summ + '}');	
}

function getPayoutsVolume() {
	ws.send('{"object": "cashmachine", "cmd": "getpayouts"}');
}

function payoutSumm(summ) {
	ws.send('{"object": "cashmachine", "cmd": "payout", "summ": ' + summ + '}');
}

function emptyCashmachine() {
	ws.send('{"object": "cashmachine", "cmd": "empty"}');
}

function getAdminPin() {
	ws.send('{"object": "misc", "cmd": "get_admin_pin"}');
}

function reboot() {
	ws.send('{"object": "misc", "cmd": "reboot"}');
}

function checkUpdate() {
	ws.send('{"object": "misc", "cmd": "check_update"}');
}

/**
 * 
 * Полный функционал по созданию фискального чека
 *
 * Позиции задаются списком "название";"цена";"количество";, разделенных между собой символом '|'
 * Пример: товар 1;100;2;|товар2;300;1;
 */
function frPrintCheck(positions, summ) {
	ws.send('{"object": "fr", "cmd": "printcheck", "text": "' + positions + '", "summ": ' + summ + '}');
}

/**
 * 
 * Запрос проверки состояния ФР
 * В ответ придут флаги - работает или нет, наличие бумаги
 * 
 */
function frGetState() {
	ws.send('{"object": "fr", "cmd": "getstate"}');
}

/**
 * 
 * Печать X-отчета
 * 
 */
function frPrintXReport() {
	ws.send('{"object": "fr", "cmd": "printxreport"}');
}

/**
 * 
 * Печать Z-отчета
 * 
 */
function frPrintZReport() {
	ws.send('{"object": "fr", "cmd": "printzreports"}');
}

/**
 *
 * Продолжение печати
 *
 */
function frContinuePrint() {
	ws.send('{"object": "fr", "cmd": "continue_print"}');
}

/**
 * отменить чек
 */
function frCancelCheck() {
	ws.send('{"object": "fr", "cmd": "cancel_check"}');
}

/**
 *
 * Печать копии чека
 *
 */
function frPrintCheckCopy() {
	ws.send('{"object": "fr", "cmd": "printcheck_copy"}');
}

/**
 *
 * ФР перезагрузка
 *
 */
function frResetDevice() {
	ws.send('{"object": "fr", "cmd": "reset"}');
}

/*
 * Начало оплаты
 */
function startPay(number, stock, fromWhere, post, params) {
	var str = '{"object": "misc", "cmd": "start_pay", "text": "' + params + '"';
	if (number != null) {
		str += ', "number": "' + number + '"';
	}
	if (stock != null) {
		str += ', "stock": ' + stock;
	}
	if (fromWhere != null) {
		str += ', "fromWhere": ' + fromWhere;
	}
	if (post != null) {
		str += ', "post": ' + post;
	}
	str += '}';

	ws.send(str);
}


/*
 * Оплата
 */
function payCmd(cost, summ, params, number, voting, stock, stockSystem, fromWhere, payType, post, entity, promoCode, promoCodeAmount, commonCost, bonusAmount, personDataConsent) {

	let obj = {
		object: "misc",
		cmd: "pay",
		cost: cost,
		text1: params,
		summ: summ,
		type: payType != null ? payType : 1
	};

	if (number != null) {
		obj["number"] = number;
	}
	if (voting != null) {
		obj["voting"] = voting;
	}
	if (stock != null) {
		obj["stock"] = stock;
	}
	if (fromWhere != null) {
		obj["fromWhere"] = fromWhere;
	}
	if (post != null) {
		obj["post"] = post;
	}
	if (entity != null) {
		obj["entity"] = entity;
	}
	if (promoCode != null) {
		obj["promoCode"] = promoCode;
	}
	if (promoCodeAmount != null) {
		obj["promoCodeAmount"] = promoCodeAmount;
	}
	if (commonCost != null) {
		obj["commonCost"] = commonCost;
	}
	if (bonusAmount) {
		obj["bonusAmount"] = bonusAmount;
	}
	if (stockSystem) {
		obj["stockSystem"] = stockSystem;
	}

	if (personDataConsent != null) {
		obj["personDataConsent"] = personDataConsent;
	}


	ws.send(JSON.stringify(obj));
}

/*
 * Отмена оплаты
 */
function payCancelCmd(cost, summ, number, post) {

	let obj = {
		object: "misc",
		cmd: "pay_cancel",
		cost: cost,
		summ: summ,
		post: post
	};

	if (number != null) {
		obj["number"] = number;
	}

	ws.send(JSON.stringify(obj));
}

function reqClientInfo(number) {
	ws.send('{"object": "misc", "cmd": "clientinfo", "number": "' + number + '"}');
}

function reqClientBonus(number) {
	ws.send('{"object": "misc", "cmd": "client_bonus", "number": "' + number + '"}');
}


/**
* 
* POS-терминал. Проверка соединения
* 
*/
function posCheck() {
	ws.send('{"object": "pos", "cmd": "check"}');
}

/**
* 
* POS-терминал. Сверка итогов
* 
*/
function posCheckResults() {
	ws.send('{"object": "pos", "cmd": "check_results"}');
}


/**
 *
 * Проверка промокода
 */
function сheckPromoCode(code, phone, id) {
	let obj = {
		object: "misc",
		cmd: "check_promo_code",
		number: code,
		phone: phone,
		type: id
	};
	ws.send(JSON.stringify(obj));
}

function sbpCheck() {
	ws.send('{"object": "sbp", "cmd": "check"}');
}

function sbpPayment(summ) {
	let obj = {
		object: "sbp",
		cmd: "payment",
		summ: summ
	};
	ws.send(JSON.stringify(obj));
}

function sbpCancel() {
	ws.send('{"object": "sbp", "cmd": "cancel"}');
}


/**
 *
 * Staff
 */

function staffShiftOperation(pin, operation) {
	let obj = {
		object: "staff",
		cmd: "shift_operation",
		number: pin,
		text: operation
	}
	ws.send(JSON.stringify(obj));
}

function staffPostsListRequest() {
	let obj = {
		object: "staff",
		cmd: "posts_list"
	}
	ws.send(JSON.stringify(obj));
}


function getReqParams() {
	var tmp = new Array();        // два вспомагательных
	var tmp2 = new Array();        // массива
	var param = new Array();
	if(location.search != '') {
	    tmp = (location.search.substr(1)).split('&');    // разделяем переменные
	    for(var i=0; i < tmp.length; i++) {
	        tmp2 = tmp[i].split('=');        // массив param будет содержать
	        param[tmp2[0]] = tmp2[1];        // пары ключ(имя переменной)->значение
	    }
	}
	
	return param;
}

function toReqParams(obj) {

	var str = '';

	for(var key in obj) {
		if (str.length > 0) {
			str += '&';
		}
		str += key + '=' + obj[key];
	}

	return str;
}

function refreshSettings() {
	console.log("refresh settings stub");
}
/////////// Implementation

/*
function handleCashmachineEvent(eventType, eventValue) {
}

function handleCheckSummChange(result) {
}

function handlePayoutsVolume(result, terminalSumm, stackerSumm) {
}

function handlePayoutSumm(result) {
}

function handleFRResponse(result, obj) {
}

handlePayCmd(result, message, dispensed, change, terminalId, transactionId) {
}

function handleGetAdminPin(result) {
}

function handleReqClientInfo(info) {
}

function handlePosCheck(isWorking, dateTime) {
}

function handlePosCheckResults(result, printData, dateTime, transaction_id) {
}

function handleCheckPromoCode(result) {
}

function handleCheckUpdate(result) {
}

function handleSbpResponse(result) {
}

function handlePayCancel(result) {
}
*/