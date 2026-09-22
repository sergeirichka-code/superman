var servicesObj = services;
if (services != null && (typeof services === "string" || services instanceof String)) {
	servicesObj = eval("(" + services + ")");
}

function getServiceByType(cfg, type, code) {
	var	objs = cfg != null ? cfg[type] : null;

	if (objs != null) {
		for (var i = 0; i < objs.length; i++) {
			if (objs[i].code == code)
				return objs[i];
		}
	}

	return null;
}

function getServiceById(id) {
	for (key in servicesObj) {
		var	objs = servicesObj != null ? servicesObj[key] : null;
		if (objs != null) {
			for (var i = 0; i < objs.length; i++) {
				if (objs[i].id == id)
					return objs[i];
			}
		}
	}

	return null;
}

function getService(type, code) {
	return getServiceByType(servicesObj, type, code);
}

function initBtn(type, code) {
	var service = getService(type, code);
	if (service != null) {
		document.getElementById(type + '_' + code + '_name').innerHTML = service.name;
		document.getElementById(type + '_' + code + '_cost').innerHTML = service.cost;

		if (!isServiceEnabled(service)) {
			document.getElementById(type + '_' + code).disabled = "true";
		}
	} else {
		document.getElementById(type + '_' + code).style.visibility='hidden';
	}
}

function isServiceEnabled(service) {

	// смотрим не заблочен ли в конфиге и блочим если да
	if (service.enabled != null && !service.enabled) {
		return false;
	}

	// смотрим по времени действия и если не попадает - блочим
	if (service.timeFrom != null && service.timeTo != null) {
		if (!checkTime(service.timeFrom, service.timeTo)) {
			return false;
		}
	}

	// смотрим по дням недели
	if (service.days != null && service.days.indexOf(getWeekDay()) == -1) {
		return false;
	}

	return true;
}

function checkTime (beg, end, endTimeShiftMinutes) {
	var s = 60,
		d = ':',
		b = beg.split (d), b = b [0]* s * s + b [1] * s,
		e = end.split (d), e = e [0]* s * s + e [1] * s,
		t = new Date, t = t.getHours () * s * s + t.getMinutes () * s + t.getSeconds ();
	// console.log(b + " < " + t + " < " + e)

	return (t >= b && t <= (e + (endTimeShiftMinutes ? endTimeShiftMinutes * s : 0)));
}
