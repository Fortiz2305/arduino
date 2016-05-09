// Dependencies for plotly and arduino
var serialport = require('serialport'),
    plotly = require('plotly')('yourPlotlyUsername','yourAPI-key'),
    token = 'YourToken';

// require/import the mongodb native drivers
var mongodb = require('mongodb');
var assert = require('assert');

// Port information
var portName = '/path/to/your/port';
var sp = new serialport.SerialPort(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\r\n")
});

// We need to work with "MongoClient" interface in order to connect to a mongodb server
var MongoClient = mongodb.MongoClient;

//Connection URL. This is where mongodb server is running.
var url = 'mongodb://localhost:27017/sample';


// helper function to get a nicely formatted date string
function getDateString() {
    var time = new Date().getTime();
    var datestr = new Date(time +3600000).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}

var initdata = [{x:[], y:[], stream:{token:token, maxpoints: 500}}];
var initlayout = {fileopt : "extend", filename : "sensor-test"};

console.log('**********************************************************************************************************\n\
TAKING RESULTS....\n\
YOU CAN CHECK IT IN https://plot.ly/\n\
***********************************************************************************************************');

plotly.plot(initdata, initlayout, function (err, msg) {
    if (err) return console.log(err)

    // Create a plotly stream. We can connect to the API with our token
    console.log(msg);
    var stream = plotly.stream(token, function (err, res) {
        console.log(err, res);
    });

    sp.on('data', function(input) {
        if(isNaN(input) || input > 1023) return;

    // Convert to JSON
    var streamObject = JSON.stringify({ x : getDateString(), y : input });

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', url);
            assert.equal(null, err)
            insertValue(db, function() {
                db.close();
            })
        }
	})

    var insertValue = function(db, callback) {
        db.collection('LightValues').insertOne( {
		streamObject,
		"object_id" : "4dddw"
	}, function(err, result) {
        console.log("Inserted value")
        assert.equal(err, null)
        callback(result)
        })
    }

    console.log(streamObject);
    stream.write(streamObject+'\n');
    });
});
