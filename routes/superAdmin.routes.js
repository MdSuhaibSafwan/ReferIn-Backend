const express = require("express");
const router = express.Router();

/**
 * * Super Admin Authentication Routes
 * These routes are for handling super admin login, registration, and session management.
 */

router.post("/auth/login");

//Registers a new super admin.
router.post("/auth/register");

//Refreshes the super admin's authentication token.
router.post("/auth/refresh");

// Logs out a super admin.
router.post("/auth/logout");

/**
 * *Job Management Routes
 * These routes are for managing job listings from the super admin dashboard.
 */

//get all the jobs
router.get("/jobs");

//Get a single job vacancy by its ID.
router.get("/jobs/:id");

// Delete a job vacancy by its ID.
router.delete("/jobs/:id");

/**
 * *Referrer Management Routes
 *  These routes are for managing referrer data.
 */

// Get a list of all referrers.
router.get("/referrers");

//Get a single referrer by their ID.
router.get("/referrers/:id");

/**
 * *Seeker Management Routes
 * These routes are for managing seeker data.
 */

//get all the Seekers data
router.get("/seekers");

//Get a single seeker by their ID.
router.get("/seekers/:id");

/**
 * *Analytics Routes
 * These routes provide data for the analytics dashboard.
 */

//Get data for the seeker entry funnel chart.
router.get("/analytics/seeker-funnel");

//Get data for the reveal conversion chart.
router.get("/analytics/reveal-conversion");

//Get data for the referrer engagement chart.
router.get("/analytics/referrer-engagement");

// Get data for the ApplyPool liquidity and profile completion.
router.get("/analytics/applypool");

module.exports = router;


//!register admin 
/**
 * ?example 
 * Admin registation data =  {
 * fullName
 * email
 * password 
 * adminKey //  with out admin key no one can register and access the admin access
 *     } 
 * 
 * ?response payload => {
 * const data = {
        user: {
          id: "admin-2",
          fullName: payload.fullName,
          email: payload.email,
          username: payload.email,
        },
        tokens: {
          accessToken: "mock-access-token-signup",
          refreshToken: "mock-refresh-token-signup",
        },
      };
 * }
 */


//!login admin 
/**
 * ?example 
 * Admin login  data =  {
 * usernamem //  same as full name
 * password 
 *   } 
 * 
 * ?response payload  same as register 
 */