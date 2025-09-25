const Token = require("../models/token");
const User = require("../models/user");
const Seeker = require("../models/seeker");


module.exports = async function seekerMiddleware(req, res, next){
    var userId = req.user.id;
    seekerFetchedData = await Seeker.findByUserId(userId)
    if (seekerFetchedData.data.length == 0){
        res.status(403).json({"message": "You are not a seeker"});
    }
    else{
        req.referer = seekerFetchedData.data[0];
        next();
    }
};