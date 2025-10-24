const Token = require("../models/token");
const User = require("../models/user");
const Referer = require("../models/referer");


exports.refererMiddleware = async function refererMiddleware(req, res, next){
    var userId = req.user.id;
    refererFetchedData = await Referer.findByUserId(userId)
    if (refererFetchedData.data.length == 0){
        res.status(403).json({"message": "You are not a referer"});
    }
    else{
        req.referer = refererFetchedData.data[0];
        next();
    }
};