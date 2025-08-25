const supabase = require("../db/supabase");

class UserToken {
  static async fetchAll(){
    return await supabase.from("user_token").select("*");
  }
  static async findById(uid) {
    return await supabase.from("user_token").select(
        "*").eq(
        "id", uid
    )
  }
  static async findByUserId(uid) {
    return await supabase.from("user_token").select(
        "*").eq(
        "user_id", uid
    )
  }
  static async insert(data) {
    return await supabase.from("user_token").insert(data);
  }

  static async getOrCreate(data) {
    let tokens = await this.findByUserId(data.user_id);
    if (tokens.data.length > 0) {
      return tokens;
    } else {
      await this.insert(data);
      return await this.findByUserId(data.user_id);
    }
  }

}

module.exports = UserToken;