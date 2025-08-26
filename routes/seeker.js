const express = require('express');
const seekerController = require('../controllers/seeker');

const router = express.Router()

router.post('/add-seeker-info', seekerController.sendSessionInfoWithParams);
router.post('/get-referer-data', seekerController.verifySeekerInfoForSession);

module.exports = router
