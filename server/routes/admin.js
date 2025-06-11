// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Import your User model
const { auth, authorize } = require("../middleware/auth"); // Import your auth middleware

// @route   PUT /api/admin/promote/:userId
// @desc    Promote a user to admin role
// @access  Private (Admin only)
router.put("/promote/:userId", auth, authorize("admin"), async (req, res) => {
  try {
    const userIdToPromote = req.params.userId;

    // Check if the user trying to promote is promoting themselves (optional but good to consider)
    if (req.user.id === userIdToPromote) {
      return res.status(400).json({
        message: "You cannot change your own role through this endpoint.",
      });
    }

    const user = await User.findById(userIdToPromote);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent demoting the last admin (optional but highly recommended)
    // You'd need to count existing admins for this. For simplicity, we'll skip for now.
    // In a real application, you might want to ensure at least one admin always exists.

    // Update the user's role
    user.role = "admin"; // Assuming 'admin' is the desired role string
    await user.save();

    res.json({
      message: `${user.email} has been promoted to admin.`,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error promoting user:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/admin/demote/:userId
// @desc    Demote an admin user to a regular user role
// @access  Private (Admin only)
router.put("/demote/:userId", auth, authorize("admin"), async (req, res) => {
  try {
    const userIdToDemote = req.params.userId;

    // Prevent an admin from demoting themselves (crucial for security)
    if (req.user.id === userIdToDemote) {
      return res.status(400).json({
        message: "You cannot demote yourself. Another admin must do this.",
      });
    }

    const user = await User.findById(userIdToDemote);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin." });
    }

    // Update the user's role to a default regular user role (e.g., 'user')
    user.role = "user"; // Assuming 'user' is your default non-admin role
    await user.save();

    res.json({
      message: `${user.email} has been demoted to user.`,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error demoting user:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
