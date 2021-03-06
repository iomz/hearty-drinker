var startTime, currentTime, seconds = 0, t, h, m, s, informedConsentAgreed;

var ws = new WebSocket(location.href.replace(/^http/, "ws"));

var startTimer = function() {
    if (startTime == undefined) {
        $("#time").html('00<span style="color:#3399FF;">:</span>00<span style="color:#3399FF;">:</span>00');
        startTime = new Date().getTime().toString().slice(0, 10);
        t = setInterval(addSeconds, 1e3);
    }
};

var colorButton = function(id) {
    $(id).css("color", "#FFF");
    $(id).css("background-color", "#DE5E60");
};

var grayButton = function(id) {
    $(id).css("color", "");
    $(id).css("background-color", "");
};

var resumeTimer = function(start) {
    grayButton("#timer-button");
    startTime = start;
    t = setInterval(addSeconds, 1e3);
};

var addSeconds = function() {
    bakeCookie();
    currentTime = new Date().getTime().toString().slice(0, 10);
    seconds = parseInt(currentTime - startTime);
    if (seconds < 0 || 3600 < seconds) {
        stopTimer();
        h = "01";
        m = "00";
        s = "00";
    } else {
        h = Math.floor(seconds / 3600);
        m = Math.floor((seconds - h * 3600) / 60);
        s = seconds - h * 3600 - m * 60;
        h = h < 10 ? "0" + h : h.toString();
        m = m < 10 ? "0" + m : m.toString();
        s = s < 10 ? "0" + s : s.toString();
        if ((parseInt(m) + 1) % 5 == 0 && parseInt(s) == 45) {
            $("#alert-sound").trigger("play");
        }
        if (h == "01") {
            stopTimer();
        } else {
            $("#time").html(h + '<span style="color:#3399FF;">:</span>' + m + '<span style="color:#3399FF;">:</span>' + s);
        }
    }
};

var stopTimer = function() {
    $("#time").html("01:00:00");
    clearInterval(t);
    startTime = undefined;
    colorButton("#send-button");
};

var collectUserData = function() {
    var name = $("#name").val();
    if ($("input[type=radio]:checked").size() > 0) {
        var sex = $("#male").prop("checked") ? "male" : "female";
    } else {
        var sex = undefined;
    }
    var weight = parseFloat($("#weight").val());
    var alcohol = 350 * .05 * .789;
    var logs = {};
    for (var i = 5; i <= 60; i += 5) {
        logs[i] = parseFloat($("#" + i + "mins").val());
    }
    return {
        alcohol: alcohol,
        informedConsentAgreed: informedConsentAgreed,
        logs: logs,
        name: name,
        sex: sex,
        startTime: startTime,
        weight: weight
    };
};

var validateForms = function(data) {
    if (data.sex == undefined) {
        scrollTo("#profile");
        $("#sex-block").tooltip("show");
        return false;
    }
    if (isNaN(data.weight)) {
        scrollTo("#profile");
        $("#weight-block").tooltip("show");
        return false;
    }
    if (isNaN(data.alcohol)) {
        scrollTo("#profile");
        $("#alcohol-block").tooltip("show");
        return false;
    }
    var blankCount = 0;
    for (var i in data.logs) {
        if (isNaN(data.logs[i])) {
            blankCount += 1;
        } else if (data.logs[i] < 0 || 1 < data.logs[i]) {
            scrollTo("#log-block");
            $("#" + i + "mins").tooltip("show");
            return false;
        }
    }
    if (blankCount > 3) {
        scrollTo("#log-block");
        return false;
    } else {
        return true;
    }
};

var postLogs = function() {
    if (h != "01") {
        scrollTo("#drink");
        $("#time").tooltip("show");
        return;
    }
    if (ws.readyState != 1) {
        ws = new WebSocket(location.href.replace(/^http/, "ws"));
        setTimeout(function() {
            console.log("sleeping 3 seconds");
        }, 3e3);
    }
    var data = collectUserData();
    if (validateForms(data)) {
        for (var i in data.logs) {
            if (isNaN(data.logs[i])) {
                data.logs[i] = -1;
            }
        }
        ws.send(JSON.stringify(data));
        if (ws.readyState != 1) {
            window.alert("ちょっとうまく送れませんでした。@iomzまで教えてください(> <;;)");
        }
    }
};

var scrollTo = function(id) {
    $("html, body").animate({
        scrollTop: $(id).offset().top
    }, 1e3);
};

var recoverFromCookie = function() {
    var data = $.cookie("hearty-cookie");
    $("#name").val(data.name);
    $("#" + data.sex).prop("checked", true);
    $("#weight").val(data.weight);
    $("#alcohol").val(data.alcohol);
    for (var i in data.logs) {
        $("#" + i + "mins").val(data.logs[i]);
    }
    if (data.startTime != undefined) {
        resumeTimer(data.startTime);
    }
};

var bakeCookie = function() {
    var data = collectUserData();
    $.cookie("hearty-cookie", data);
};

var burnCookie = function() {
    for (var i = 5; i <= 60; i += 5) {
        $("#" + i + "mins").val("");
    }
    var data = $.cookie("hearty-cookie");
    data.logs = {};
    data.startTime = undefined;
    console.log(data);
    $.cookie("hearty-cookie", data);
};

var destroyCookie = function() {
    $.removeCookie("hearty-cookie");
};

var agree = function() {
    informedConsentAgreed = true;
    bakeCookie();
    $("#informed-consent").collapse("hide");
    $("#procedures").show();
    setTimeout(function() {
        scrollTo("#procedures");
    }, 500);
};

$(document).ready(function() {
    $.cookie.json = true;
    $("#alcohol").hide();
    var data = $.cookie("hearty-cookie");
    if (data != undefined && data.informedConsentAgreed ) {
        scrollTo("#procedures");
        recoverFromCookie();
    } else {
        $("#informed-consent").collapse("show");
        $("#procedures").hide();
    }
    if (startTime == undefined) {
        colorButton("#timer-button");
    }
    ws.onopen = function() {};
    ws.onerror = function(error) {
        window.alert(error);
    };
    ws.onmessage = function(msg) {
        var data = JSON.parse(msg.data);
        if(data.result == undefined){
            console.log(data);
        } else {
            if(data.result == "success") {
                $("#name").val(data.name);
                h = "00";
                $("#time").html("00:00:00");
                colorButton("#timer-button");
                grayButton("#send-button");
                scrollTo("#finish-block");
                if ($("#thank-you").children().length != 1) {
                    $("#thank-you").append('<h2><span style="color:#3399FF;">ご協力ありがとうございました！</span></h2>');
                }
                burnCookie();
            } else {
                // Keep the data, do something
            }
        }
    };
    ws.onclose = function() {};
});
