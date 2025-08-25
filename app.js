const express = require('express');
const apiRoutes = require('./api');
const dotenv = require('dotenv')
dotenv.config();
const axios = require('axios');
const jwtDecode = require('jwt-decode');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');  

const app = express();

app.post('/auth/linkedin', (req, res, next) => {
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
});

app.get('/auth/linkedin/callback', async (req, res) => {
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
});

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  let event = request.body;
  var endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  if (event.type == "checkout.session.completed"){
    var session = event.data.object;
    var metaData = session.metadata;
    var frontendUid = metaData.frontendUid;
    console.log(frontendUid);

    response.status(200).send({"message": "success"});

  } else {
    response.status(200).send({"message": "other event type handled"});
  };


});

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
})

app.use('/api', apiRoutes);

app.get("/", (req, res, next) => {
    var message = "Welcome to Referin AI API";
    res.status(200).json(
        { message: message }
    );
});

app.listen(3000, () => {
    console.log("Happy Coding")
})
