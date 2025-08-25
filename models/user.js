const supabase = require("../db/supabase");

class User {
  static async fetchAll(){
    return await supabase.from("users").select("*");
  }
}

module.exports = User;