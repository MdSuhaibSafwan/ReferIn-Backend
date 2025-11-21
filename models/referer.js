const supabase = require("../db/supabase");

class Referrer {
  static async fetchAllPaginated(limit = 10, offset = 0, search = "") {
    try {
      //  get referrers
      let referrerQuery = supabase
        .from("referrer")
        .select("*", { count: "exact" });

      if (search) {
        referrerQuery = referrerQuery.or(
          `current_company.ilike.%${search}%,location.ilike.%${search}%`
        );
      }

      const {
        data: referrers,
        error,
        count,
      } = await referrerQuery
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!referrers || referrers.length === 0) {
        return { data: [], count: 0 };
      }

      // Get user IDs from referrers
      const userIds = referrers.map((ref) => ref.user_id).filter(Boolean);

      // Fetch users separately if we have user IDs
      let users = [];
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .in("uuid", userIds);

        if (!usersError) {
          users = usersData || [];
        }
      }

      // Combine referrers with their user data
      const referrersWithUsers = referrers.map((referrer) => {
        const user = users.find((u) => u.uuid === referrer.user_id) || {};
        return {
          ...referrer,
          user,
        };
      });

      return { data: referrersWithUsers, count };
    } catch (error) {
      throw error;
    }
  }

  static async findByIdWithUser(id) {
    try {
      // Get referrer
      const { data: referrer, error } = await supabase
        .from("referrer")
        .select("*")
        .eq("uuid", id)
        .single();

      if (error) throw error;
      if (!referrer) return null;

      // Get user data
      let user = {};
      if (referrer.user_id) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("uuid", referrer.user_id)
          .single();

        if (!userError) {
          user = userData || {};
        }
      }

      return {
        ...referrer,
        user,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getReferrerStats(referrerId) {
    try {
      // Get job count for this referrer
      const { data: jobs, error } = await supabase
        .from("vacancy")
        .select("id, is_active")
        .eq("referrer_id", referrerId);

      if (error) throw error;

      const jobs_count = jobs?.length || 0;
      const active_jobs = jobs?.filter((job) => job.is_active)?.length || 0;

      return {
        jobs_count,
        active_jobs,
        total_referrals: 0, // You might have a referrals table later
      };
    } catch (error) {
      console.error("Error getting referrer stats:", error);
      return {
        jobs_count: 0,
        active_jobs: 0,
        total_referrals: 0,
      };
    }
  }

  // Keep your existing methods but fix the ID field
  static async findById(id) {
    return await supabase.from("referrer").select("*").eq("uuid", id);
  }

  static async findByUserId(userId) {
    return await supabase.from("referrer").select("*").eq("user_id", userId);
  }

  static async fetchAll() {
    return await supabase.from("referrer").select("*");
  }

  static async insert(data) {
    return await supabase.from("referrer").insert(data).select();
  }
}

module.exports = Referrer;
