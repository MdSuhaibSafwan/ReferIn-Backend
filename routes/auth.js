const express = require('express');
const authController = require('../controllers/auth');
const multer = require("multer");
const router = express.Router();
const {linkedinSignInOrSignUpMiddleware, } = require("../middleware/authMiddleware");

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

router.post(
    "/linkedin",   
    upload.single("cv"),
    linkedinSignInOrSignUpMiddleware,
    authController.linkedInAuth
);

router.get(
    "/linkedin/callback", 
    authController.linkedInCallback
);

module.exports = router;

