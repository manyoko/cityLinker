const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

// Basic authentication middleware - checks if user is logged in
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization");

    // Check if no token
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      throw new Error("Token invalidated - please login again");
    }

    // Remove 'Bearer ' prefix if present
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Verify token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Get user from database (optional - for fresh user data)
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(401).json({ message: "Token is not valid" });
  }
};

// Optional: Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    // This middleware should be used after the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. Please log in." });
    }

    // Check if user's role is included in allowed roles
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};

// Optional: Lightweight middleware that only decodes token without database lookup
const authLight = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization");

    // Check if no token
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Remove 'Bearer ' prefix if present
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Verify token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Add decoded user info to request object (no database lookup)
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { auth, authorize, authLight };
