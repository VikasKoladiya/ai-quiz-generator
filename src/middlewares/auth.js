const jwt = require("jsonwebtoken");
require("dotenv").config();

// Error messages
const ERROR_MESSAGES = {
  NO_TOKEN: "Authentication required. Please log in.",
  TOKEN_EXPIRED: "Token expired. Please log in again.",
  INVALID_TOKEN: "Invalid authentication token.",
  SERVER_ERROR: "Internal server error during authentication."
};

// Token validation function
const validateToken = (token) => {
  if (!token) {
    throw new Error(ERROR_MESSAGES.NO_TOKEN);
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Error response helper
const sendErrorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

const authenticate = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;

    // Validate token
    const decoded = validateToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return sendErrorResponse(res, 401, ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    if (error.message === ERROR_MESSAGES.NO_TOKEN) {
      return sendErrorResponse(res, 401, ERROR_MESSAGES.NO_TOKEN);
    }

    return sendErrorResponse(res, 401, ERROR_MESSAGES.INVALID_TOKEN);
  }
};

const accessControl = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(res, 403, "You are not authorized to access this resource");
    }
    next();
  };
};

module.exports = { authenticate, accessControl };
