const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const {linkedinSignInOrSignUpMiddleware, } = require("../middleware/authMiddleware");
const {upload, } = require("../middleware/multerMiddleware")


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

