const supabase = require("../db/supabase");


const MOCK_MODE = true;

/**
 * SuperAdmin model
 * Handles login and logout functionality for super admins.
 */


class SuperAdmin {
  /**
   * Login a super admin
   * @param {Object} param0
   * @param {string} param0.email - Unique email of the admin
   * @param {string} param0.password - Admin password
   * @returns {Object} - Returns user info or error
   */
  static async login({ email, password }) {
    if (MOCK_MODE) {
      // Mock login validation
      if (email !== "admin@example.com" || password !== "123456") {
        return { error: "Invalid email or password" };
      }

      return {
        user: {
          email: "admin@example.com",
          fullName: "Mock Super Admin",
        },
      };
    }

    // Real Supabase query to check admin credentials
    const { data, error } = await supabase
      .from("admin.super_admins")
      .select("*")
      .eq("email", email)
      .eq("password", password) 
      .single();

    if (error || !data) {
      return { error: "Invalid email or password" };
    }

    return {
      user: {
        email: data.email,
        fullName: data.full_name,
      },
    };
  }

  /**
   * Logout a super admin
   * @returns {Object} - Confirmation message
   */
  static async logout() {
    return { message: "Logged out successfully" };
  }
}

module.exports = SuperAdmin;
