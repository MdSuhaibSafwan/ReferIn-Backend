const supabase = require('./supabase');

class BaseModel {
  constructor(tableName) {
    this.table = tableName;
  }

  fetchAll() {
    console.log(this.table)
    var data = supabase.from(this.table).select('*');
    console.log(data);
    return data;
  }

  fetchOneBy(field, value) {
    return supabase.from(this.table).select('*').eq(field, value).single();
  }

  create(data) {
    return supabase.from(this.table).insert([data]).select();
  }

  update(field, value, updates) {
    return supabase.from(this.table).update(updates).eq(field, value).select();
  }

  delete(field, value) {
    return supabase.from(this.table).delete().eq(field, value).select();
  }
}

module.exports = BaseModel;
