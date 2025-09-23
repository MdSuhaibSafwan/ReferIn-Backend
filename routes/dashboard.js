const express = require("express");
const refererDashboard = require("../controllers/dashboard/referer");

const router = express.Router();
router.get("/get-vacancies", refererDashboard.getVacancies);
router.get("/get-vacancy-detail/:id", refererDashboard.getVacancyDetail);

module.exports = router;
