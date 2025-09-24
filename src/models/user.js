const db = require("../config/db");
const bcrypt = require("bcrypt");

class User {
  static async create(username, password, email) {
    try {
      // Input validation
      if (!username || !password || !email) {
        throw new Error("Username, password, and email are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.query(
        "INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
        [username, hashedPassword, email]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error("Username or email already exists");
      }
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      if (!username) {
        throw new Error("Username is required");
      }

      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async validatePassword(user, password) {
    if (!user || !password) {
      throw new Error("User and password are required for validation");
    }
    return bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User;
