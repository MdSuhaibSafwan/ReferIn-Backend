const Token = require("../models/token");
const User = require("../models/user");

module.exports = function authMiddleware(req, res, next){
    var authToken = req.headers.authorization || null;
    if (authToken == null || authToken == undefined || authToken == "") {
        res.status(401).json({"message": "Unauthorized"});
        return null;
    }
    Token.findById(authToken)
    .then((resp) => {
        if (resp.data.length == 0) {
            res.status(401).json({"message": "Unauthorized"});
            return null;
        } else {
            var user_id = resp.data[0].user_id;
            User.findById(user_id)
            .then((resp) => {
                if (resp.data.length == 0) {
                    res.status(401).json({"message": "Unauthorized"});
                    return null;
                }
                req.user = resp.data[0];
                next()
            })
            .catch(err => {
                res.status(401).json({"message": "Unauthorized"});
                return null;
            });


        }
    })
    .catch((err) => {
        res.status(401).json({"message": "Unauthorized"});
        return null;
    });
};