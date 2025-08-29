const express = require('express');
const seekerController = require('../controllers/seeker');

const router = express.Router()

router.post('/check-matches-of-referer', seekerController.checkMatchesOfReferer);
router.post('/get-referer-data', seekerController.verifySeekerInfoForSession);
router.get("/marketplace", seekerController.seekerMarketplace);

module.exports = router
