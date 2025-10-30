const express = require("express");
const apiRoutes = require("./api");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const AuthRoutes = require("./routes/auth");
const jwt = require("jsonwebtoken");
const stripeController = require("./controllers/stripe");
// const assistant = require('./services/createAssistant');

const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.referin.io"
    ],
    credentials: false,
  })
);

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeController.stripeWebhook
);


app.use(express.json());

app.use(express.urlencoded({ extended: true }));



// Route registration
app.use("/auth", AuthRoutes);
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
