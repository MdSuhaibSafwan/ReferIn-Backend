const dotenv = require("dotenv");
const User = require("../models/user");
const UserToken = require("../models/token");
const Referer = require("../models/referer");
const { Seeker } = require("../models/seeker");
const { UserTokenSerializer } = require("../serializers/token");
const axios = require("axios");
const jwtDecode = require("jwt-decode");
const StripeSession = require("../models/payment");
const jwt = require("jsonwebtoken");

dotenv.config();

async function addParamToUrl(url, key, value) {
  let parsedUrl = new URL(url);
  parsedUrl.searchParams.set(key, value);
  return parsedUrl.toString();
}

exports.linkedInAuth = async (req, res, next) => {
  const scope = "openid profile email";

  var stateData = {
    redirectionUrl: req.body.redirection_url,
    getToken: req.body.get_token,
    userType: req.body.user_type,
    cvUrl: req.body.cvUrl,
    current_situation: req.body.current_situation,
    current_employment: req.body.current_employment,
  };

  const state = encodeURIComponent(JSON.stringify(stateData));
  console.log(stateData);

  var url = process.env.LINKEDIN_REDIRECT_URI;
  const callbackUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
    process.env.LINKEDIN_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    url
  )}&state=${state}&scope=${encodeURIComponent(scope)}`;
  res.status(200).json({ link: callbackUrl });
};

exports.linkedInCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code returned from LinkedIn");

  const state = req.query.state;
  const stateData = JSON.parse(decodeURIComponent(state));
  var getToken = stateData.getToken;
  var redirectionUri = stateData.redirectionUrl;
  var userType = stateData.userType;
  var cvUrl = stateData.cvUrl;
  var currentSituation = stateData.current_situation;
  var currentEmployment = stateData.current_employment;

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;
    const idToken = tokenResponse.data.id_token;

    const userJWTDecooded = jwtDecode.jwtDecode(idToken);

    var userLinkedInResponseData = {
      linkedin_aud: userJWTDecooded.aud,
      linkedin_sub: userJWTDecooded.sub,
      full_name: userJWTDecooded.name,
      given_name: userJWTDecooded.given_name,
      family_name: userJWTDecooded.family_name,
      picture: userJWTDecooded.picture,
      email: userJWTDecooded.email,
    };

    var userFilter = await User.findByEmail(userJWTDecooded.email);
    console.log("user filter data", userFilter);
    if (userFilter.data.length > 0) {
      var user = userFilter.data[0];
      var tokenSerialized = await UserTokenSerializer.serializeByUserData(user);
      const encodedCode = jwt.sign(tokenSerialized, process.env.JWT_SECRET);
      var url = await addParamToUrl(redirectionUri, "code", encodedCode);
      res.redirect(url);
    } else {
      if (!userType) {
        // If not user Type then no user found
        res.status(404).send("No user found");
        return null;
      }
      var userInsertData = {
        ...userLinkedInResponseData,
        user_type: userType,
        current_situation: currentSituation,
        current_employment: currentEmployment,
      };
      var userInsert = await User.insert(userInsertData);
      var user = userInsert.data[0];

      var userTokenInsert = await UserToken.insert({ user_id: user.id });
      var userToken = userTokenInsert.data[0];

      if (userType == "seeker") {
        var seekerInsert = await Seeker.insert({
          user_id: user.id,
          image: user.picture,
          email: user.email,
          cv_url: cvUrl,
        });
        var seeker = seekerInsert.data[0];
        console.log(seeker);
      } else if (userType == "referrer") {
        var refererInsert = await Referer.insert({
          user_id: user.id,
          picture: user.picture,
          email: user.email,
          full_name: user.full_name,
        });
        var referer = refererInsert.data[0];
      } else {
        res.status(404).send("No user found");
        return null;
      }

      if (getToken) {
        var url = await addParamToUrl(redirectionUri, "token", userToken.id);
        redirectionUri = url;
      }
    }

    res.redirect(redirectionUri);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error during LinkedIn OAuth process");
    return null;
  }
};
