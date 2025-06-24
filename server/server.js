const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const passport = require("passport");
require("./middleware/passport")(passport);
const session = require("express-session");
const MongoStore = require("connect-mongo");
const categoryRoutes = require("./routes/categories");
const providerRoutes = require("./routes/providers");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
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

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set to true in production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware
//app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes

// Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }), // Redirect to '/' on failure
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard/home
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Logout route
app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    // Passport's req.logout() takes a callback in newer versions
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      // Destroy the session after logout
      if (err) {
        return next(err);
      }
      res.redirect(process.env.CLIENT_URL); // Redirect to frontend home after logout
    });
  });
});

// Check user status (optional, but useful for frontend)
app.get("/api/current_user", (req, res) => {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send({}); // Or res.status(401).send('Not authenticated');
  }
});

app.use("/api/categories", categoryRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// Admin routes (newly added)
app.use("/api/admin", require("./routes/admin"));

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
