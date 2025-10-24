const express = require("express");
const refererDashboard = require("../controllers/dashboard/referer");
const seekerDashboard = require("../controllers/dashboard/seeker");
const {authMiddleware, } = require("../middleware/authMiddleware");
const {refererMiddleware, } = require("../middleware/refererMiddleware");
const {seekerMiddleware, } = require("../middleware/seekerMiddleware");

const router = express.Router();
router.get("/referer/get-vacancies", authMiddleware, refererMiddleware, refererDashboard.getVacancies);
router.get("/referer/get-vacancy-detail/:id", authMiddleware, refererMiddleware, refererDashboard.getVacancyDetail);
router.get("/referer/potential-candidates", authMiddleware, refererMiddleware, refererDashboard.getPotentialCandidates);

router.get("/seeker/get-potential-opportunities", authMiddleware, seekerMiddleware, seekerDashboard.getRefererSeeked);
router.get("/seeker/get-seeked-opportunities", authMiddleware, seekerMiddleware, seekerDashboard.getRefererSeeked);

module.exports = router;
