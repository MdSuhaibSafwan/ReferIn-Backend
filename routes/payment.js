const stripeController = require("../controllers/stripe");
const { auth } = require("../db/supabase");
const authMiddleware = require("../services/authMiddleware");

const express = require("express");
const router = express.Router();

router.post("/create-checkout-session", authMiddleware, stripeController.createCheckoutSession);

module.exports = router;
