var Opensprinkler = require('./opensprinkler.js');

var host = process.argv[2];
var port = process.argv[3];
var password = process.argv[4];
var opensprinkler = new Opensprinkler(host, port, password);

var stations = [];

opensprinkler.jn().then(function(data) {
    for (var i = 0; i < data.snames.length; i++) {
        if (stations[i] == undefined) {
            stations[i] = {};
        }
        stations[i].name = data.snames[i];
    }
    return opensprinkler.js();
}).then(function(data) {
    for (var i = 0; i < data.sn.length; i++) {
        if (stations[i] == undefined) {
            stations[i] = {};
        }
        stations[i].status = data.sn[i];
    }
    console.log("Stations:\n===============\n", stations);
//    return opensprinkler.cm({ sid: 3, en: 1, t: 30 });
//}).then(function(data) {
//    console.log("Manual station run:\n", data);
//    return opensprinkler.js();
//}).then(function(data) {
//    console.log("Station Status:\n===============\n", data.sn);
}).catch(function(err) {
    console.log("Error: ", err);
});

