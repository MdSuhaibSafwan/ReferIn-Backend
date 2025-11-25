const express = require('express');
const refererController = require('../controllers/referer');
const {authMiddleware, } = require('../middleware/authMiddleware');
const multer = require("multer");

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder where files will be saved
  },
  filename: function (req, file, cb) {
    // Keep original name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


router.post('/add-vacancy', authMiddleware, upload.single("file"), refererController.sendVacancyData);
router.post('/add-referer-info', refererController.sendSessionInfoWithParams);
router.post('/find-seekers-count', refererController.checkSeekerCountViaCompany);
router.post('/find-seekers-data', refererController.sendSeekerData);
router.get('/find-potential-seekers', refererController.getPotentialSeekers);

/**
 * const mockVacancies = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA (Remote Available)",
    salaryRange: "TBC",
    experience: "5+ years in Frontend Development",
    type: "Full-time, Remote, Permanent",
    responsibilities: [
      "Develop responsive web applications using React and TypeScript",
      "Collaborate with design teams to implement pixel-perfect UI/UX",
      "Optimize applications for maximum speed and scalability",
      "Mentor junior developers and conduct code reviews",
    ],
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "5+ years of experience with React, JavaScript, and TypeScript",
      "Strong understanding of modern CSS frameworks",
      "Experience with version control systems (Git)",
    ],
    skills: ["React", "TypeScript", "Remote", "Full-time", "Senior Level"],
  },
  {
    id: 2,
    title: "Product Designer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA (Remote Available)",
    salaryRange: "TBC",
    experience: "5+ years in Product Designing",
    type: "Full-time, Remote, Permanent",
    responsibilities: [
      "Design responsive web applications using React and TypeScript",
      "Collaborate with development teams to implement product",
      "Optimize design for maximum conversion and stability",
      "Mentor junior designers and conduct design reviews",
    ],
    requirements: [
      "Bachelor's degree in Graphics design or related field",
      "5+ years of experience with Figma",
      "Strong understanding of modern designs",
      "Working experience with Development team",
    ],
    skills: ["Figma", "Designer", "Remote", "Full-time", "Senior Level"],
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "DataFlow Inc",
    location: "New York, NY (Hybrid)",
    salaryRange: "$120,000 - $150,000",
    experience: "4+ years in Backend Development",
    type: "Full-time, Hybrid, Permanent",
    responsibilities: [
      "Design and develop scalable backend services",
      "Implement RESTful APIs and microservices",
      "Work with databases and cloud infrastructure",
      "Ensure code quality and system reliability",
    ],
    requirements: [
      "Bachelor's degree in Computer Science",
      "4+ years experience with Node.js or Python",
      "Experience with databases (PostgreSQL, MongoDB)",
      "Knowledge of cloud platforms (AWS, GCP)",
    ],
    skills: ["Node.js", "Python", "AWS", "PostgreSQL", "Microservices"],
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "DataFlow Inc",
    location: "New York, NY (Hybrid)",
    salaryRange: "$120,000 - $150,000",
    experience: "4+ years in Backend Development",
    type: "Full-time, Hybrid, Permanent",
    responsibilities: [
      "Design and develop scalable backend services",
      "Implement RESTful APIs and microservices",
      "Work with databases and cloud infrastructure",
      "Ensure code quality and system reliability",
    ],
    requirements: [
      "Bachelor's degree in Computer Science",
      "4+ years experience with Node.js or Python",
      "Experience with databases (PostgreSQL, MongoDB)",
      "Knowledge of cloud platforms (AWS, GCP)",
    ],
    skills: ["Node.js", "Python", "AWS", "PostgreSQL", "Microservices"],
  },
  {
    id: 5,
    title: "Backend Engineer",
    company: "DataFlow Inc",
    location: "New York, NY (Hybrid)",
    salaryRange: "$120,000 - $150,000",
    experience: "4+ years in Backend Development",
    type: "Full-time, Hybrid, Permanent",
    responsibilities: [
      "Design and develop scalable backend services",
      "Implement RESTful APIs and microservices",
      "Work with databases and cloud infrastructure",
      "Ensure code quality and system reliability",
    ],
    requirements: [
      "Bachelor's degree in Computer Science",
      "4+ years experience with Node.js or Python",
      "Experience with databases (PostgreSQL, MongoDB)",
      "Knowledge of cloud platforms (AWS, GCP)",
    ],
    skills: ["Node.js", "Python", "AWS", "PostgreSQL", "Microservices"],
  },
];
 */


module.exports = router

