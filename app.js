const express = require("express");
const apiRoutes = require("./api");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.post(
  "/auth/linkedin",
  express.json(),
  express.urlencoded({ extended: true }),
  authController.linkedInAuth
);
app.get("/auth/linkedin/callback", authController.linkedInCallback);

app.use("/api", apiRoutes);

app.get("/", (req, res, next) => {
  var message = "Welcome to Referin AI API";
  res.status(200).json({ message: message });
});

app.listen(3000, () => {
  console.log("Happy Coding");
  // assistant()
});
