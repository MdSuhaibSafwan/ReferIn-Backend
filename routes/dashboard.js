const express = require("express");
const refererDashboard = require("../controllers/dashboard/referer");
const seekerDashboard = require("../controllers/dashboard/seeker");

const router = express.Router();
router.get("/referer/get-vacancies", refererDashboard.getVacancies);
router.get("/referer/get-vacancy-detail/:id", refererDashboard.getVacancyDetail);
router.get("/referer/potential-candidates", refererDashboard.getPotentialCandidates);

router.get("/seeker/get-opportunities", seekerDashboard.getRefererSeeked);

module.exports = router;
