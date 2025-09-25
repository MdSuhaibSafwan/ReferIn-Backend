const supabase = require("../db/supabase");

class Referer {
  static async fetchAll(){
    return await supabase.from("referrer").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("referrer").insert(data);
    return userData
  }
  static async findById(id){
    return await supabase.from("referrer").select("*").eq(
      "id", id
    );
  }
  static async findByUserId(userId){
    return await supabase.from("referrer").select("*").eq(
      "user_id", userId
    );
  }
  static async findByArray(idArray){
    return await supabase
      .from("referrer")
      .select("*")
      .in("id", idArray);
  }

}

module.exports = Referer;
