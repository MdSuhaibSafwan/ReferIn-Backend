const supabase = require("../db/supabase");

class Vacancy {
  static async fetchAll() {
    return await supabase.from("vacancy").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("vacancy").insert(data).select();
    return userData;
  }

  static async findById(id) {
    return await supabase.from("vacancy").select("*").eq("id", id);
  }

  static async findByRefererId(refererId) {
    return await supabase
      .from("vacancy")
      .select("*")
      .eq("referrer_id", refererId);
  }

  static async findByArray(ids) {
    return await supabase.from("vacancy").select("*").in("id", ids);
  }

  // Add this for consistency
  static async deleteById(id) {
    return await supabase.from("vacancy").delete().eq("id", id);
  }
}

class VacancyRequirement {
  static async fetchAll() {
    return await supabase.from("vacancy_requirement").select("*");
  }

  static async insert(data) {
    let userData = await supabase
      .from("vacancy_requirement")
      .insert(data)
      .select();
    return userData;
  }

  static async findByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_requirement")
      .select("*")
      .eq("vacancy_id", vacancyId);
  }

  static async deleteByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_requirement")
      .delete()
      .eq("vacancy_id", vacancyId);
  }
}

class VacancyResponsibility {
  static async fetchAll() {
    return await supabase.from("vacancy_responsibility").select("*");
  }

  static async insert(data) {
    let userData = await supabase
      .from("vacancy_responsibility")
      .insert(data)
      .select();
    return userData;
  }

  static async findByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_responsibility")
      .select("*")
      .eq("vacancy_id", vacancyId);
  }

  static async deleteByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_responsibility")
      .delete()
      .eq("vacancy_id", vacancyId);
  }
}

class VacancySkill {
  static async fetchAll() {
    return await supabase.from("vacancy_skill_required").select("*");
  }

  static async insert(data) {
    let userData = await supabase
      .from("vacancy_skill_required")
      .insert(data)
      .select();
    return userData;
  }

  static async findByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_skill_required")
      .select("*")
      .eq("vacancy_id", vacancyId);
  }

  static async deleteByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_skill_required")
      .delete()
      .eq("vacancy_id", vacancyId);
  }
}


class VacancyMatch {
  static async findBySeekerId(seekerId) {
    return await supabase
      .from("vacancy_match")
      .select("*")
      .eq("seeker_id", seekerId);
  }

  static async findByVacancyId(vacancyId) {
    return await supabase
      .from("vacancy_match")
      .select("*")
      .eq("vacancy_id", vacancyId);
  }

  static async insert(data) {
    return await supabase.from("vacancy_match").insert(data).select();
  }

  static async deleteById(id) {
    return await supabase.from("vacancy_match").delete().eq("id", id);
  }
}

exports.Vacancy = Vacancy;
exports.VacancyRequirement = VacancyRequirement;
exports.VacancyResponsibility = VacancyResponsibility;
exports.VacancySkill = VacancySkill;
exports.VacancyMatch = VacancyMatch;

// Removed these exports
// exports.VacancyExperience = VacancyExperience;
