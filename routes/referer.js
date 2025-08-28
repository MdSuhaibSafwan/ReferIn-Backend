const express = require('express');
const refererController = require('../controllers/referer');
const authMiddleware = require('../services/authMiddleware');
const multer = require("multer");

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder where files will be saved
  },
  filename: function (req, file, cb) {
    // Keep original name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


router.post('/add-vacancy', authMiddleware, upload.single("file"), refererController.sendVacancyData);
router.post('/add-referer-info', refererController.sendSessionInfoWithParams);
router.post('/find-seekers-count', refererController.checkSeekerCountViaCompany);
router.post('/find-seekers-data', refererController.sendSeekerData);

module.exports = router

