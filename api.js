const express = require('express');
const authRoutes = require('./routes/auth');
const seekerRoutes = require('./routes/seeker');
const refererRoutes = require('./routes/referer');

const router = express.Router();

router.use(express.json());
router.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next();
})

router.use("/auth", authRoutes);
router.use("/seeker", seekerRoutes);
router.use("/referer", refererRoutes);

module.exports = router
