const Token = require("../models/token");
const User = require("../models/user");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");


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
        const s3 = new S3Client({
          region: process.env.S3_REGION,
          endpoint: process.env.S3_ENDPOINT,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECREY_ACCESS_KEY,
          },
          forcePathStyle: true,
        });

        const bucketName = process.env.S3_BUCKET_NAME;
        const key = `resumes/${Date.now()}_${req.file.originalname}`;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        });
        await s3.send(command);

        const fileUrl = `${process.env.S3_MEDIA_URL}/${bucketName}/${key}`;
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
