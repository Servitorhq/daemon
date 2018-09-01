exports.Crypter = class {
    constructor(){
        this.crypto = require('crypto');
        this.algorithm = 'aes-256-ctr';
        this.password = 'd6F3Efeq';
    }

    encrypt(text){
        var cipher = this.crypto.createCipher(this.algorithm,this.password);
        var crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    decrypt(text){
        var decipher = this.crypto.createDecipher(this.algorithm,this.password);
        var dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
};