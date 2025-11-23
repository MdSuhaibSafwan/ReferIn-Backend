/**
 * Controller for super admin seekers data
 * Handles getAllSeekers, getSeekerById requests from frontend
 */
const {
  Seeker,
  SeekerSkill,
  SeekerEducation,
  SeekerWorkExperience,
} = require("../../models/seeker");

const supabase = require("../../db/supabase");

/**
 * Get all seekers with pagination and search
 */
const getAllSeekers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // First, get seekers with user data
    let seekerQuery = supabase.from("seeker").select("*", { count: "exact" });

    if (search) {
      seekerQuery = seekerQuery.or(
        `current_company.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    const {
      data: seekers,
      error,
      count,
    } = await seekerQuery
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching seekers:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (seekers && seekers.length > 0) {
      console.log("Seekers fields:", Object.keys(seekers[0]));
    } else {
      //No seekers found in database;
      return res.json({
        success: true,
        data: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Get user IDs from seekers
    const userIds = seekers.map((seeker) => seeker.user_id).filter(Boolean);

    // Fetch users separately
    let users = [];
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in("uuid", userIds);

      if (usersError) {
        console.error("Error fetching users:", usersError);
      } else {
        users = usersData || [];
      }
    }

    // Get all seeker IDs for related data
    const seekerIds = seekers.map((seeker) => seeker.uuid);

    // Fetch related data in bulk
    const [skillsData, educationData, experienceData] = await Promise.all([
      SeekerSkill.findByArray(seekerIds),
      SeekerEducation.findByArray(seekerIds),
      SeekerWorkExperience.findByArray(seekerIds),
    ]);

    // if (skillsData.data && skillsData.data.length > 0) {
    //   console.log(
    //     "First skill sample:",
    //     JSON.stringify(skillsData.data[0], null, 2)
    //   );
    //   console.log("Skills fields:", Object.keys(skillsData.data[0]));
    // }

    // if (educationData.data && educationData.data.length > 0) {
    //   console.log(
    //     "First education sample:",
    //     JSON.stringify(educationData.data[0], null, 2)
    //   );
    //   console.log("Education fields:", Object.keys(educationData.data[0]));
    // }

    // if (experienceData.data && experienceData.data.length > 0) {
    //   console.log("Experience fields:", Object.keys(experienceData.data[0]));
    // }

    // Group related data by seeker_id
    const skillsBySeeker = {};
    const educationBySeeker = {};
    const experienceBySeeker = {};

    skillsData.data?.forEach((skill) => {
      if (!skillsBySeeker[skill.seeker_id])
        skillsBySeeker[skill.seeker_id] = [];
      skillsBySeeker[skill.seeker_id].push(skill);
    });

    educationData.data?.forEach((edu) => {
      if (!educationBySeeker[edu.seeker_id])
        educationBySeeker[edu.seeker_id] = [];
      educationBySeeker[edu.seeker_id].push(edu);
    });

    experienceData.data?.forEach((exp) => {
      if (!experienceBySeeker[exp.seeker_id])
        experienceBySeeker[exp.seeker_id] = [];
      experienceBySeeker[exp.seeker_id].push(exp);
    });

    // Transform data to match frontend Seeker type
    const transformedSeekers = seekers.map((seeker) => {
      const user = users.find((u) => u.uuid === seeker.user_id) || {};

      // Calculate total experience years
      const experiences = experienceBySeeker[seeker.uuid] || [];
      let totalExperience = 0;
      experiences.forEach((exp) => {
        const start = new Date(exp.start_date);
        const end = exp.current ? new Date() : new Date(exp.end_date);
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
        totalExperience += Math.max(0, years);
      });

      // Generate name from user data
      const userName =
        user.full_name ||
        `${user.given_name || ""} ${user.family_name || ""}`.trim() ||
        "Unknown Seeker";

      // Generate role from current company or user role
      const roleText = seeker.current_company
        ? `Seeker at ${seeker.current_company}`
        : user.role || "Job Seeker";

      const transformedSeeker = {
        id: seeker.uuid,
        user_id: seeker.user_id,
        name: userName,
        email: user.email,
        image: user.picture,
        role: roleText,
        location: seeker.location,
        current_company: seeker.current_company,
        description: `Active job seeker${
          seeker.current_company ? ` from ${seeker.current_company}` : ""
        }`,
        workPreferences: ["Full-time", "Remote"],
        city: seeker.location?.split(",")[0],
        created_at: seeker.created_at,
        createdAt: seeker.created_at,
        skills: skillsBySeeker[seeker.uuid] || [],
        education: educationBySeeker[seeker.uuid] || [],
        work_experience: experiences,
        skills_count: skillsBySeeker[seeker.uuid]?.length || 0,
        experience_years: Math.round(totalExperience * 10) / 10,
      };

      return transformedSeeker;
    });

    res.json({
      success: true,
      data: transformedSeekers,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching seekers:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get single seeker by ID with all related data
 */
const getSeekerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get seeker
    const { data: seeker, error } = await supabase
      .from("seeker")
      .select("*")
      .eq("uuid", id)
      .single();

    if (error) {
      console.error("Error fetching seeker:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (!seeker) {
      console.log("Seeker not found with ID:", id);
      return res.status(404).json({
        success: false,
        error: "Seeker not found",
      });
    }

    // Get user data
    let user = {};
    if (seeker.user_id) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", seeker.user_id)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
      } else {
        user = userData || {};
      }
    }

    // Fetch all related data
    const [skillsData, educationData, experienceData] = await Promise.all([
      SeekerSkill.findBySeekerId(id),
      SeekerEducation.findBySeekerId(id),
      SeekerWorkExperience.findBySeekerId(id),
    ]);

    // Calculate total experience years
    const experiences = experienceData.data || [];
    let totalExperience = 0;
    experiences.forEach((exp) => {
      const start = new Date(exp.start_date);
      const end = exp.current ? new Date() : new Date(exp.end_date);
      const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
      totalExperience += Math.max(0, years);
    });

    // Generate name from user data
    const userName =
      user.full_name ||
      `${user.given_name || ""} ${user.family_name || ""}`.trim() ||
      "Unknown Seeker";

    // Generate role from current company or user role
    const roleText = seeker.current_company
      ? `Seeker at ${seeker.current_company}`
      : user.role || "Job Seeker";

    // Transform to frontend format
    const transformedSeeker = {
      id: seeker.uuid,
      user_id: seeker.user_id,
      name: userName,
      email: user.email,
      image: user.picture,
      role: roleText,
      location: seeker.location,
      current_company: seeker.current_company,
      description: `Active job seeker${
        seeker.current_company ? ` from ${seeker.current_company}` : ""
      }`,
      workPreferences: ["Full-time", "Remote"],
      city: seeker.location?.split(",")[0],
      created_at: seeker.created_at,
      createdAt: seeker.created_at,
      skills: skillsData.data || [],
      education: educationData.data || [],
      work_experience: experiences,
      skills_count: skillsData.data?.length || 0,
      experience_years: Math.round(totalExperience * 10) / 10,
      user: user,
    };

    res.json({
      success: true,
      data: transformedSeeker,
    });
  } catch (error) {
    console.error("Error fetching seeker:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getAllSeekers,
  getSeekerById,
};
