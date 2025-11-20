/**
 * Controller for super admin authentication
 * Handles login and logout requests from frontend
 */

const SuperAdmin = require("../../models/superAdmin.models");

/**
 * Login a super admin
 * Validates email and password, supports mock or real DB
 */

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await SuperAdmin.login({ email, password });

    if (result.error) {
      return res.status(401).json({ error: result.error });
    }

    return res.json({ user: result.user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

/**
 * Logout a super admin
 * Currently just returns a success message
 */

const logout = async (req, res) => {
  try {
    const result = await SuperAdmin.logout();
    return res.json(result);
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Export using CommonJS
module.exports = {
  login,
  logout,
};
