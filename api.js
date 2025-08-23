const express = require('express');
const authRoutes = require('./routes/auth');
const seekerRoutes = require('./routes/seeker');
const refererRoutes = require('./routes/referer');

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/seeker", seekerRoutes);
router.use("/referer", refererRoutes);

module.exports = router
