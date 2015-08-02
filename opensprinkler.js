var Client = require('node-rest-client').Client;
var client = new Client();
var crypto = require('crypto');
var Promise = require('bluebird');

var host = process.argv[2];
var port = process.argv[3];
var password = process.argv[4];
var hash = crypto.createHash('md5').update(password).digest('hex');

var register = function(name, url, method) {
    client.registerMethod(name, url, method);
    return function(args) {
        return new Promise(function(resolve, reject) {
            var req = client.methods[name](args, function(data, response) {
                if (typeof data === undefined || typeof data.result === undefined) {
                    reject("Unknown client response! " + JSON.stringify(data));
                }
                else if (typeof data.result != undefined || data.result == '1') {
                    resolve(data);
                }
                else {
                    reject("Invalid result: " + data.result);
                }
            });
            req.on('error', function(err) {
                reject(err);
            });
        });
    };
};

// Get station names
var jn = register("jn", "http://" + host + ":" + port + "/jn?pw=${pw}", "GET");

// Get station status
var js = register("js", "http://" + host + ":" + port + "/js?pw=${pw}", "GET");

// Manual station run
// sid: Station index (starting from 0)
// en: Enable bit (1: open the selected station; 0: close the selected station).
// t: Timer (in seconds). Acceptable range is 0 to 64800 (18 hours). The timer value must be provided if opening a station.
var cm = register("cm", "http://" + host + ":" + port + "/cm?pw=${pw}&sid=${sid}&en=${en}&t={t}", "GET");

// Start Run-Once Program
// Starts a run-once program for the given duration for each station defined in t, as an array
// t: An array of station durations, one for each station: [60,0,0,15,15,0]
var cr = register("cr", "http://" + host + ":" + port + "/cr?pw=${pw}&t={t}", "GET");
 
jn({ path: { pw: hash } }).then(function(data) {
    console.log("Station Names:\n==============\n", data.snames);
    return js({ path: { pw: hash } });
}).then(function(data) {
    console.log("Station Status:\n===============\n", data.sn);
//    return cm({ path: { pw: hash, sid: 3, en: 1, t: 30 } });
//}).then(function(data) {
//    console.log("Manual station run:\n", data);
//    return js({ path: { pw: hash } });
//}).then(function(data) {
//    console.log("Station Status:\n===============\n", data.sn);
}).catch(function(err) {
    console.log("Error: ", err);
});

