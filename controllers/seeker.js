var StripeSession = require("../models/payment");
var userToken = require("../models/token");
var client = require("../services/openaiClient");

async function getReferersFromDB({ job_url=null, job_title=null, company_name=null }) {
  console.log("Fetching referers from DB for:", { job_url, job_title, company_name });

  return [
    {
        name: "Alice Johnson", 
        company: "Google", 
        role: "Backend Engineer", 
        photo: "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU", 
        location: "USA", 
        vacancies: "5", 
        linkedin: "https://linkedin.com/in/alice" 
    },
    { 
        name: "Bob Smith", 
        company: "Microsoft", 
        role: "Electrical Engineer", 
        photo: "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU", 
        location: "USA", 
        vacancies: "5", 
        linkedin: "https://linkedin.com/in/bob" 
    },
    { 
        name: "John Smith", 
        company: "Google", 
        role: "Manager of Google Tech Team", 
        photo: "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU", 
        location: "USA", 
        vacancies: "5", 
        linkedin: "https://linkedin.com/in/bob" 
    },
  ]
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
    const seekerInput = {
      job_url: req.body.job_spec_url,
      job_title: req.body.job_title,
      company_name: req.body.job_company,
    };
    console.log("Seeker input:", seekerInput);
    var result = await getReferersFromDB(seekerInput);

    result = JSON.stringify(result);

    var input = [
        {
            role: "system",
            content: instructions,
        },
        {
            role: "user",
            content: `Seeker Input: ${JSON.stringify(seekerInput)}
            Referers Data: ${result}
            Instructions:
            - Always respond in JSON array format like [referer1_data, referer2_data, ...] it shouldn't say {"matched_referers": [referer1_data, referer2_data, ...]}
            - If no matches, return empty array.
        `
        }
    ];

    var response = await client.responses.create({
        model: "gpt-3.5-turbo",
        input: input
    });

    try{
        var filteredReferers = JSON.parse(response.output_text);
        var data = {
            "message": "Accepted",
            "referers_found": true,
            "referer_count": filteredReferers.length,
            "data": filteredReferers

        }
        res.status(201).json(data)
    }
    catch(err) {
        console.log(err);
        console.log(response.output_text);
        var data = {
            "message": "Accepted",
            "referers_found": true,
            "referer_count": 0,
            "data": []

        }
        res.status(201).json(data)

    }

    console.log("Response from OpenAI:", filteredReferers);
};


exports.verifySeekerInfoForSession = function(req, res, next){
    var frontendUid = req.body.frontendUid;
    StripeSession.findSessionByUid(frontendUid)
    .then((stripeData) => {
        if (stripeData.data.length > 0) {
            var stripeData = stripeData.data[0]
            if (stripeData.is_expired == true) {
                return res.status(400).json({"message": "Session expired"})
            } else {
                userToken.findByUserId(stripeData.user_id)
                .then((data) => {
                    StripeSession.updateSession(stripeData.id, {"is_expired": true})
                    .then((stripeSelection) => {
                        var tokenData = data.data[0];
                        var respData = {
                            "message": "Accepted",
                            "referers_found": true,
                            "token": tokenData.id,
                            "data":[
                                {
                                    "id": 46,
                                    "name": "Suhaib Safwan",
                                    "url": "https://www.linkedin.com/in/suhaib-safwan/",
                                    "photo": "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU",
                                    "vacancies": 5,
                                    "company_name": "Facebook",
                                    "location": "USA"
                                },
                                {
                                    "id": 47,
                                    "name": "Tafsir",
                                    "url": "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                                    "photo": "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU",
                                    "vacancies": 7,
                                    "company_name": "Meta",
                                    "location": "USA"
                                },
                                {
                                    "id": 47,
                                    "name": "Faruk",
                                    "url": "https://www.linkedin.com/in/tafsirul-islam-b6b593338/",
                                    "photo": "https://media.licdn.com/dms/image/v2/D5603AQGwIRxoiwakTw/profile-displayphoto-shrink_400_400/B56ZPTQ_SsHoAg-/0/1734416267206?e=1758758400&v=beta&t=W2gZN4T_Ix1bG9JIo2gPJClmrDrIbf60J3NAC5nuBdU",
                                    "vacancies": 7,
                                    "company_name": "Meta",
                                    "location": "USA"
                                }
                            ]
                        }
                        res.status(200).json(respData);
                    })

                })
            }

        } else {
            var data = {
                "message": "Invalid Meta UID provided",
            }
            res.status(201).json(data)
        }
    })

    // var data = {
        
    // }
    // res.status(200).json(data);
}
