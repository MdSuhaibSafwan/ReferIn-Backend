const {Seeker, } = require("../models/seeker");


exports.seekerMiddleware = async function seekerMiddleware(req, res, next){
    var userId = req.user.id;
    seekerFetchedData = await Seeker.findByUserId(userId)
    if (seekerFetchedData.data.length == 0){
        res.status(403).json({"message": "User is not a seeker"});
    }
    else{
        req.seeker = seekerFetchedData.data[0];
        next();
    }
};