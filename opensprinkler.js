var Client = require('node-rest-client').Client;
var crypto = require('crypto');
var Promise = require('bluebird');

module.exports = function(host, port, password) {
    var password_hash = crypto.createHash('md5').update(password).digest('hex');
    var client = new Client();

    var register = function(path) {
        var url = "http://" + host + ":" + port + path;
        return function(params) {
            if (typeof params == 'undefined') {
                params = {};
            }
            var args = { path: params };
            args.path.pw = password_hash;
            return new Promise(function(resolve, reject) {
                var req = client.get(url, args, function(data, response) {
                    if (typeof data == undefined) {
                        reject('Unknown client response! No data.');
                    }
                    else if (typeof data.result != 'undefined' && data.result != '1') {
                        reject('Invalid result: ' + data.result);
                    }
                    else {
                        resolve(data);
                    }
                });
                req.on('error', function(err) {
                    reject(err);
                });
            });
        };
    };

    // Get station names
    this.jn = register("/jn?pw=${pw}");

    // Get station status
    this.js = register("/js?pw=${pw}");

    // Manual station run
    // sid: Station index (starting from 0)
    // en: Enable bit (1: open the selected station; 0: close the selected station).
    // t: Timer (in seconds). Acceptable range is 0 to 64800 (18 hours). The timer value must be provided if opening a station.
    this.cm = register("/cm?pw=${pw}&sid=${sid}&en=${en}&t={t}");

    // Start Run-Once Program
    // Starts a run-once program for the given duration for each station defined in t, as an array
    // t: An array of station durations, one for each station: [60,0,0,15,15,0]
    this.cr = register("/cr?pw=${pw}&t={t}");
}
