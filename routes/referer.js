const express = require('express');
const refererController = require('../controllers/referer');

const router = express.Router()

router.post('/add-vacancy', refererController.sendVacancyData);
router.post('/add-referer-info', refererController.sendSessionInfoWithParams);
router.post('/find-seekers-count', refererController.checkSeekerCountViaCompany);
router.post('/find-seekers-data', refererController.sendSeekerData);

module.exports = router

