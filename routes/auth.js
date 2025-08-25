const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get("/get-users", authController.getAllUsers);

module.exports = router;

