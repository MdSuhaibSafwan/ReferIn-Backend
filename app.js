const express = require('express');
const apiRoutes = require('./api');
const dotenv = require('dotenv');
dotenv.config();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const authController = require('./controllers/auth');
const stripeController = require('./controllers/stripe');
// const assistant = require('./services/createAssistant');


const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"), // temp path (ignored)
  filename: (req, file, cb) => cb(null, file.originalname),
});

// Override file handling: delete buffer after controller handles it
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Only PDF files are allowed!"), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 10MB max
});


app.post('/auth/linkedin', upload.single("cv"), authController.linkedInAuth);
app.get('/auth/linkedin/callback', authController.linkedInCallback);

app.use('/api', apiRoutes);

app.get("/", (req, res, next) => {
    var message = "Welcome to Referin AI API";
    res.status(200).json(
        { message: message }
    );
});

app.listen(3000, () => {
    console.log("Happy Coding");
    // assistant()
});
