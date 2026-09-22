var lastClickTimer = 0;
var pringerTimeOut = 5*60;

function pinger(options) {

    console.log(options);

    if (options && options["showDemoScreen"] == "true") {
        console.log("start demo");
        refresh();
    }
}

function refresh() {
    // console.log(lastClickTimer);

    if (lastClickTimer > pringerTimeOut) {
        document.location.href = "preview/index.html";
    } else if (lastClickTimer < 0) {
        // pause pinger
    } else {
        lastClickTimer++;
    }

    setTimeout('refresh();', 1000);
}

function pausePinger() {
    lastClickTimer=-1;
}

function resetPinger() {
    lastClickTimer=0;
}

jQuery(document).click(function ($) {
    if (lastClickTimer >=0 )
        resetPinger();
});
