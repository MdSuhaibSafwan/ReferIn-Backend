const express = require('express');
const apiRoutes = require('./api');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
})
app.use('/api', apiRoutes);

app.listen(3000, () => {
    console.log("Happy Coding")
})
