const express = require("express");

const {
  login,
  logout,
} = require("../controllers/super-admin/adminauth.controller");

const {
  getAllJobs,
  getJobById,
  deleteJob,
  createJob,
} = require("../controllers/super-admin/jobs.controller");

const {
  getAllReferrers,
  getReferrerById,
} = require("../controllers/super-admin/referrers.controller");

const {
  getAllSeekers,
  getSeekerById,
} = require("../controllers/super-admin/seekers.controller");

const {
  getQuickStats,
} = require("../controllers/super-admin/quickStats.controller");

const router = express.Router();

/**
 * * Super Admin Authentication Routes
 * These routes are for handling super admin login,and logout.
 */

router.post("/auth/login", login);

// Logs out a super admin.
router.post("/auth/logout", logout);

/**
 * *Job Management Routes
 * These routes are for managing job listings from the super admin dashboard.
 */

//get all the jobs
router.get("/jobs", getAllJobs);

//create a single jobs with
router.post("/jobs/create", createJob);

//Get a single job vacancy by its ID.
router.get("/jobs/:id", getJobById);

// Delete a job vacancy by its ID.
router.delete("/jobs/:id", deleteJob);

/**
 * *Referrer Management Routes
 *  These routes are for managing referrer data.
 */

// Get a list of all referrers.
router.get("/referrers", getAllReferrers);

//Get a single referrer by their ID.
router.get("/referrers/:id", getReferrerById);

/**
 * *Seeker Management Routes
 * These routes are for managing seeker data.
 */

//get all the Seekers data
router.get("/seekers", getAllSeekers);

//Get a single seeker by their ID.
router.get("/seekers/:id", getSeekerById);

/**
 * *Dashboard overview
 * These routes are for overview analytics
 */

//get all the quick analytics data
router.get("/quick-stats", getQuickStats);

/**
 * *Analytics Routes
 * These routes provide data for the analytics dashboard.
 */

//Get data for the seeker entry funnel chart.
// router.get("/analytics/seeker-funnel");

//Get data for the reveal conversion chart.
// router.get("/analytics/reveal-conversion");

//Get data for the referrer engagement chart.
// router.get("/analytics/referrer-engagement");

// Get data for the ApplyPool liquidity and profile completion.
// router.get("/analytics/applypool");

module.exports = router;
