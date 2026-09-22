// Client Bonus

function bonusDialog() {
    if (CLIENT != null) {
        if (CLIENT.bonusEnabled) {
            openModal('#bonus_dialog');
        } else {
            openModal('#bonus_reg_dialog_with_amount');
        }
    } else if (SHOW_BONUS_INFO) {
        openModal('#bonus_reg_dialog');
    }
}

function bonusPinDialog() {
    clearBonusPinResultMsg();
    clearBonusPin();
    openModal('#bonus_pin_dialog');
}

function handleReqClientBonus(eventObj) {

    if (eventObj && eventObj.result == 'OK' && eventObj.clientParams) {
        // Если проверили и нашли клиента

        CLIENT = eventObj.clientParams;
        $("#btn_bonus").prop('disabled', false);

        if (!eventObj.clientParams.bonusEnabled) {
            $('#bonus_field_info').append(CLIENT.bonusAmount);
        } else {
            if (CLIENT.bonusAmount < 50) {
                $("#btn_use_bonus").prop('disabled', true);
            }

            $('#bonus_field_number').append("+" + NUMBER);
            $('#bonus_field_fio').append(toFIO(CLIENT));
            $('#bonus_field_counter').append(CLIENT.bonusAmount);

            updateBonusField();
        }
    } else if (eventObj && eventObj.result == 'ERROR' && eventObj.text == 'Client not found') {
        // Если проверили и не нашли клиента

        $("#btn_bonus").prop('disabled', false);
    } else {
        // Если ошибки при проверке на стороне сервера (нет связи или что-то еще)

        SHOW_BONUS_INFO = false;
    }
}

function isUseBonus() {
    return BONUS_USE;
}

function getBonusAmount() {
    return CLIENT && CLIENT.bonusAmount ? CLIENT.bonusAmount : 0;
}

function toFIO(cl) {
    let fio = cl.firstName ? cl.firstName : cl.lastName;
    // if (cl.firstName) {
    //     if (fio.length > 0) {
    //         fio += ' ';
    //     }
    //     fio += cl.firstName;
    // }
    // if (cl.patrName) {
    //     if (fio.length > 0) {
    //         fio += ' ';
    //     }
    //     fio += cl.patrName;
    // }
    return fio;
}


function applyBonusEnterPin() {

    let enteredPin = '';

    for (let i = 0; i <= 7; i++) {
        enteredPin += $('#date_' + i).val();
    }

    console.log("enteredPin: " + enteredPin + ", db: " + CLIENT.formattedBd);

    if (CLIENT.formattedBd != '' && CLIENT.formattedBd == enteredPin) {

        BONUS_USE = true;
        $("#discount_block").show();
        $("#btn_promocode").prop('disabled', true);
        $("#btn_bonus").prop('disabled', true);
        closeModal();

        // update cost
        refreshCost();

    } else {
        var errorText = 'Введена не верная дата рождения';

        $("#bonus_result_msg").append(errorText);
        setTimeout('clearBonusPinResultMsg()', 3000);
    }
}

function clearBonusPinResultMsg() {
    $("#bonus_result_msg").empty();
    $("#bonus_result_msg").removeClass('success');
}

let pinIndex = 0;

function addBonusPinNum(num) {
    if (pinIndex <= 7) {
        $('#date_' + pinIndex).val(num);
        pinIndex++;
    }
}

function delBonusPinNum() {
    if (pinIndex >= 1) {
        $('#date_' + (pinIndex-1)).val('');
        pinIndex--;
        clearBonusPinResultMsg();
    }
}

function clearBonusPin() {
    $('.bonus_pin_field').val('');
    pinIndex = 0;
    clearBonusPinResultMsg();
}

function getWeekDay() {
    var time = new Date();
    return time.getDay();
}

function isIncreasedBonus() {

    if (termParams && termParams["increasedBonus"]) {
        const increasedBonusSettings = termParams["increasedBonus"];
        if (increasedBonusSettings && increasedBonusSettings.value) {
            const schedule = increasedBonusSettings.schedule;
            if (schedule) {
                if (schedule[getWeekDay()]) {
                    const timeRanges = schedule[getWeekDay()];
                    if (timeRanges != null) {
                        for (var i = 0; i < timeRanges.length; i++) {
                            const range = timeRanges[i];
                            if (range.from != null && range.to != null) {
                                if (checkTime(range.from, range.to, 30)) {
                                    return true;
                                }
                            }
                            console.log(range)
                        }
                        return false;
                    }
                    return true;
                }
                return false;
            }
            return true;
        }
    }

    return false;
}


function computeBonusValue(summ) {
    let bonusPercent = 3;

    if (isIncreasedBonus() && termParams["increasedBonus"].value) {
        bonusPercent = termParams["increasedBonus"].value;
    }

    return parseInt(summ * bonusPercent / 100);
}