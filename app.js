const express = require('express');
const apiRoutes = require('./api');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
dotenv.config();

const clerk = require("@clerk/express");


const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
})
app.use('/api', apiRoutes);

app.get("/", (req, res, next) => {
    clerk.clerkClient.users.getUserList()
    .then((resp) => {
        console.log(resp);
    })
    .catch(resp => console.log(resp));
    var message = "Welcome to Referin AI API"
    res.status(200).json(
        { message: message }
    );
});

app.listen(3000, () => {
    console.log("Happy Coding")
})
