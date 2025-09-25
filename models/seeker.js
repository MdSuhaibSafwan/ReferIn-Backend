const supabase = require("../db/supabase");

class Seeker {
  static async fetchAll(){
    return await supabase.from("seeker").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("seeker").insert(data);
    return userData
  }
  static async getOrCreate(data) {
    var user = await supabase.from("seeker").select("*").eq(
      "email", data.email
    );
    if (user.data.length > 0) {
      return user;
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

