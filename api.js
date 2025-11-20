const express = require("express");
const authRoutes = require("./routes/auth");
const seekerRoutes = require("./routes/seeker");
const refererRoutes = require("./routes/referer");
const paymentRoutes = require("./routes/payment");
const dashboardRoutes = require("./routes/dashboard");
const superAdmin = require("./routes/superAdminroutes");

const router = express.Router();

router.use(express.json());

router.use("/auth", authRoutes);
router.use("/seeker", seekerRoutes);
router.use("/referer", refererRoutes);
router.use("/payment", paymentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/super-admin", superAdmin);

module.exports = router;
