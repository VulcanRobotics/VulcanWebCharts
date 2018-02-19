var setpointColor = "#FF0000"
var velocityColor = "#66CCFF"
var errorColor = "#00FF00"
var voltageColor = "#8B008B"
var positionColor = "#0000FF"
var chartName = {
    display:true,
    text:""
};
var config;
var modes = {};
var loopChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: "Setpoint",
            yAxisID:"ClosedLoop",
            backgroundColor: setpointColor,
            borderColor: setpointColor,
            fill: false,
        }, {
            yAxisID: "Velocity",
            label: "Velocity",
            fill: false,
            backgroundColor: velocityColor,
            borderColor: velocityColor,
        }, {
            label: "Error",
            yAxisID:"ClosedLoop",
            fill: false,
            backgroundColor: errorColor,
            borderColor: errorColor,
        },{
            yAxisID: "Voltage",
            label: "Output Voltage",
            fill: false,
            backgroundColor: voltageColor,
            borderColor: voltageColor,
        },{
            yAxisID: "Position",
            label: "Position",
            fill: false,
            backgroundColor: positionColor,
            borderColor: positionColor,
        }]
    },
    options: {
        responsive: true,
        title:chartName,
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'milliseconds'
                }
            }],
            yAxes: [{
              display: true,
              id: "Position",
              position: "left",
              scaleLabel: {
                  display: true,
                  labelString: 'encoder counts'
              }
            },{
                display: true,
                id: "Velocity",
                position: "left",
                scaleLabel: {
                    display: true,
                    labelString: 'encoder counts per 100 milliseconds'
                }
              },{
                display: true,
                id: "Voltage",
                position: "right",
                scaleLabel: {
                    display: true,
                    labelString: 'Volts'
                }
              },{
                  display: true,
                  id: "ClosedLoop",
                  position: "left",
                  scaleLabel: {
                      display: true,
                      labelString: 'Position'
                  }
              }]
        }
    }
};

var loopChart = new Chart(document.getElementById("canvas").getContext("2d"), loopChartConfig);

console.log("Fetching config");
fetch("/webroot/config.json",{cache:"no-store"}).then(function(response){
  return response.json()
}).then(function(configJ){
  console.log("Configing TalonSRX Options");
  config = configJ
  for(i = 0; i < config.talonSRX.length; i++){
    var line = "<button type=\"button\" onclick=\"plotLog('talonSRX/" + config.talonSRX[i].name + ".json')\">"
    line += config.talonSRX[i].name;
    line += "</button>\n";
    modes[config.talonSRX[i].name] = config.talonSRX[i].mode;
    document.getElementById("options").innerHTML += line;
  }
});

function plotLog(path){
  console.log("Fetching " + path);
  fetch(("../log/" + path),{cache: "no-store"}).then(function(response){
    return response.json()
  }).then(function(data){
    console.log("Sucessfuly fetched " + path + ", generating chart.");
    var nameArr = path.split('/');
    var name = nameArr[nameArr.length - 1];
    name = name.substring(0,name.length-5);
    loopChart.clear();
    loopChart.destroy();
    loopChart = new Chart(document.getElementById("canvas").getContext("2d"), loopChartConfig);
    loopChart.options.title.text = name;
    mode = modes[name];
    console.log("Chart Mode is " + mode);
    if(mode == "velocity"){
      loopChart.options.scales.yAxes[3].scaleLabel.labelString = "Velocity";
    }else{
      loopChart.options.scales.yAxes[3].scaleLabel.labelString = "Position";
    }
    loopChart.data.datasets[0].data.length = 0;
    loopChart.data.datasets[1].data.length = 0;
    loopChart.data.datasets[2].data.length = 0;
    loopChart.data.datasets[3].data.length = 0;
    loopChart.data.datasets[4].data.length = 0;
    var count = data.setpoint.length;
    loopChart.data.labels = data.timeStamp;
    console.log(loopChartConfig.data.labels);
    for (i = 0; i <= count; i++){
      loopChart.data.datasets[0].data.push(data.setpoint[i]);
      loopChart.data.datasets[1].data.push(data.velocity[i]);
      loopChart.data.datasets[2].data.push(data.error[i]);
      loopChart.data.datasets[3].data.push(data.vOut[i]);
      loopChart.data.datasets[4].data.push(data.position[i]-data.position[0]);
    }
    console.log(loopChart.data.datasets[0].yAxisID);
    loopChart.update();
    console.log("done");
  });
}
