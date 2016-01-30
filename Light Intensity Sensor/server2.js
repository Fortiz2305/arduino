var serialport = require('serialport'),
    plotly = require('plotly')('your_username','your_api_key'),
    token = 'your_token';

// You have to change this with your port name
var portName = '/dev/cu.wchusbserial1410'; 
var sp = new serialport.SerialPort(portName,{
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

function getDateString() {
    var time = new Date().getTime();
    var datestr = new Date(time +3600000).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}

var initdata = [{x:[], y:[], stream:{token:token, maxpoints: 500}}];
var initlayout = {fileopt : "extend", filename : "Sensor-Statistics"};

console.log('**************************************************************\n\
Welcome to the Light Sensor! =).\n\
You can check your statistics visiting https://plot.ly/\n\
*************************************************************');
 
plotly.plot(initdata, initlayout, function (err, msg) {
    if (err) return console.log(err)

    console.log(msg);
    var stream = plotly.stream(token, function (err, res) {
        console.log(err, res);
    });

    sp.on('data', function(input) {
        if(isNaN(input) || input > 1023) return;

    var streamObject = JSON.stringify({ x : getDateString(), y : input });
    stream.write(streamObject+'\n');
    });
});
