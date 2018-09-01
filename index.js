#!/usr/bin/env node

var commander = require('commander');

var { Setup }       = require('./setup');
var { Statistics }  = require('./statistics');
var { Daemon }      = require('./daemon');

commander.version('0.0.2')
    .option('-s, --setup', 'Setup the daemon.')
    .option('-u, --url [url]', 'Custom url for development purposes.', 'api.servitor.pw')
    .option('-d, --daemon', 'Run this application as a daemon, required for real time statistics')
    .option('-a, --daemonurl [daemonurl]', 'Custom url for the daemon for development purposes.', 'api.servitor.pw')
    .option('-uk, --userkey [userkey]', 'User key, used for installing the daemon without questions.')
    .option('-ak, --apikey [apikey]', 'Api key, used for installing the daemon without questions.')
    .parse(process.argv);

var setup  = commander.setup;
var url    = commander.url;

var daemon = commander.daemon;
var daemonUrl = commander.daemonurl;

var userKey = commander.userkey;
var apiKey = commander.apikey;

// If setup is true, we are going to create or update the credentials stored in ~/.servitor/config
// Otherwise we are going to assume these credentials exists, and upload the required stuff.
if(setup) {
    let setup = new Setup();
    setup.setCommandLineArguments(userKey, apiKey);
    setup.run();
}else if(daemon){
    let daemon = new Daemon(daemonUrl);
    daemon.run();
}else{
    let statistics = new Statistics(url);
    statistics.run();
}