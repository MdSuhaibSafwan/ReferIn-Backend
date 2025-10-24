const express = require("express");
const apiRoutes = require("./api");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const jwt = require("jsonwebtoken");

const authController = require("./controllers/auth");
const stripeController = require("./controllers/stripe");
// const assistant = require('./services/createAssistant');

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000","https://www.referin.io"]
  })
);

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeController.stripeWebhook
);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.post(
  "/auth/linkedin",
  upload.single("cv"),
  authController.linkedInAuth
);
app.get("/auth/linkedin/callback", authController.linkedInCallback);

app.use("/api", apiRoutes);

app.get("/", (req, res, next) => {
  var message = "Welcome to Referin AI API";
  if (req.query.code) {
    console.log(jwt.decode(req.query.code, process.env.JWT_SECRET))
  };
  res.status(200).json({ message: message });
});

app.listen(3000, () => {
  console.log("Happy Coding");
  // assistant()
});
