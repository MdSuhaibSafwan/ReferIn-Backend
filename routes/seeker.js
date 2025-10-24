const express = require('express');
const seekerController = require('../controllers/seeker');
const {seekerMiddleware, } = require("../middleware/seekerMiddleware");
const {upload, } = require("../middleware/multerMiddleware");
const {authMiddleware, } = require("../middleware/authMiddleware");
const {createStripeCheckoutSession, } = require("../controllers/stripe");

const router = express.Router()

router.post('/check-matches-of-referer', seekerController.checkMatchesOfReferer);
router.post('/get-referer-data', seekerController.verifySeekerInfoForSession);
router.get("/marketplace", seekerController.seekerMarketplace);
router.post("/upload-cv", authMiddleware, seekerMiddleware, upload.single("cv"), seekerController.uploadCv);
router.post("/create-checkout-session", authMiddleware, seekerMiddleware, createStripeCheckoutSession);

module.exports = router
