var StripeSession = require("../models/payment");
var userToken = require("../models/token");
const User = require("../models/user");
var client = require("../services/openaiClient");
const VacancyAI = require("../services/vacancyAI");
const { Seeker } = require("../models/seeker");
const { uploadToS3 } = require("../services/upload_to_s3");

async function getReferersFromDB({
  job_url = null,
  job_title = null,
  company_name = null,
}) {
  console.log("Fetching referers from DB for:", {
    job_url,
    job_title,
    company_name,
  });

  try {
    var aiResponse = await VacancyAI.vacancyMatch({
      job_url,
      job_title,
      company_name,
    });

    if (aiResponse == null) {
      return [];
    } else {
      if (aiResponse.matches.length == 0) {
        return [];
      } else {
        var userIdArray = Array();
        aiResponse.matches.forEach((element) => {
          if (!userIdArray.includes(element.user_id)) {
            userIdArray.push(element.user_id);
          }
        });
        var userData = await User.findByArray(userIdArray);
        userData.data.forEach((each) => {
          each.name = each.full_name;
          each.company = "Google";
          each.role = "Backend Engineer";
          each.photo = each.picture;
          each.location = "Bangladesh";
          each.linkedin =
            "https://www.linkedin.com/in/tafsirul-islam-b6b593338/";
          each.vacancies = "5";
        });
        console.log(userData.data);

        return userData.data;
      }
    }
  } catch (error) {
    console.error("Error in getReferersFromDB:", error);
    return [];
  }
}

const instructions = `
    You are the Job Matching Assistant. Your role is:
    - Accept one or more of the following input fields: "job_url", "job_title", "company_name".
    - Validate inputs: at least one of these fields must be provided.
    - Call the function "getReferers" to fetch referer data from the database.
    - Filter results based on who can refer this particular seeker into the job of the company
    - Return a clean, structured response of referers who best match the criteria.
    - If no matches are found, return an empty array.
    - Results must be in JSON array format.
`;

exports.checkMatchesOfReferer = async (req, res, next) => {
  try {
    const seekerInput = {
      job_url: req.body.job_spec_url,
      job_title: req.body.job_title,
      company_name: req.body.job_company,
    };
    console.log("Seeker input:", seekerInput);
    var result = await getReferersFromDB(seekerInput);

    result = JSON.stringify(result);

    var data = {
      message: "Accepted",
      referers_found: true,
      referer_count: JSON.parse(result).length,
      data: JSON.parse(result),
    };
    res.status(201).json(data);
  } catch (err) {
    console.log("Error in checkMatchesOfReferer:", err);
    var data = {
      message: "Accepted",
      referers_found: false,
      referer_count: 0,
      data: [],
    };
    res.status(201).json(data);
  }
};

exports.verifySeekerInfoForSession = function (req, res, next) {
  var frontendUid = req.body.frontendUid;
  StripeSession.findSessionByUid(frontendUid).then((stripeData) => {
    if (stripeData.data.length > 0) {
      var stripeData = stripeData.data[0];
      if (stripeData.is_expired == true) {
        return res.status(400).json({ message: "Session expired" });
      } else {
        userToken.findByUserId(stripeData.user_id).then((data) => {
          StripeSession.updateSession(stripeData.id, { is_expired: true }).then(
            (stripeSelection) => {
              var tokenData = data.data[0];
              var respData = {
                message: "Accepted",
                referers_found: true,
                token: tokenData.id,
                data: [
                  {
                    id: 46,
                    name: "Suhaib Safwan",
                    url: "https://www.linkedin.com/in/suhaib-safwan/",
                    photo:
                      "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU",
                    vacancies: 5,
                    company_name: "Facebook",
                    location: "USA",
                  },
                  {
                    id: 47,
                    name: "Tafsir",
                    url: "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                    photo:
                      "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU",
                    vacancies: 7,
                    company_name: "Meta",
                    location: "USA",
                  },
                  {
                    id: 47,
                    name: "Faruk",
                    url: "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                    photo:
                      "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU",
                    vacancies: 7,
                    company_name: "Meta",
                    location: "USA",
                  },
                ],
              };
              res.status(200).json(respData);
            }
          );
        });
      }
    } else {
      var data = {
        message: "Invalid Meta UID provided",
      };
      res.status(201).json(data);
    }
  });
};

exports.seekerMarketplace = async function seekerMarketplace(req, res, next) {
  var seekerData = await Seeker.fetchAll();

  res.status(200).json({
    data: seekerData.data || [],
  });
};

exports.uploadCv = async function uploadCv(req, res, next) {
  var seekerId = req.seeker.id;
  console.log("Seeker ID -> ", seekerId);
  var cvUrl = await uploadToS3(req.file);
  console.log("CV URL -> ", cvUrl);
  await Seeker.update(seekerId, { cv_url: cvUrl });

  res.status(200).json({
    message: "cv updated",
  });
};
