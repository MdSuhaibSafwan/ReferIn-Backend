const supabase = require("../db/supabase");
const jwt = require("jsonwebtoken");

class SuperAdmin {
  // ?REGISTER A SUPER ADMIN

  static async register({ fullName, email, password, adminKey }) {
    // Validate admin key
    if (adminKey !== process.env.SUPER_ADMIN_KEY) {
      return { error: "Invalid admin key" };
    }

    // ?Create supabase auth user
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    const userId = authUser.user.id;

    //? Insert into admin.super_admins table
    const { error: insertError } = await supabase
      .from("admin.super_admins")
      .insert({
        id: userId,
        full_name: fullName,
        email,
      });

    if (insertError) {
      return { error: insertError.message };
    }

    // Generate tokens
    const tokens = this.generateTokens(userId, email);

    return {
      user: {
        id: userId,
        fullName,
        email,
        username: email,
      },
      tokens,
    };
  }

  // LOGIN SUPER ADMIN
  static async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    const user = data.user;

    const tokens = this.generateTokens(user.id, email);

    return {
      user: {
        id: user.id,
        fullName: user.user_metadata.full_name,
        email: user.email,
        username: user.email,
      },
      tokens,
    };
  }

  // REFRESH TOKEN
  static async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const tokens = this.generateTokens(decoded.id, decoded.email);

      return { tokens };
    } catch (err) {
      return { error: "Invalid refresh token" };
    }
  }

  // LOGOUT
  static async logout() {
    await supabase.auth.signOut();
    return { message: "Logged out successfully" };
  }

  // GENERATE TOKENS
  static generateTokens(id, email) {
    const accessToken = jwt.sign({ id, email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { id, email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

module.exports = SuperAdmin;
