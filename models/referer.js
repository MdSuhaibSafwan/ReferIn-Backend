const supabase = require("../db/supabase");

class Referer {
  static async fetchAll(){
    return await supabase.from("referrer").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("referrer").insert(data).select("*").eq(
      "user_id", data.user_id
    );
    return userData
  }
  static async findById(id){
    return await supabase.from("referrer").select("*").eq(
      "id", id
    );
  }
  static async getOrCreate(data) {
    var referer = await supabase.from("referrer").select("*").eq(
      "user_id", data.user_id
    );
    if (referer.data.length > 0) {
      return referer;
    } else {
      await this.insert(data);
      return await this.getOrCreate(data);
    }
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
