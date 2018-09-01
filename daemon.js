exports.Daemon = class {
    constructor(url){
        this.url = url;

        this.colors = require('colors');

        const { Crypter } = require('./Services/crypter');
        this.crypter = new Crypter();

        this.request = require('request');

        this.si = require('systeminformation');

        this.fs = require('fs');
        this.os = require('os');
    }

    run(){
        this.startLongPolling();
    }

    startLongPolling(){
        let data = this.fs.readFileSync(this.os.homedir() + "/.servitor/config");
        let json = JSON.parse(data);

        let userKey = this.crypter.decrypt(json.userkey);
        let apiKey  = this.crypter.decrypt(json.apikey);

        // console.log("Start polling ".green);
        this.call(userKey, apiKey);
    }

    call(userKey, apiKey){
        var self = this;

        let cpu              = this.si.currentLoad();
        let mem              = this.si.mem();
        let size             = this.si.fsSize();
        let network          = this.si.networkStats();

        Promise.all([
            cpu,
            mem,
            size,
            network
        ]).then(values => {
             let cpu        = values[0];
             let mem        = values[1];
             let size       = values[2];
             let network    = values[3];

             var requestData = {
                 cpu: cpu,
                 mem: mem,
                 size: size,
                 network: network,
             }

            var options = {
                    method: 'POST',
                url: "http://" + this.url + ":6001/statistics/long-polling",
                headers: {
                    "Authorization-userkey": userKey,
                    "Authorization-apikey": apiKey,
                },
                timeout: 600000,
                json: requestData,
            };

            this.request(options, function(error, response, body){
                // console.log(error);
                // console.log("Got response from application, waiting and polling again.".yellow);
                setTimeout(() => {
                    self.call(userKey, apiKey);
                }, 10*1000);
            });
        });
    }
}