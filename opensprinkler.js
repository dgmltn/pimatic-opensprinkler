var Client = require('node-rest-client').Client;
var client = new Client();
var crypto = require('crypto');
var Promise = require('bluebird');

var host = process.argv[2];
var port = process.argv[3];
var password = process.argv[4];
var hash = crypto.createHash('md5').update(password).digest('hex');

var register = function(path) {
    var url = "http://" + host + ":" + port + path;
    return function(params) {
        if (typeof params == 'undefined') {
            params = {};
        }
        var args = { path: params };
        args.path.pw = hash;
        return new Promise(function(resolve, reject) {
            var req = client.get(url, args, function(data, response) {
                if (typeof data == 'undefined' || typeof data.result == 'undefined') {
                    reject('Unknown client response! ' + JSON.stringify(data));
                }
                else if (typeof data.result == 'undefined' || data.result == '1') {
                    resolve(data);
                }
                else {
                    reject('Invalid result: ' + data.result);
                }
            });
            req.on('error', function(err) {
                reject(err);
            });
        });
    };
};

// Get station names
var jn = register("/jn?pw=${pw}");

// Get station status
var js = register("/js?pw=${pw}");

// Manual station run
// sid: Station index (starting from 0)
// en: Enable bit (1: open the selected station; 0: close the selected station).
// t: Timer (in seconds). Acceptable range is 0 to 64800 (18 hours). The timer value must be provided if opening a station.
var cm = register("/cm?pw=${pw}&sid=${sid}&en=${en}&t={t}");

// Start Run-Once Program
// Starts a run-once program for the given duration for each station defined in t, as an array
// t: An array of station durations, one for each station: [60,0,0,15,15,0]
var cr = register("/cr?pw=${pw}&t={t}");
 
var stations = [];

jn().then(function(data) {
    for (var i = 0; i < data.snames.length; i++) {
        if (stations[i] == undefined) {
            stations[i] = {};
        }
        stations[i].name = data.snames[i];
    }
    return js();
}).then(function(data) {
    for (var i = 0; i < data.sn.length; i++) {
        if (stations[i] == undefined) {
            stations[i] = {};
        }
        stations[i].status = data.sn[i];
    }
    console.log("Stations:\n===============\n", stations);
//    return cm({ sid: 3, en: 1, t: 30 });
//}).then(function(data) {
//    console.log("Manual station run:\n", data);
//    return js();
//}).then(function(data) {
//    console.log("Station Status:\n===============\n", data.sn);
}).catch(function(err) {
    console.log("Error: ", err);
});

