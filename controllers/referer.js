const Vacancy = require("../models/vacancy");
const path = require("path");
const extractFileData = require("../services/extractFileData");
const parseVacancy = require("../services/parseVacancyData");


exports.checkSeekerCountViaCompany = function(req, res, next){
    var data = {
        "match_found": true,
        "total_matches": 10
    };

    res.status(200).json(data);
};

exports.sendSessionInfoWithParams = function(req, res, next){

    var data = {
        "message": "Accepted"
    }
    res.status(201).json(data)
}

exports.sendVacancyData = async (req, res, next) => {
    console.log(req.body);
    var jobSpecUrl = req.body.job_spec_url;
    var jobTitle = req.body.job_title;
    var vacancyFile = req.file;

    console.log(jobSpecUrl, jobTitle, vacancyFile);
    console.log("\n");

    var fileName = vacancyFile.originalname;
    const filePath = path.join(__dirname, "..", "uploads", fileName);
    var fileData = await extractFileData(filePath)
    
    var openAiResponse = await parseVacancy(fileData);

    var vacancyData = {
        "job_title": "Software Developer",
        "company_name": "Microsoft",
        "country": "India",
        "is_remote": true,
        "description": "We need a Software Developer to join our team urgently",
        "user_id": req.user.id,
    }

    var resp = await Vacancy.insert(vacancyData);    
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
            },
            {
                "id": 47,
                "name": "Tafsir",
                "url": "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                "vacancies": 7,
                "company_name": "Meta",
                "location": "USA"
            },
            {
                "id": 47,
                "name": "Tafsir",
                "url": "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                "vacancies": 7,
                "company_name": "Meta",
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
