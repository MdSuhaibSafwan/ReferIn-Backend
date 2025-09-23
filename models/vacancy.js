const supabase = require("../db/supabase");


class Vacancy {
  static async fetchAll(){
    return await supabase.from("vacancy").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy").insert(data).select();
    return userData
  }

  static async findById(id){
    return await supabase.from("vacancy").select("*").eq(
      "id", id
    );
  }
}

class VacancyRequirement {
  static async fetchAll(){
    return await supabase.from("vacancy_requirement").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy_requirement").insert(data).select();
    return userData
  }

  static async findByVacancyId(vacancyId){
    return await supabase.from("vacancy_requirement").select("*").eq(
      "vacancy_id", vacancyId
    );
  }
}


class VacancyExperience {
  static async fetchAll(){
    return await supabase.from("vacancy_experience_requirement").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy_experience_requirement").insert(data).select();
    return userData
  }

  static async findByVacancyId(vacancyId){
    return await supabase.from("vacancy_experience_requirement").select("*").eq(
      "vacancy_id", vacancyId
    );
  }
}

class VacancyResponsibility {
  static async fetchAll(){
    return await supabase.from("vacancy_responsibility").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy_responsibility").insert(data).select();
    return userData
  }

  static async findByVacancyId(vacancyId){
    return await supabase.from("vacancy_responsibility").select("*").eq(
      "vacancy_id", vacancyId
    );
  }
}

class VacancySkill {
  static async fetchAll(){
    return await supabase.from("vacancy_skill_required").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy_skill_required").insert(data).select();
    return userData
  }

  static async findByVacancyId(vacancyId){
    return await supabase.from("vacancy_skill_required").select("*").eq(
      "vacancy_id", vacancyId
    );
  }
}

class VacancySeekedBySeekers {
  static async fetchAll(){
    return await supabase.from("vacancy_seeked_by_seekers").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy_seeked_by_seekers").insert(data).select();
    return userData
  }

  static async findByVacancyId(vacancyId){
    return await supabase.from("vacancy_seeked_by_seekers").select("*").eq(
      "vacancy_id", vacancyId
    );
  }
}

exports.Vacancy = Vacancy;
exports.VacancyRequirement = VacancyRequirement;
exports.VacancyExperience = VacancyExperience;
exports.VacancyResponsibility = VacancyResponsibility;
exports.VacancySkill = VacancySkill;
exports.VacancySeekedBySeekers = VacancySeekedBySeekers;
