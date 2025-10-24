const Token = require("../models/token");
const User = require("../models/user");
const {uploadToS3, } = require("../services/upload_to_s3");


exports.authMiddleware = function authMiddleware(req, res, next){
    var authToken = req.headers.authorization || null;
    if (authToken == null || authToken == undefined || authToken == "") {
        res.status(401).json({"message": "Unauthorized"});
        return null;
    }
    Token.findById(authToken)
    .then((resp) => {
        if (resp.data.length == 0) {
            res.status(401).json({"message": "Unauthorized"});
            return null;
        } else {
            var user_id = resp.data[0].user_id;
            User.findById(user_id)
            .then((resp) => {
                if (resp.data.length == 0) {
                    res.status(401).json({"message": "Unauthorized"});
                    return null;
                }
                req.user = resp.data[0];
                next()
            })
            .catch(err => {
                res.status(401).json({"message": "Unauthorized"});
                return null;
            });


        }
    })
    .catch((err) => {
        res.status(401).json({"message": "Unauthorized"});
        return null;
    });
};


exports.linkedinSignInOrSignUpMiddleware = async function (req, res, next) {
    if (!req.body.redirection_url){
        res.status(400).json({"message": "redirection_url is required"});
    };
    if (!req.body.user_type){
        res.status(400).json({"message": "user_type is required"});
    };

    req.body["user_type"] = req.body.user_type.toLowerCase();

    if (req.body.user_type != "referrer" && req.body.user_type != "seeker"){
        res.status(400).json({"message": "user_type can only be 'referrer' or 'seeker'."});
    };

    req.body["getToken"] = req.body.get_token || false;
    req.body["current_situation"] = req.body.current_situation || "";
    req.body["current_employment"] = req.body.current_employment || "";

    try {
      if (req.file) {
        var fileUrl = await uploadToS3(req.file)
        req.body["cvUrl"] = fileUrl;
      }
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
      return 
    };

    req.body["cvUrl"] = req.body.cvUrl || ""

    next();
}
