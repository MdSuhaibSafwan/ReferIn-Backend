const express = require("express");
const refererDashboard = require("../controllers/dashboard/referer");

const router = express.Router();
router.get("/referer/get-vacancies", refererDashboard.getVacancies);
router.get("/referer/get-vacancy-detail/:id", refererDashboard.getVacancyDetail);
router.get("/referer/potential-candidates", refererDashboard.getPotentialCandidates);

module.exports = router;
