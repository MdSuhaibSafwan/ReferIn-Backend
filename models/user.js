const supabase = require("../db/supabase");

class User {
  static async fetchAll(){
    return await supabase.from("users").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("users").insert(data);
    return userData
  }
  static async getOrCreate(data) {
    var user = await supabase.from("users").select("*").eq(
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
    return await supabase.from("users").select("*").eq(
      "id", id
    );
  }

  static async findByArray(idArray){
    return await supabase
      .from("users")
      .select("*")
      .in("id", idArray);
  }

}

module.exports = User;