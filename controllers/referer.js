const { Vacancy } = require("../models/vacancy");
const path = require("path");
const ExtractText = require("../services/extractText");
const VacancyAI = require("../services/vacancyAI");

exports.checkSeekerCountViaCompany = function (req, res, next) {
  var data = {
    match_found: true,
    total_matches: 10,
  };

  res.status(200).json(data);
};

exports.sendSessionInfoWithParams = function (req, res, next) {
  var data = {
    message: "Accepted",
  };
  res.status(201).json(data);
};

exports.sendVacancyData = async (req, res, next) => {
  var jobSpecUrl = req.body.job_spec_url;
  var jobTitle = req.body.job_title;
  var vacancyFile = req.file;

  if (vacancyFile) {
    var fileName = vacancyFile.originalname;
    const filePath = path.join(__dirname, "..", "uploads", fileName);
    var fileData = await ExtractText.extractTextFromFile(filePath);

    var openAiResponse = await VacancyAI.parseJobDetails(fileData);
  } else {
    var openAiResponse = await VacancyAI.parseJobDetailsFromUrl(jobSpecUrl);
  }

  var vacancyData = {
    job_title: openAiResponse.job_title,
    company_name: openAiResponse.company_name,
    country: openAiResponse.country,
    is_remote: openAiResponse.is_remote,
    description: openAiResponse.summary,
    user_id: req.user.id,
  };
  var resp = await Vacancy.insert(vacancyData);
  var data = {
    message: "vacancy add successfull",
  };
  res.status(200).json(data);
};

exports.sendSeekerData = function (req, res, next) {
  var data = {
    data: [
      {
        id: 46,
        name: "Suhaib Safwan",
        url: "https://www.linkedin.com/in/suhaib-safwan/",
        vacancies: 5,
        company_name: "Facebook",
        location: "USA",
      },
      {
        id: 47,
        name: "Tafsir",
        url: "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
        vacancies: 7,
        company_name: "Meta",
        location: "USA",
      },
      {
        id: 47,
        name: "Tafsir",
        url: "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
        vacancies: 7,
        company_name: "Meta",
        location: "USA",
      },
      {
        id: 47,
        name: "Tafsir",
        url: "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
        vacancies: 7,
        company_name: "Meta",
        location: "USA",
      },
      {
        id: 47,
        name: "Tafsir",
        url: "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
        vacancies: 7,
        company_name: "Meta",
        location: "USA",
      },
    ],
  };
  res.status(200).json(data);
};

exports.getPotentialSeekers = async function (req, res, next) {
  const data = [
    {
      id: 1,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "Sarah Johnson",
      matchScore: 95,
      jobTitle: "Frontend Developer",
      primarySkill: "React/TypeScript",
      location: "London",
      experience: "5+ years experience • Available immediately",
    },
    {
      id: 2,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "Michael Chen",
      matchScore: 88,
      jobTitle: "Product Designer",
      primarySkill: "UI/UX Design",
      location: "Manchester",
      experience: "3+ years experience • Available in 2 weeks",
    },
    {
      id: 3,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "Emily Rodriguez",
      matchScore: 92,
      jobTitle: "Backend Engineer",
      primarySkill: "Node.js/Python",
      location: "Remote",
      experience: "4+ years experience • Available immediately",
    },
    {
      id: 4,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "James Wilson",
      matchScore: 87,
      jobTitle: "DevOps Engineer",
      primarySkill: "AWS/Docker",
      location: "Birmingham",
      experience: "6+ years experience • Available in 1 month",
    },
    {
      id: 5,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "Lisa Thompson",
      matchScore: 90,
      jobTitle: "Full Stack Developer",
      primarySkill: "React/Node.js",
      location: "Edinburgh",
      experience: "4+ years experience • Available immediately",
    },
    {
      id: 6,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "David Martinez",
      matchScore: 85,
      jobTitle: "Data Scientist",
      primarySkill: "Python/ML",
      location: "London",
      experience: "3+ years experience • Available in 2 weeks",
    },
    {
      id: 7,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "Anna Kowalski",
      matchScore: 93,
      jobTitle: "Mobile Developer",
      primarySkill: "React Native",
      location: "Manchester",
      experience: "5+ years experience • Available immediately",
    },
    {
      id: 8,
      candidateImage: "/fallbackUserImg.png",
      candidateName: "Tom Anderson",
      matchScore: 89,
      jobTitle: "QA Engineer",
      primarySkill: "Automation Testing",
      location: "Remote",
      experience: "4+ years experience • Available in 1 week",
    },
  ];
  res.status(200).json({
    success: true,
    data: data,
    count: data.length ?? 0,
  });
};
