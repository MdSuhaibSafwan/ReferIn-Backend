// models/seeker.js
const supabase = require("../db/supabase");

class Seeker {
  static async fetchAll() {
    return await supabase.from("seeker").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker").insert(data).select();
    return userData;
  }

  static async getOrCreate(data) {
    var seeker = await supabase.from("seeker").select("*").eq("user_id", data.user_id);
    if (seeker.data && seeker.data.length > 0) {
      return seeker;
    } else {
      await this.insert(data);
      return await this.getOrCreate(data);
    }
  }

  static async findById(id) {
    return await supabase.from("seeker").select("*").eq("uuid", id);
  }

  static async findByUserId(userId) {
    return await supabase.from("seeker").select("*").eq("user_id", userId);
  }

  static async findByArray(idArray) {
    return await supabase
      .from("seeker")
      .select("*")
      .in("uuid", idArray);
  }

  static async update(identifier, data, by = "uuid") {
    const result = await supabase
      .from("seeker")
      .update(data)
      .eq(by, identifier)
      .select("*");
    return result;
  }

  static async deleteById(id) {
    return await supabase
      .from("seeker")
      .delete()
      .eq("uuid", id);
  }

  // New method for paginated fetching with user data
  static async fetchAllPaginated(limit = 10, offset = 0, search = '') {
    try {
      let query = supabase
        .from("seeker")
        .select("*", { count: 'exact' });

      if (search) {
        query = query.or(`current_company.ilike.%${search}%,location.ilike.%${search}%`);
      }

      const { data: seekers, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: seekers, count, error: null };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }
}

class SeekerSkill {
  static async fetchAll() {
    return await supabase.from("seeker_skill").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker_skill").insert(data).select();
    return userData;
  }

  static async findById(id) {
    return await supabase.from("seeker_skill").select("*").eq("id", id);
  }

  static async findBySeekerId(seeker_id) {
    return await supabase.from("seeker_skill").select("*").eq("seeker_id", seeker_id);
  }

  static async findByArray(seekerIds) {
    return await supabase
      .from("seeker_skill")
      .select("*")
      .in("seeker_id", seekerIds);
  }

  static async deleteBySeekerId(seekerId) {
    return await supabase
      .from("seeker_skill")
      .delete()
      .eq("seeker_id", seekerId);
  }

  static async update(id, data) {
    return await supabase
      .from("seeker_skill")
      .update(data)
      .eq("id", id)
      .select();
  }
}

class SeekerEducation {
  static async fetchAll() {
    return await supabase.from("seeker_education").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker_education").insert(data).select();
    return userData;
  }

  static async findById(id) {
    return await supabase.from("seeker_education").select("*").eq("id", id);
  }

  static async findBySeekerId(seeker_id) {
    return await supabase.from("seeker_education").select("*").eq("seeker_id", seeker_id);
  }

  static async findByArray(seekerIds) {
    return await supabase
      .from("seeker_education")
      .select("*")
      .in("seeker_id", seekerIds);
  }

  static async deleteBySeekerId(seekerId) {
    return await supabase
      .from("seeker_education")
      .delete()
      .eq("seeker_id", seekerId);
  }

  static async update(id, data) {
    return await supabase
      .from("seeker_education")
      .update(data)
      .eq("id", id)
      .select();
  }
}

class SeekerWorkExperience {
  static async fetchAll() {
    return await supabase.from("seeker_work_history").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker_work_history").insert(data).select();
    return userData;
  }

  static async findById(id) {
    return await supabase.from("seeker_work_history").select("*").eq("id", id);
  }

  static async findBySeekerId(seeker_id) {
    return await supabase.from("seeker_work_history").select("*").eq("seeker_id", seeker_id);
  }

  static async findByArray(seekerIds) {
    return await supabase
      .from("seeker_work_history")
      .select("*")
      .in("seeker_id", seekerIds);
  }

  static async deleteBySeekerId(seekerId) {
    return await supabase
      .from("seeker_work_history")
      .delete()
      .eq("seeker_id", seekerId);
  }

  static async update(id, data) {
    return await supabase
      .from("seeker_work_history")
      .update(data)
      .eq("id", id)
      .select();
  }

  // Special method to calculate total experience for a seeker
  static async getTotalExperience(seekerId) {
    try {
      const { data: experiences, error } = await this.findBySeekerId(seekerId);
      
      if (error) return 0;
      
      let totalMonths = 0;
      experiences.data?.forEach(exp => {
        const start = new Date(exp.start_date);
        const end = exp.current ? new Date() : new Date(exp.end_date);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      });
      
      return Math.round((totalMonths / 12) * 10) / 10; // Return in years with 1 decimal
    } catch (error) {
      return 0;
    }
  }
}

// Utility function to get complete seeker profile with all related data
const getCompleteSeekerProfile = async (seekerId) => {
  try {
    const [seekerResult, skillsResult, educationResult, experienceResult] = await Promise.all([
      Seeker.findById(seekerId),
      SeekerSkill.findBySeekerId(seekerId),
      SeekerEducation.findBySeekerId(seekerId),
      SeekerWorkExperience.findBySeekerId(seekerId)
    ]);

    if (seekerResult.error) throw new Error(seekerResult.error.message);
    if (!seekerResult.data || seekerResult.data.length === 0) {
      throw new Error('Seeker not found');
    }

    const seeker = seekerResult.data[0];
    
    // Get user data
    let user = {};
    if (seeker.user_id) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", seeker.user_id)
        .single();

      if (!userError) {
        user = userData;
      }
    }

    return {
      ...seeker,
      user,
      skills: skillsResult.data || [],
      education: educationResult.data || [],
      work_experience: experienceResult.data || [],
      skills_count: skillsResult.data?.length || 0,
      experience_years: await SeekerWorkExperience.getTotalExperience(seekerId)
    };
  } catch (error) {
    throw error;
  }
};

// Utility function to delete seeker and all related data
const deleteSeekerCompletely = async (seekerId) => {
  try {
    // Delete all related data first
    await Promise.all([
      SeekerSkill.deleteBySeekerId(seekerId),
      SeekerEducation.deleteBySeekerId(seekerId),
      SeekerWorkExperience.deleteBySeekerId(seekerId)
    ]);

    // Delete the seeker
    const result = await Seeker.deleteById(seekerId);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  Seeker,
  SeekerSkill,
  SeekerEducation,
  SeekerWorkExperience,
  getCompleteSeekerProfile,
  deleteSeekerCompletely
};