const dotenv = require('dotenv')
const User = require('../models/user');
const UserToken = require('../models/token');
const axios = require('axios');
const jwtDecode = require('jwt-decode');

dotenv.config();

exports.linkedInAuth = (req, res, next) => {
    const scope = 'openid profile email';
    var stateData = {"redirectionUrl": req.body.redirection_url, "getToken": req.body.get_token}
    const state = encodeURIComponent(JSON.stringify(stateData));
    var url = process.env.LINKEDIN_REDIRECT_URI;
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(url)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    res.status(200).json(
        {"link": authURL}
    );
};

exports.linkedInCallback = async (req, res) => {
      const code = req.query.code;
      const state = req.query.state;
      const stateData = JSON.parse(decodeURIComponent(state));
      var redirectionUri = stateData.redirectionUrl;
      var getToken = stateData.getToken;
      if (!code) return res.status(400).send('No code returned from LinkedIn');
    
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
        User.getOrCreate(userData)
        .then((resp) => {
          var data = resp.data[0];
          var userId = data.id;
          UserToken.getOrCreate({"user_id": userId})
            .then((resp) => {
              var userToken = resp.data[0].id;
              if (getToken){
                redirectionUri = `${redirectionUri}&token=${userToken}`
              }
              res.redirect(`${redirectionUri}`);
          })

          .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

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
 
