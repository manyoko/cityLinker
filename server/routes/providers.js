const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider"); // Adjust path as needed
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");
const { authorize, auth } = require("../middleware/auth");

router.post("/multiple", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const imageUrls = req.files.map(
      (file) => `/uploads/providers/${file.filename}`
    );
    res.status(200).json({
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    console.log(error);
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }
    res.status(400).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const provider = new Provider(req.body);

    const saved = await provider.save();
    console.log("is provider saved", saved);

    res.status(201).json(saved);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// GET route to retrieve all providers
// router.get("/", async (req, res) => {
//   try {
//     const providers = await Provider.find();
//     res.json(providers);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
router.get("/", async (req, res) => {
  try {
    const { owner } = req.query;
    let query = {};

    if (owner) {
      query.owner = owner;
    }

    const providers = await Provider.find(query);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE route with image cleanup
router.delete("/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Clean up associated image files
    if (provider.image) {
      const imagePath = path.join(__dirname, "..", provider.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    if (provider.images && provider.images.length > 0) {
      provider.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath);
        fs.unlink(fullPath, (err) => {
          if (err) console.error("Error deleting image:", err);
        });
      });
    }

    await Provider.findByIdAndDelete(req.params.id);
    res.json({
      message: "Provider and associated images deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured providers
router.get("/featured", async (req, res) => {
  try {
    const featuredProviders = await Provider.find({ featured: true })
      .sort({ averageRating: -1 })
      .limit(6)
      .populate("category", "name");
    res.json(featuredProviders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server error" });
  }
});
// Search providers
router.get("/search", async (req, res) => {
  try {
    const { term, category } = req.query;
    let query = {};

    if (term) {
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { "location.city": { $regex: term, $options: "i" } },
        { "services.name": { $regex: term, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const providers = await Provider.find(query)
      .sort({ averageRating: -1 })
      .populate("category", "name");

    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get providers by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    const { sort = "rating" } = req.query;

    let sortOption = {};

    switch (sort) {
      case "rating":
        sortOption = { averageRating: -1 };
        break;
      case "reviews":
        sortOption = { reviewCount: -1 };
        break;
      case "name":
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { averageRating: -1 };
    }

    const providers = await Provider.find({ category: categoryId })
      .sort(sortOption)
      .populate("category", "name");

    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single provider by ID
router.get("/:id", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    //.populate('category', 'name');

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    console.log(provider);

    res.json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/providers/:id
// @desc    Update a provider by ID
// @access  Protected (optional)
router.put("/:id", authorize, async (req, res) => {
  try {
    console.log("Updating provider:", req.params.id);
    console.log("Request body:", req.body);

    const updated = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body, // This now contains the correctly formatted data from frontend
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
