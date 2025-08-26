var StripeSession = require("../models/payment");
var userToken = require("../models/token");


exports.sendSessionInfoWithParams = function(req, res, next){

    var data = {
        "message": "Accepted",
        "referers_found": true
    }
    res.status(201).json(data)
}


exports.verifySeekerInfoForSession = function(req, res, next){
    var frontendUid = req.body.frontendUid;
    StripeSession.findSessionByUid(frontendUid)
    .then((stripeData) => {
        if (stripeData.data.length > 0) {
            var userData = stripeData.data[0]
            userToken.findByUserId(userData.user_id)
            .then((data) => {
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

                console.log("Working As async")
                // console.log(stripeData.data[0]);
            })
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
