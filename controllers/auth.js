const dotenv = require('dotenv')
const User = require('../models/user');
const axios = require('axios');
const jwtDecode = require('jwt-decode');

dotenv.config();

exports.linkedInAuth = (req, res, next) => {
    const scope = 'openid profile email';
    const state = Math.random().toString(36).substring(2, 15);
    var hasReferrers = true;
    if (hasReferrers) {
        var url = process.env.LINKEDIN_REDIRECT_URI;
    } else {
        var url = process.env.LINKEDIN_REDIRECT_URI;
    }
    const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(url)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    res.status(200).json(
        {"link": authURL}
    );
};

exports.linkedInCallback = async (req, res) => {
      const code = req.query.code;
      const state = req.query.state;
    
      console.log("state: " + state);
    
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
    
        console.log(user)
        
        res.redirect(`${process.env.FRONTEND_URL}`);

      } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send('Error during LinkedIn OAuth process');
      }
}

