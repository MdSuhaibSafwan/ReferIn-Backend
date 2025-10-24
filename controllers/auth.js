const dotenv = require('dotenv')
const User = require('../models/user');
const UserToken = require('../models/token');
const Referer = require('../models/referer');
const {Seeker, } = require('../models/seeker');
const {UserTokenSerializer, } = require("../serializers/token");
const axios = require('axios');
const jwtDecode = require('jwt-decode');
const StripeSession = require('../models/payment');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const jwt = require("jsonwebtoken")

dotenv.config();

async function addParamToUrl(url, key, value) {
  let parsedUrl = new URL(url);
  parsedUrl.searchParams.set(key, value);
  return parsedUrl.toString();
}

exports.linkedInAuth = async (req, res, next) => {
    const scope = 'openid profile email';
    console.log("Body ", req.body);
    console.log("Redirection URL -> ", req.body.redirection_url);
    if (!req.body.redirection_url) {
      return res.status(400).json({ error: 'Redirection URL is required' });
    }

    var stateData = {
      "redirectionUrl": req.body.redirection_url, 
      "getToken": req.body.get_token || false, 
      "stripeSessionId": req.body.session_id || "", 
      "metaUid": req.body.meta_uid || "", 
      "userType": req.body.user_type || "referrer",
    }
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
        stateData["cvUrl"] = fileUrl;
        console.log(fileUrl);
      }
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
      return 
    };
  
    const state = encodeURIComponent(JSON.stringify(stateData));
    var url = process.env.LINKEDIN_REDIRECT_URI;
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(url)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    res.status(200).json(
        {"link": authURL}
    );
};


exports.linkedInCallback = async (req, res) => {

  const code = req.query.code;
  if (!code) return res.status(400).send('No code returned from LinkedIn');
  
  const state = req.query.state;
  const stateData = JSON.parse(decodeURIComponent(state));
  const sessionId = stateData.stripeSessionId;
  const metaUid = stateData.metaUid;
  var getToken = stateData.getToken;
  var redirectionUri = stateData.redirectionUrl;
  var userType = stateData.userType;
  var cvUrl = stateData.cvUrl;
  console.log(cvUrl)

  try {
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;
    const idToken = tokenResponse.data.id_token;

    const userJWTDecooded = jwtDecode.jwtDecode(idToken);

    var userLinkedInResponseData = {
      "linkedin_aud": userJWTDecooded.aud,
      "linkedin_sub": userJWTDecooded.sub,
      "full_name": userJWTDecooded.name, 
      "given_name": userJWTDecooded.given_name, 
      "family_name": userJWTDecooded.family_name, 
      "picture": userJWTDecooded.picture,
      "email": userJWTDecooded.email,
    };

    var userFilter = await User.findByEmail(userJWTDecooded.email);
    if (userFilter.data.length > 0){
      var user = userFilter.data[0];
      var tokenSerialized = await UserTokenSerializer.serializeByUserData(user);
      const encodedCode = jwt.sign(tokenSerialized, process.env.JWT_SECRET,);
      var url = await addParamToUrl(redirectionUri, "code", encodedCode);
      res.redirect(url);

    } else {
      if (!userType) {
        // If not user Type then no user found
        res.status(404).send('No user found');
        return null;
      };
      var userInsert = await User.insert(userLinkedInResponseData);
      var user = userInsert.data[0];

      var userTokenInsert = await UserToken.insert({"user_id": user.id})
      var userToken = userTokenInsert.data[0];

      if (userType == "seeker") {
        var seekerInsert = await Seeker.insert({
          "user_id": user.id,
          "image": user.picture,
          "email": user.email,
          "full_name": user.full_name,
        })
        var seeker = seekerInsert.data[0];
        console.log(seeker);

      } else if (userType == "referrer") {
        var refererInsert = await Referer.insert({
          "user_id": user.id,
          "picture": user.picture,
          "email": user.email,
          "full_name": user.full_name,
        })
        var referer = refererInsert.data[0];

      } else {
        res.status(404).send('No user found');
        return null;
      }

      if (getToken){
        var url = await addParamToUrl(redirectionUri, "token", userToken.id)
        redirectionUri = url;
      }
      if (sessionId || metaUid){ 
        StripeSession.insertSession({"session_id": sessionId, "meta_uid": metaUid, "user_id": user.id});
      }
    }

    res.redirect(redirectionUri);

  } catch(err) {
      console.error(err.response?.data || err.message);
      res.status(500).send('Error during LinkedIn OAuth process');
      return null;
  }

};


exports.getAllUsers = (req, res, next) => {

  User.fetchAll()
  .then((resp) => {
    return resp.data;
  })
  .then((data) => {
    console.log(data);
  })
  .catch(err => console.log(err))
  res.status(200).json(
    {"message": "users"}
  )
}
 
exports.signin = (req, res, next) => {
    const scope = 'openid profile email';
    var stateData = {
      "redirectionUrl": req.body.redirection_url, 
      "getToken": true, 
    };
    const state = encodeURIComponent(JSON.stringify(stateData));
    var url = process.env.LINKEDIN_REDIRECT_URI;
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(url)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    res.status(200).json(
        {"link": authURL}
    );
};


