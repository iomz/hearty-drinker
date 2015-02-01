var getRandomRGBA = function(opacity) {
    var rgba = "rgba(";
    for(var i=0; i<3; i++) {
        rgba += Math.floor(Math.random() * (250 - 50 + 1) + 50);
        rgba += ",";
    }
    if(opacity) {
        rgba += Math.random();
    } else {
        rgba += 1;
    }
    rgba += ")";
    return rgba
}

var drawStatLines = function(){
    var elapseds = [];
    for(var i=5; i<=60; i+=5) {
        elapseds.push(i+" mins");
    }
    // Initial dataset is the average for 60kg person
    var datasets = [{
        label: "average",
        fillColor: "rgba(255,0,0,0.5)",
        strokeColor: "rgba(255,0,0,0.5)",
        pointColor: "rgba(255,0,0,0.5)",
        data: []
    }];
    for(var i=0; i<logs.length; i++) {
        var color = getRandomRGBA(false);
        datasets.push({
            label: logs[i].uid,
            fillColor: color,
            strokeColor: color,
            pointColor: color,
            data: logs[i].concentrations
        });
    }
    var data = {
        labels: elapseds,
        datasets: datasets
    };

    var options = {
        // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: true,
        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: true,
        // Boolean - Determines whether to draw tooltips on the canvas or not
        showTooltips: true,
        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,
        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(220,220,220,.25)",
        //Number - Width of the grid lines
        scaleGridLineWidth : 1,
        //Boolean - Whether to show a dot for each point
        pointDot : false,
        //Number - Radius of each point dot in pixels
        pointDotRadius : 4,
        //Number - Pixel width of dataset stroke
        datasetStrokeWidth : 1,
        //Boolean - Whether to fill the dataset with a colour
        datasetFill : false,
        //Number - Tension of the bezier curve between points
        bezierCurveTension : 0.4,
    };

    $("#log-graph").append("<canvas id=\"log-graph-canvas\"></cavas>");
    $("#log-graph-canvas").attr("height", 400);
    $("#log-graph-canvas").attr("width", 800)
    var ctx = $("#log-graph-canvas").get(0).getContext("2d");
    var chart = new Chart(ctx).Line(data, options);
};

$(document).ready(function() {
    $("html, body").animate({
        scrollTop: $("#log").offset().top
    }, 1e3);
    drawStatLines();
});
