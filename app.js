const express = require('express');
const apiRoutes = require('./api');
const dotenv = require('dotenv')
const authController = require('./controllers/auth');
const stripeController = require('./controllers/stripe');

dotenv.config();

const app = express();
app.post('/auth/linkedin', authController.linkedInAuth);
app.get('/auth/linkedin/callback', authController.linkedInCallback);
app.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook);

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
