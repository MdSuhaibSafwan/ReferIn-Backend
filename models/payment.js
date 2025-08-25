const supabase = require("../db/supabase");

class StripeSession {
  static async fetchAll(){
    return await supabase.from("stripe_session").select("*");
  }
  static async findSessionByUid(uid) {
    return await supabase.from("stripe_session").select(
        "*").eq(
        "meta_uid", uid
    )
  }
  static async insertSession(data) {
    return await supabase.from("stripe_session").insert(data);
  }
}

module.exports = StripeSession;