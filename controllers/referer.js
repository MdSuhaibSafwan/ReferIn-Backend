
exports.checkSeekerViaCompany = function(req, res, next){
    var data = {
        "match_found": true,
        "total_matches": 15
    };

    res.status(200).json(data);
};

exports.sendSessionInfoWithParams = function(req, res, next){

    var data = {
        "message": "Accepted"
    }
    res.status(201).json(data)
}

exports.sendVacancyData = function(req, res, next){
    var data = {
        "message": "vacancy add successfull",
    }
    res.status(200).json(data)
}
