const auth = require('basic-auth');
const User = require('./models/user');
const bcrypt = require('bcrypt');


class Checker {

    static checkAuth(req, res, next) {

        let credentials = auth(req);

        if (!credentials) {
            res.sendStatus(401);
        } else {
            Checker.check(res, next, credentials.name, credentials.pass, 0);
        }         
    }

    static checkAdmin(req, res, next) {
        let credentials = auth(req);

        if (!credentials) {
            res.sendStatus(401);
        } else {
            Checker.check(res, next, credentials.name, credentials.pass, 1);
        }      
    }


    static check(res, next, login, password, role) {

        User.findOne({ login: login })
            .then(user => {

                if(!user){ res.sendStatus(401); } 

                bcrypt.compare(password, user.passwordHash, function (err, resp) {
                    if (resp === true || password === user.passwordHash) {
                        if(user.role >= role){
                            next();
                        }else{
                            res.sendStatus(401);
                        }
                    }
                    else {
                        res.sendStatus(401);
                    }
                });
            })
            .catch(() => { res.sendStatus(401); });
    }
};

module.exports = Checker;