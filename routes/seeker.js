const express = require('express');
const seekerController = require('../controllers/seeker');

const router = express.Router()

router.post('/add-seeker-info', seekerController.sendSessionInfoWithParams);
router.post('/verify-to-get-seeker', seekerController.verifySeekerInfoForSession);

module.exports = router
