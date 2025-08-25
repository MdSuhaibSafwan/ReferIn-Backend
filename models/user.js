const BaseModel = require('./baseModel');

class User extends BaseModel {
  constructor() {
    super('users'); // Supabase table name
  }

  fetchByLinkedinId(linkedinId) {
    return this.fetchOneBy('linkedin_id', linkedinId);
  }
}

module.exports = new User();
