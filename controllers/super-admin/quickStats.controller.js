/**
 * Controller for super admin dashboard analytics.
 * Handles requests for quick statistics and other dashboard data.
 */

const supabase = require("../../db/supabase");

/**
 * Calculates statistics for a given table, including total count and trend.
 * @param {string} tableName - The name of the table to query.
 * @returns {Promise<{total: number, trendValue: number, trendText: string}>}
 */
const getStatsForTable = async (tableName) => {
  //analysis comes from todays data not every month first date
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30DaysStart = new Date(
    now.getTime() - 60 * 24 * 60 * 60 * 1000
  );

  // Get total count
  const { count: total, error: totalError } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error(`Error getting total count for ${tableName}:`, totalError);
    throw totalError;
  }

  // Get count for the last 30 days (current period)
  const { count: currentPeriodCount, error: currentError } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true })
    .gte("created_at", last30Days.toISOString());

  if (currentError) {
    console.error(
      `Error getting current period count for ${tableName}:`,
      currentError
    );
    throw currentError;
  }

  // Get count for the 30 days before that (previous period)
  const { count: previousPeriodCount, error: previousError } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true })
    .gte("created_at", previous30DaysStart.toISOString())
    .lt("created_at", last30Days.toISOString());

  if (previousError) {
    console.error(
      `Error getting previous period count for ${tableName}:`,
      previousError
    );
    throw previousError;
  }

  // Calculate trend percentage
  let trendValue = 0;
  if (previousPeriodCount > 0) {
    trendValue =
      ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
  } else if (currentPeriodCount > 0) {
    trendValue = 100; // Infinite growth, represented as 100%
  }

  return {
    total: total || 0,
    trendValue: Math.round(trendValue),
    trendText: "from last month",
  };
};

/**
 * Get quick overview statistics for the dashboard.
 * Fetches total counts and trends for referrers, seekers, and job vacancies.
 */
const getQuickStats = async (req, res) => {
  console.log("apis hitted of quickstats");
  try {
    const [totalReferrers, totalSeekers, jobVacancies] = await Promise.all([
      getStatsForTable("referrer"),
      getStatsForTable("seeker"),
      getStatsForTable("vacancy"),
    ]);

    res.json({
      totalReferrers,
      totalSeekers,
      jobVacancies,
    });
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getQuickStats,
};
