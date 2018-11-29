exports.Statistics = class {
    constructor(url){
        this.url = url;

        this.fs = require('fs');
        this.os = require('os');

        const { Crypter } = require('./Services/crypter');
        this.crypter = new Crypter();

        this.si = require('systeminformation');
        this.osUtil = require('os-utils');

        this.request = require('request');
    }

    run(){
        let data = "";
        try {
            data = this.fs.readFileSync(this.os.homedir() + "/.servitor/config");
        }catch (err) {
            console.log("Failed to open the configuration file (~/.servitor/config.js). " +
                "Please re-un the setup to create a config file by using the --setup flag.")
            console.log("Error message: " + err);
            return;
        }

        let json = JSON.parse(data);

        let userKey = this.crypter.decrypt(json.userkey);
        let apiKey  = this.crypter.decrypt(json.apikey);

        let system           = this.si.system();
        let cpu              = this.si.currentLoad();
        let mem              = this.si.mem();
        let size             = this.si.fsSize();
        let networkInterface = this.si.networkInterfaceDefault();
        let network          = this.si.networkStats();
        let processes        = this.si.processes();

        Promise.all([
            system,
            cpu,
            mem,
            size,
            networkInterface,
            network,
            processes
        ]).then(values => {
            let system              = values[0];
            let cpu                 = values[1];
            let mem                 = values[2];
            let size                = values[3];
            let networkInterface    = values[4];
            let network             = values[5];
            let processes           = values[6];

            this.osUtil.cpuUsage((v) =>{
                cpu.currentload = (v*100);
                processes = processes.list
                    .map(p => {
                        return {
                            pid: p.pid,
                            process: p.command, //.slice(0,10),
                            cpu: parseFloat(p.pcpu.toFixed(1)),
                            mem: parseFloat(p.pmem.toFixed(1))
                        }
                    });

                var requestData = {
                    system: system,
                    mem: mem,
                    size: size[0],
                    network: network,
                    processes: {
                        cpu: processes.sort((a, b) => {
                            return b.cpu - a.cpu;
                        }).splice(0, 15),
                        mem: processes.sort((a, b) => {
                            return b.mem - a.mem
                        }).splice(0, 10)
                    },
                    cpu: cpu,
                };

                var options = {
                    method: 'post',
                    url: 'http://' + this.url + '/api/v1/statistics',
                    headers: {
                        "Authorization-userkey": userKey,
                        "Authorization-apikey": apiKey,
                    },
                    json: requestData,
                };
                this.doRequest(options);
            });
        })
    }

    doRequest(options){
        this.request(options, function (error, response, body) {
            if (error && !response){
                console.log(error, options);
            } else if (!error && response.statusCode === 200) {
                console.log(body)
            }else{
                console.log(response.statusCode);
            }
        });
    }
};