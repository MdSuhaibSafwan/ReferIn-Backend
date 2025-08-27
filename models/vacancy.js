const supabase = require("../db/supabase");

class Vacancy {
  static async fetchAll(){
    return await supabase.from("vacancy").select("*");
  }
  static async insert(data) {
    let userData = await supabase.from("vacancy").insert(data);
    return userData
  }

  static async findById(id){
    return await supabase.from("vacancy").select("*").eq(
      "id", id
    );
  }
}

module.exports = Vacancy;