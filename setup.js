exports.Setup = class {
    constructor(){
        const { prompt } = require('inquirer');
        this.prompt = prompt;

        const { Crypter } = require('./Services/crypter');
        this.crypter = new Crypter();

        this.os = require('os');
        this.fs = require('fs');
    }

    setCommandLineArguments(userKey, apiKey) {
        this.userKey = userKey;
        this.apiKey  = apiKey;
    }

    run(){
        // If the userkey and apikey exists, use that one, otherwise ask questions.
        if(this.userKey && this.apiKey){
            this.setup(this.userKey, this.apiKey);
        }else {
            this.prompt(this.questions()).then(answers => {
                var userKey = answers.userkey;
                var apiKey = answers.apikey;
                this.setup(userKey, apiKey);
            });
        }
    }

    setup(userKey, apiKey){
        var cryptedUserKey = this.crypter.encrypt(userKey);
        var cryptedApiKey = this.crypter.encrypt(apiKey);

        var data = {
            userkey: cryptedUserKey,
            apikey: cryptedApiKey,
        };

        var dir = this.os.homedir() + "/.servitor";

        if (!this.fs.existsSync(dir)) {
            this.fs.mkdirSync(dir);
        }

        this.fs.writeFileSync(dir + "/config", JSON.stringify(data));
    }

    questions(){
        return [
            {
                type: 'input',
                name: 'userkey',
                message: 'Enter your user key...',
            },
            {
                type: 'input',
                name: 'apikey',
                message: 'Enter your api key...',
            },
        ];
    }
};