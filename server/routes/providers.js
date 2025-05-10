// routes/providers.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Provider = require('../models/Provider');
const Category = require('../models/Category');

router.use((req, res, next) => {
  console.log(`[ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});


// Get featured providers
router.get('/featured', async (req, res) => {
  try {
    const featuredProviders = await Provider.find({ featured: true })
      .sort({ averageRating: -1 })
      .limit(6)
      .populate('category', 'name');
    res.json(featuredProviders);
  } catch (err) {
   console.log(err)
    res.status(500).json({ message: 'Internal Server error' });
  }
});
// Search providers
router.get('/search', async (req, res) => {
    try {
      const { term, category } = req.query;
      let query = {};
      
      if (term) {
        query.$or = [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { 'location.city': { $regex: term, $options: 'i' } },
          { 'services.name': { $regex: term, $options: 'i' } }
        ];
      }
      
      if (category) {
        query.category = category;
      }
      
      const providers = await Provider.find(query)
        .sort({ averageRating: -1 })
        .populate('category', 'name');
      
      res.json(providers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get providers by category
router.get('/category/:categoryId', async (req, res) => {
    try {
      const { categoryId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      const { sort = 'rating' } = req.query;
      
      let sortOption = {};
      
      switch (sort) {
        case 'rating':
          sortOption = { averageRating: -1 };
          break;
        case 'reviews':
          sortOption = { reviewCount: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { averageRating: -1 };
      }
      
      const providers = await Provider.find({ category: categoryId })
        .sort(sortOption)
        .populate('category', 'name');
      
      res.json(providers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  
  // Get single provider by ID
  router.get('/:id', async (req, res) => {
    try {
      const provider = await Provider.findById(req.params.id)
        //.populate('category', 'name');
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      console.log(provider)
      
      res.json(provider);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Routes for creating, updating providers would be protected by auth middleware

  // @route   POST /api/providers
// @desc    Create a new provider
// @access  Public or Protected (depending on your auth logic)
router.post('/', async (req, res) => {
  try {
    console.log("request reached")
    const provider = new Provider(req.body);
    const saved = await provider.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// @route   PUT /api/providers/:id
// @desc    Update a provider by ID
// @access  Protected (optional)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Provider not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/providers/:id
// @desc    Delete a provider by ID
// @access  Protected (optional)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Provider.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Provider not found' });
    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
  module.exports = router;