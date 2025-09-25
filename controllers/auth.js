const dotenv = require('dotenv')
const User = require('../models/user');
const UserToken = require('../models/token');
const Referer = require('../models/referer');
const {Seeker, } = require('../models/seeker');
const stripeSession = require("../models/payment")
const axios = require('axios');
const jwtDecode = require('jwt-decode');
const StripeSession = require('../models/payment');

dotenv.config();


async function addParamToUrl(url, key, value) {
  let parsedUrl = new URL(url);

  // Add or update param
  parsedUrl.searchParams.set(key, value);

  return parsedUrl.toString();
}

exports.linkedInAuth = (req, res, next) => {
    const scope = 'openid profile email';
    var stateData = {
      "redirectionUrl": req.body.redirection_url, 
      "getToken": req.body.get_token || false, 
      "stripeSessionId": req.body.session_id || "", 
      "metaUid": req.body.meta_uid || "", 
      "userType": req.body.user_type || "referrer",
    }
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
      // If refferer or seeker redirect them to dashboard
      var user = userFilter.data[0];
      var seekerFilter = await Seeker.findByUserId(user.id);
      var seeker, referer;
      if (seekerFilter.data.length > 0){
        seeker = seekerFilter.data[0];
        console.log("User a Seeker")
      };
      var refererFilter = await Referer.findByUserId(user.id);
      if (refererFilter.data.length > 0){
        referer = refererFilter.data[0];
        console.log("User a Referer");
      };


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

exports.linkedInCallback2 = async (req, res) => {
      const code = req.query.code;
      if (!code) return res.status(400).send('No code returned from LinkedIn');
      
      const state = req.query.state;
      const stateData = JSON.parse(decodeURIComponent(state));
      const sessionId = stateData.stripeSessionId;
      const metaUid = stateData.metaUid;
      var getToken = stateData.getToken;
      var redirectionUri = stateData.redirectionUrl;
      var userType = stateData.userType;
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
    
        const user = jwtDecode.jwtDecode(idToken);
    
        var userData = {
          "linkedin_aud": user.aud,
          "linkedin_sub": user.sub,
          "full_name": user.name, 
          "given_name": user.given_name, 
          "family_name": user.family_name, 
          "picture": user.picture,
          "email": user.email,
        }

      if (userType == "referrer") {
        User.getOrCreate(userData)
        .then((resp) => {
          var data = resp.data[0];
          var userId = data.id;
          UserToken.getOrCreate({"user_id": userId})
            .then((resp) => {
              var userToken = resp.data[0].id;
              if (getToken){
                addParamToUrl(redirectionUri, "token", userToken)
                .then((url) => {
                  Referer.getOrCreate({
                    "user_id": userId,
                    "current_company": null,
                    "location": null,
                    "full_name": userData.full_name,
                    "picture": userData.picture,
                    "email": userData.email,
                  })
                  .then((resp) => {
                    redirectionUri = url;
                    console.log(redirectionUri);
                    res.redirect(`${redirectionUri}`);
                  })


                })
                .catch((err) => {
                  console.error(err);
                });
              }

          })

          .catch(err => console.log(err))
        })
        .catch(err => console.log(err))


      } else {
        User.getOrCreate(userData)
        .then((resp) => {
          var data = resp.data[0];
          var userId = data.id;
          UserToken.getOrCreate({"user_id": userId})
            .then((resp) => {
              var userToken = resp.data[0].id;
              if (getToken){

                addParamToUrl(redirectionUri, "token", userToken)
                .then((url) => {
                  Seeker.getOrCreate({
                    "user_id": userId,
                    "email": userData.email,
                    "picture": userData.picture,
                    "full_name": userData.full_name,
                  })
                  .then((resp) => {
                    redirectionUri = url;
                    console.log(redirectionUri);
                    res.redirect(`${redirectionUri}`);
                  })

                })
                .catch((err) => {
                  console.error(err);
                });
              } else {
                StripeSession.insertSession({"session_id": sessionId, "meta_uid": metaUid, "user_id": userId});
                res.redirect(`${redirectionUri}`);
              };


          })

          .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

      }





      } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send('Error during LinkedIn OAuth process');
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
 
