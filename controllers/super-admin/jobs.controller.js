/**
 * Controller for super admin Vacancy
 * Handles getAllJobs, getJobById, deleteJobs, createJobs requests from frontend
 */

const {
  Vacancy,
  VacancyRequirement,
  VacancyResponsibility,
  VacancySkill,
} = require("../../models/vacancy");

/**
 * Get all jobs with related data
 */
const getAllJobs = async (req, res) => {
  try {
    const { data: jobs, error } = await Vacancy.fetchAll();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Get jobs with their related data based on actual schema
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const [requirements, responsibilities, skills] = await Promise.all([
          VacancyRequirement.findByVacancyId(job.id),
          VacancyResponsibility.findByVacancyId(job.id),
          VacancySkill.findByVacancyId(job.id),
        ]);

        // Map to frontend JobVacancy type
        return {
          id: job.id,
          title: job.title,
          role: job.role,
          company: job.company,
          location: job.location,
          min_salary: job.min_salary,
          max_salary: job.max_salary,
          is_remote: job.is_remote,
          referrer_id: job.referrer_id,
          // Frontend compatibility fields
          description: job.role,
          salary:
            job.min_salary && job.max_salary
              ? `${job.min_salary} - ${job.max_salary}`
              : undefined,
          postedById: job.referrer_id,
          // Related data
          requirements: requirements.data || [],
          responsibilities: responsibilities.data || [],
          skills: skills.data || [],
          // Timestamps
          createdAt: job.created_at,
          updatedAt: job.updated_at,
        };
      })
    );

    res.json({
      success: true,
      data: jobsWithDetails,
      count: jobsWithDetails.length,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get a single job by ID with all related data
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await Vacancy.findById(id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!job || job.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    const jobData = job[0];

    // Fetch all related data based on actual schema
    const [requirements, responsibilities, skills] = await Promise.all([
      VacancyRequirement.findByVacancyId(id),
      VacancyResponsibility.findByVacancyId(id),
      VacancySkill.findByVacancyId(id),
    ]);

    // Map to frontend JobVacancy type
    const jobWithDetails = {
      id: jobData.id,
      title: jobData.title,
      role: jobData.role,
      company: jobData.company,
      location: jobData.location,
      min_salary: jobData.min_salary,
      max_salary: jobData.max_salary,
      is_remote: jobData.is_remote,
      referrer_id: jobData.referrer_id,
      // Frontend compatibility fields
      description: jobData.role,
      salary:
        jobData.min_salary && jobData.max_salary
          ? `${jobData.min_salary} - ${jobData.max_salary}`
          : undefined,
      postedById: jobData.referrer_id,
      experience: undefined,
      type: undefined,
      tags: skills.data ? skills.data.map((skill) => skill.skill) : [],
      // Related data
      requirements: requirements.data || [],
      responsibilities: responsibilities.data || [],
      skills: skills.data || [],
      // Timestamps
      createdAt: jobData.created_at,
      updatedAt: jobData.updated_at,
    };

    res.json({
      success: true,
      data: jobWithDetails,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Delete a job by ID (and all related data)
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if job exists
    const { data: job, error: jobError } = await Vacancy.findById(id);

    if (jobError) {
      return res.status(400).json({
        success: false,
        error: jobError.message,
      });
    }

    if (!job || job.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    // Delete all related data first to maintain referential integrity
    const deletePromises = [
      VacancyRequirement.deleteByVacancyId(id),
      VacancyResponsibility.deleteByVacancyId(id),
      VacancySkill.deleteByVacancyId(id),
    ];

    // Wait for all related data deletions to complete
    const deleteResults = await Promise.allSettled(deletePromises);

    // Check if any of the deletions failed
    const failedDeletions = deleteResults.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && result.value.error)
    );

    if (failedDeletions.length > 0) {
      console.error("Some related data deletions failed:", failedDeletions);
      // Continue with main deletion anyway, but log the issue
    }

    // Delete the main job using model method
    const { error: deleteError } = await Vacancy.deleteById(id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        error: deleteError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      deletedJob: job[0],
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Create a new job with related data
 */
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salary,
      min_salary,
      max_salary,
      is_remote = false,
      referrer_id,
      // Alias for referrer_id
      postedById,
      requirements = [],
      responsibilities = [],
      skills = [],
    } = req.body;

    // Use postedById if referrer_id not provided
    const finalReferrerId = referrer_id || postedById;

    // Parse salary range if provided as single string
    let finalMinSalary = min_salary;
    let finalMaxSalary = max_salary;

    if (salary && !min_salary && !max_salary) {
      const salaryParts = salary.split("-").map((part) => part.trim());
      finalMinSalary = salaryParts[0] || "";
      finalMaxSalary = salaryParts[1] || "";
    }

    // Insert main job data - mapping to actual database schema
    const { data: job, error } = await Vacancy.insert({
      title,
      role: description,
      company,
      location,
      min_salary: finalMinSalary,
      max_salary: finalMaxSalary,
      is_remote,
      referrer_id: finalReferrerId,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const jobId = job[0].id;

    // Insert related data if provided
    const insertPromises = [];

    if (requirements.length > 0) {
      const requirementData = requirements.map((req) => ({
        vacancy_id: jobId,
        title: typeof req === "string" ? req : req.title,
      }));
      insertPromises.push(VacancyRequirement.insert(requirementData));
    }

    if (responsibilities.length > 0) {
      const responsibilityData = responsibilities.map((resp) => ({
        vacancy_id: jobId,
        title: typeof resp === "string" ? resp : resp.title,
      }));
      insertPromises.push(VacancyResponsibility.insert(responsibilityData));
    }

    if (skills.length > 0) {
      const skillData = skills.map((skill) => ({
        vacancy_id: jobId,
        skill: typeof skill === "string" ? skill : skill.skill,
      }));
      insertPromises.push(VacancySkill.insert(skillData));
    }

    // Wait for all related data to be inserted
    if (insertPromises.length > 0) {
      await Promise.all(insertPromises);
    }

    // Fetch the complete job with all related data
    const [requirementsData, responsibilitiesData, skillsData] =
      await Promise.all([
        VacancyRequirement.findByVacancyId(jobId),
        VacancyResponsibility.findByVacancyId(jobId),
        VacancySkill.findByVacancyId(jobId),
      ]);

    // Map to frontend JobVacancy type
    const completeJob = {
      ...job[0],
      description: job[0].role, // Map role back to description for frontend
      salary:
        job[0].min_salary && job[0].max_salary
          ? `${job[0].min_salary} - ${job[0].max_salary}`
          : undefined,
      postedById: job[0].referrer_id,
      requirements: requirementsData.data || [],
      responsibilities: responsibilitiesData.data || [],
      skills: skillsData.data || [],
      tags: skillsData.data ? skillsData.data.map((skill) => skill.skill) : [],
    };

    res.status(201).json({
      success: true,
      data: completeJob,
      message: "Job created successfully",
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  deleteJob,
  createJob,
};
