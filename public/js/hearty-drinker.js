var seconds = 0, minutes = 0, hours = 0, t;
var ws = new WebSocket(location.href.replace(/^http/, 'ws'));

var start_timer = function() {
    timer();
};

var post_logs = function() {
    var name = $("#name").val();
    var weight = parseFloat($("#weight").val());
    if ( isNaN(weight) ) {
        window.alert("体重を入力してくれないと評価できません！");
        return;
    }
    var logs = {};
    for( var i=5; i<=60; i+=5 ) {
        logs[i] = parseFloat($("#"+i+"mins").val());
        if (logs[i] < 0 || 1 < logs[i] || isNaN(logs[i])) {
            window.alert(i+'分経過時の値がおかしいので直してください!');
            return;
        }
    }
    var data = JSON.stringify({logs: logs, name: name, weight: weight});
    ws.send(data);
};

var timer = function() {
    t = setTimeout(add, 1e3);
}

var add = function() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    var h = (hours ? hours > 9 ? hours : "0" + hours : "00");
    var m = (minutes ? minutes > 9 ? minutes : "0" + minutes : "00");
    var s = (seconds > 9 ? seconds : "0" + seconds);
    $("#time").html(h + "<span style=\"color:#3399FF;\">:</span>"
            + m + "<span style=\"color:#3399FF;\">:</span>" + s);
    if ( h == "01" ){
        $("#time").html("01:00:00");
        clearTimeout(t);
    } else {
        timer();
    }
}

$(document).ready(function() {
    ws.onopen = function() {
    }
    ws.onmessage = function(msg) {
        var data = JSON.parse(msg.data);
        console.log(data);
    }
    ws.onclose = function() {
    }
});
