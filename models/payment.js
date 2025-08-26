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

  static async updateSession(id, data) {
    var selection = await supabase.from("stripe_session").select("*").eq(
      "id", id
    )
    if (selection.data.length > 0){
      data = {
        "session_id": data.session_id || selection.data[0].session_id, 
        "meta_uid": data.meta_uid || selection.data[0].meta_uid, 
        "has_paid": data.has_paid || selection.data[0].has_paid, 
        "is_expired": data.is_expired || selection.data[0].is_expired, 
      }
      return await supabase.from("stripe_session").update(data).eq(
        "id", id
      ).select();
    } else {
      return selection;
    }
  }

}

module.exports = StripeSession;