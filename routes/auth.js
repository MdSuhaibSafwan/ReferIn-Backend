const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router()

router.post('/sign-up', authController.signup);
router.get("/users", authController.getAllUsers);

module.exports = router

