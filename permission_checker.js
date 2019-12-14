
class Checker {

    static checkAuth(req, res, next) {
        if (!req.user) return res.sendStatus(401); 
        next();  
    }
    
    static checkAdmin(req, res, next) {
        if (!req.user) res.sendStatus(401); 
        else if (req.user.role !== 1) res.sendStatus(403); 
        else next(); 
    }

    static authData(req) {
        let user = req.user;
        let admin = false;

        if(user && user.role === 1) admin = true;
        return {
            aurzed: user,
            admin: admin
        };
    }

};

module.exports = Checker;





