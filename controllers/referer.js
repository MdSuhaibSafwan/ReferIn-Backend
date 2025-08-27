
exports.checkSeekerCountViaCompany = function(req, res, next){
    var data = {
        "match_found": true,
        "total_matches": 5
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

exports.sendSeekerData = function(req, res, next){
    var data = {
        data: [
            {
                "id": 46,
                "name": "Suhaib Safwan",
                "url": "https://www.linkedin.com/in/suhaib-safwan/",
                "vacancies": 5,
                "company_name": "Facebook",
                "location": "USA"
            },
            {
                "id": 47,
                "name": "Tafsir",
                "url": "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                "vacancies": 7,
                "company_name": "Meta",
                "location": "USA"
            }
        ]
    }
    res.status(200).json(data);
}
