// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Provider = require("../models/Provider");
const { auth, authorize } = require("../middleware/auth");

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new usera
    user = new User({
      username,
      email,
      password,
      role: "admin", // Default role
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Case: User signed up with Google, no password set
    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was registered using Google. Please log in with Google Email instead.",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    // User is already attached to req.user by auth middleware
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("favorites", "name description");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update current user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email, avatar, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find the user
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update object
    const updateData = {};

    // Update username if provided
    if (username && username !== user.username) {
      updateData.username = username;
    }

    // Update email if provided (check for uniqueness)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateData.email = email;
    }

    // Update avatar if provided
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required to change password" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete current user account
router.delete("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password before deletion
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add/Remove favorites
router.post("/favorites/:providerId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if provider is already in favorites
    const isFavorite = user.favorites.includes(providerId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== providerId
      );
      await user.save();
      res.json({
        message: "Removed from favorites",
        favorites: user.favorites,
      });
    } else {
      // Add to favorites
      user.favorites.push(providerId);
      await user.save();
      res.json({ message: "Added to favorites", favorites: user.favorites });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user favorites
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("favorites", "name description category location rating")
      .select("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
