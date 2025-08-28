const Vacancy = require("../models/vacancy");
const path = require("path");
const ExtractText = require("../services/extractText");
const VacancyAI = require("../services/vacancyAI");


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
    var jobSpecUrl = req.body.job_spec_url;
    var jobTitle = req.body.job_title;
    var vacancyFile = req.file;

    if (vacancyFile) {
        var fileName = vacancyFile.originalname;
        const filePath = path.join(__dirname, "..", "uploads", fileName);
        var fileData = await ExtractText.extractTextFromFile(filePath)
        
        var openAiResponse = await VacancyAI.parseJobDetails(fileData);

    } else {
        var openAiResponse = await VacancyAI.parseJobDetailsFromUrl(jobSpecUrl);
    };

    var vacancyData = {
        "job_title": openAiResponse.job_title,
        "company_name": openAiResponse.company_name,
        "country": openAiResponse.country,
        "is_remote": openAiResponse.is_remote,
        "description": openAiResponse.summary,
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
