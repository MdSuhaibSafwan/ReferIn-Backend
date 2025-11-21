/**
 * Controller for super admin Referrers data
 * Handles getAllReferrers, getReferrerById requests from frontend
 */

const Referrer = require("../../models/referer");

/**
 * Get all referrers with pagination and search
 */
const getAllReferrers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    const { data: referrers, count } = await Referrer.fetchAllPaginated(
      parseInt(limit),
      offset,
      search
    );

    // Transform data to match frontend Referrer type
    const transformedReferrers = await Promise.all(
      (referrers || []).map(async (referrer) => {
        const stats = await Referrer.getReferrerStats(referrer.uuid);

        // Generate name from user data or use a default
        const userName =
          referrer.user?.full_name ||
          `${referrer.user?.given_name || ""} ${
            referrer.user?.family_name || ""
          }`.trim() ||
          "Unknown Referrer";

        // Generate role description
        const roleText = referrer.user?.role
          ? `${referrer.user.role}${
              referrer.current_company ? ` at ${referrer.current_company}` : ""
            }`
          : referrer.current_company || "Referrer";

        return {
          id: referrer.uuid,
          user_id: referrer.user_id,
          name: userName,
          email: referrer.user?.email,
          image: referrer.user?.picture,
          role: roleText,
          location: referrer.location,
          current_company: referrer.current_company,
          description: roleText, // Use role text as description
          isTopContributor: stats.jobs_count > 5, // Example logic
          workPreferences: ["Remote", "Hybrid"], // Default for now
          city: referrer.location?.split(",")[0], // Extract city from location
          followers:
            process.env.NODE_ENV === "DEVELOPMENT"
              ? Math.floor(Math.random() * 1000)
              : referrer.followers ?? 0,
          created_at: referrer.created_at,
          createdAt: referrer.created_at,
          ...stats,
        };
      })
    );

    res.json({
      success: true,
      data: transformedReferrers,
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching referrers:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get single referrer by ID
 */
const getReferrerById = async (req, res) => {
  try {
    const { id } = req.params;

    const referrer = await Referrer.findByIdWithUser(id);

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: "Referrer not found",
      });
    }

    const stats = await Referrer.getReferrerStats(id);

    // Generate name from user data
    const userName =
      referrer.user?.full_name ||
      `${referrer.user?.given_name || ""} ${
        referrer.user?.family_name || ""
      }`.trim() ||
      "Unknown Referrer";

    // Generate role description
    const roleText = referrer.user?.role
      ? `${referrer.user.role}${
          referrer.current_company ? ` at ${referrer.current_company}` : ""
        }`
      : referrer.current_company || "Referrer";

    // Transform to frontend format
    const transformedReferrer = {
      id: referrer.uuid,
      user_id: referrer.user_id,
      name: userName,
      email: referrer.user?.email,
      image: referrer.user?.picture,
      role: roleText,
      location: referrer.location,
      current_company: referrer.current_company,
      description: roleText,
      isTopContributor: stats.jobs_count > 5,
      workPreferences: ["Remote", "Hybrid"],
      city: referrer.location?.split(",")[0],
      followers: Math.floor(Math.random() * 1000),
      created_at: referrer.created_at,
      createdAt: referrer.created_at,
      ...stats,
      user: referrer.user,
    };

    res.json({
      success: true,
      data: transformedReferrer,
    });
  } catch (error) {
    console.error("Error fetching referrer:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getAllReferrers,
  getReferrerById,
};
