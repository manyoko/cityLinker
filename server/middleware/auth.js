// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const TokenBlacklist = require("../models/TokenBlacklist");

// // Basic authentication middleware - checks if user is logged in
// const auth = async (req, res, next) => {
//   try {
//     // Get token from header
//     const token = req.header("Authorization");

//     // Check if no token
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "No token, authorization denied" });
//     }
//     // Check if token is blacklisted
//     const isBlacklisted = await TokenBlacklist.findOne({ token });
//     if (isBlacklisted) {
//       throw new Error("Token invalidated - please login again");
//     }

//     // Remove 'Bearer ' prefix if present
//     const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

//     // Verify token
//     const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

//     // Get user from database (optional - for fresh user data)
//     const user = await User.findById(decoded.user.id).select("-password");
//     if (!user) {
//       return res
//         .status(401)
//         .json({ message: "User not found, authorization denied" });
//     }

//     // Add user to request object
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Auth middleware error:", err.message);

//     // Handle specific JWT errors
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).json({ message: "Token expired" });
//     }
//     if (err.name === "JsonWebTokenError") {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     res.status(401).json({ message: "Token is not valid" });
//   }
// };

// // Optional: Role-based authorization middleware
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     // This middleware should be used after the auth middleware
//     if (!req.user) {
//       return res.status(401).json({ message: "Access denied. Please log in." });
//     }

//     // Check if user's role is included in allowed roles
//     if (!roles.includes(req.user.role)) {
//       return res
//         .status(403)
//         .json({ message: "Access denied. Insufficient permissions." });
//     }

//     next();
//   };
// };

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

// module.exports = { auth, authorize, authLight };

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist"); // Assuming you still use this for JWTs

// Unified authentication middleware - checks if user is logged in via Session or JWT
const auth = async (req, res, next) => {
  // 1. **PRIMARY CHECK: Session Authentication (for Google OAuth users)**
  //    Passport populates req.user if a valid session exists.
  //    req.isAuthenticated() is a Passport method available on the request object.
  if (req.isAuthenticated && req.isAuthenticated()) {
    // User is authenticated via session (e.g., Google OAuth)
    // req.user is already populated by Passport's deserializeUser
    return next(); // Proceed to the next middleware/route handler
  }

  // 2. **SECONDARY CHECK: JWT Authentication (for traditional login users)**
  //    If no session is found, then we proceed to check for a JWT.
  try {
    const authHeader = req.header("Authorization");

    // Check if Authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No valid token or session, authorization denied" });
    }

    const tokenValue = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted (if you use this for JWT revocation)
    const isBlacklisted = await TokenBlacklist.findOne({ token: tokenValue });
    if (isBlacklisted) {
      throw new Error("Token invalidated - please login again"); // Specific error message for blacklisted
    }

    // Verify token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Ensure the decoded object contains the user ID correctly (based on how you signed it)
    // If you signed with { id: user._id }, then it's decoded.id
    // If you signed with { user: { id: user._id } }, then it's decoded.user.id
    const userId = decoded.id || decoded.user?.id; // Adjust this based on your JWT payload structure

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid token payload, authorization denied" });
    }

    // Get user from database (optional - for fresh user data and roles)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found from token, authorization denied" });
    }

    // Add user to request object
    req.user = user;
    next(); // Proceed to the next middleware/route handler (user authenticated via JWT)
  } catch (err) {
    console.log("ERROR IS HERE");
    console.error("Auth middleware error:", err.message);

    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token format or signature" });
    }
    // Generic error for other issues
    res.status(401).json({ message: "Authorization failed" });
  }
};

// The 'authorize' middleware remains the same as it relies on req.user being set
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied. Please log in." });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

// authLight is still useful if you want a JWT-only check without DB lookup for certain routes.
// However, the main 'auth' should handle both for protected data access.
module.exports = { auth, authorize, authLight };
