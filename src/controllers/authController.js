const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username , role: user.role},
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Register a new user
const signup = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and email are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Create new user
    const newUser = await User.create(username, password, email);

    // Generate JWT token
    const token = generateToken(newUser);

    // Set token in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login an existing user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find the user
    const user = await User.findByUsername(username);

    // If user doesn't exist or password is invalid
    if (!user || !(await User.validatePassword(user, password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    console.log(user);
    // Generate JWT token
    const token = generateToken(user);

    // Set token in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signup,
  login,
};
