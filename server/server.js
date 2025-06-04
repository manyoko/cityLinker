const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const categoryRoutes = require("./routes/categories");
const providerRoutes = require("./routes/providers");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
require("dotenv").config();
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cityLinker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ error: "Only image files are allowed!" });
  }

  res.status(500).json({ error: error.message });
});
app.use(
  "/uploads/providers",
  express.static(path.join(__dirname, "uploads/providers"))
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/`);
});
