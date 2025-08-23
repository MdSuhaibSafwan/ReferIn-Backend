
exports.signup = function(req, res, next){
    var data = {
        "username": "suhaib",
        "token": "1234567890",
    }
    res.status(200).json(data);
};
