var n_time, r_time, seconds = 0, t, h, m, s;

var ws = new WebSocket(location.href.replace(/^http/, "ws"));

var start_timer = function() {
    $("#time").html('00<span style="color:#3399FF;">:</span>00<span style="color:#3399FF;">:</span>00');
    nTime = new Date().getTime().toString().slice(0, 10);
    t = setInterval(add_seconds, 1e3);
};

var add_seconds = function() {
    if (h == "01") {
        $("#time").html("01:00:00");
        clearInterval(t);
    } else {
        bake_cookie();
        rTime = new Date().getTime().toString().slice(0, 10);
        seconds = parseInt(rTime - nTime);
        h = Math.floor(seconds / 3600);
        m = Math.floor((seconds - h * 3600) / 60);
        s = seconds - h * 3600 - m * 60;
        h = h < 10 ? "0" + h : h.toString();
        m = m < 10 ? "0" + m : m.toString();
        s = s < 10 ? "0" + s : s.toString();
        $("#time").html(h + '<span style="color:#3399FF;">:</span>' + m + '<span style="color:#3399FF;">:</span>' + s);
        if( (parseInt(m)+1)%5 == 0 && parseInt(s) == 45 ) {
            $("#alert-sound").trigger('play');
        }
    }
};

var collect_user_data = function() {
    var name = $("#name").val();
    var weight = parseFloat($("#weight").val());
    var beer_count = parseInt($("#beer_count").val());
    var logs = {};
    for (var i = 5; i <= 60; i += 5) {
        logs[i] = parseFloat($("#" + i + "mins").val());
    }
    return {
        beer_count: beer_count,
        logs: logs,
        name: name,
        weight: weight
    };
};

var post_logs = function() {
    if (ws.readyState != 1) {
        ws = new WebSocket(location.href.replace(/^http/, "ws"));
        setTimeout(function() {
            console.log("sleeping 3 seconds");
        }, 3e3);
    }
    if (h != "01") {
        scrollTo("time");
        $("#time").tooltip("show");
        return;
    }
    var data = collect_user_data();
    if (isNaN(data.weight)) {
        scrollTo("weight_block");
        $("#weight_block").tooltip("show");
        return;
    }
    if (isNaN(data.beer_count)) {
        scrollTo("beer_block");
        $("#beer_block").tooltip("show");
        return;
    }
    for (var i in data.logs) {
        if (isNaN(data.logs[i])) {
            data.logs[i] = 0;
        } else if (data.logs[i] < 0 || 1 < data.logs[i]) {
            scrollTo("log_block");
            $("#" + i + "mins").tooltip("show");
            return;
        }
    }
    ws.send(JSON.stringify(data));
    if (ws.readyState == 1) {
        h = "00";
        $("#time").html("00:00:00");
        scrollTo("finish_block");
        if ($("#thank-you").children().length != 1) {
            $("#thank-you").append('<h2><span style="color:#3399FF;">ご協力ありがとうございました！</span></h2>');
        }
        burn_cookie();
    } else {
        window.alert("ちょっとうまく送れませんでした。iomzに教えてください(> <;;)");
    }
};

var scrollTo = function(id) {
    $("html, body").animate({
        scrollTop: $("#" + id).offset().top - 80
    }, 1e3);
};

var recover_from_cookie = function() {
    var data = $.cookie("hearty-cookie");
    $("#weight").val(data.weight);
    $("#name").val(data.name);
    $("#beer_count").val(data.beer_count);
    for (var i in data.logs) {
        $("#" + i + "mins").val(data.logs[i]);
    }
};

var bake_cookie = function() {
    var data = collect_user_data();
    $.cookie("hearty-cookie", data);
};

var burn_cookie = function() {
    for (var i = 5; i <= 60; i += 5) {
        $("#" + i + "mins").val("");
    }
    var data = $.cookie("hearty-cookie");
    data.logs = {};
    $.cookie("hearty-cookie", data);
};

$(document).ready(function() {
    $.cookie.json = true;
    if ($.cookie("hearty-cookie") != undefined){
        recover_from_cookie();
    }
    ws.onopen = function() {};
    ws.onerror = function(error) {
        window.alert(error);
    };
    ws.onmessage = function(msg) {
        var data = JSON.parse(msg.data);
        console.log(data);
        $("#name").val(data.name);
    };
    ws.onclose = function() {};
});
