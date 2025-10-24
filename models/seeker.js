const supabase = require("../db/supabase");

class Seeker {
  static async fetchAll(){
    return await supabase.from("seeker").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("seeker").insert(data).select("*").eq(
      "user_id", data.user_id
    );
    return userData
  }
  static async getOrCreate(data) {
    var seeker = await supabase.from("seeker").select("*").eq(
      "user_id", data.user_id
    );
    if (seeker.data.length > 0) {
      return seeker;
    } else {
      await this.insert(data);
      return await this.getOrCreate(data);
    }
  }

  static async findById(id){
    return await supabase.from("seeker").select("*").eq(
      "id", id
    );
  }

  static async findByUserId(userId){
    return await supabase.from("seeker").select("*").eq(
      "user_id", userId
    );
  }

  static async findByArray(idArray){
    return await supabase
      .from("seeker")
      .select("*")
      .in("id", idArray);
  };

  static async update(identifier, data, by = "id") {
    // identifier → can be id or user_id value
    // by → which field to use for lookup ("id" or "user_id")

    const result = await supabase
      .from("seeker")
      .update(data)
      .eq(by, identifier)
      .select("*");

    return result;
  }

};


class SeekerSkill {

  static async fetchAll(){
    return await supabase.from("seeker_skill").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker_skill").insert(data);
    return userData
  }

  static async findById(id){
    return await supabase.from("seeker_skill").select("*").eq(
      "id", id
    );
  }

  static async findBySeekerId(seeker_id){
    return await supabase.from("seeker_skill").select("*").eq(
      "seeker_id", seeker_id
    );
  }
};


class SeekerEducation {

  static async fetchAll(){
    return await supabase.from("seeker_education").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker_education").insert(data);
    return userData
  }

  static async findById(id){
    return await supabase.from("seeker_education").select("*").eq(
      "id", id
    );
  }

  static async findBySeekerId(seeker_id){
    return await supabase.from("seeker_education").select("*").eq(
      "seeker_id", seeker_id
    );
  }
};


class SeekerWorkExperience {

  static async fetchAll(){
    return await supabase.from("seeker_work_history").select("*");
  }

  static async insert(data) {
    let userData = await supabase.from("seeker_work_history").insert(data);
    return userData
  }

  static async findById(id){
    return await supabase.from("seeker_work_history").select("*").eq(
      "id", id
    );
  }

  static async findBySeekerId(seeker_id){
    return await supabase.from("seeker_work_history").select("*").eq(
      "seeker_id", seeker_id
    );
  }
};



exports.Seeker = Seeker;
exports.SeekerSkill = SeekerSkill;
exports.SeekerEducation = SeekerEducation;
exports.SeekerWorkExperience = SeekerWorkExperience;

