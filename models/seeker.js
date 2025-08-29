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

  static async findByArray(idArray){
    return await supabase
      .from("seeker")
      .select("*")
      .in("id", idArray);
  }
};

module.exports = Seeker;
