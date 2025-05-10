// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for creating, updating, and deleting categories would go here
router.post("/", async (req, res) => {
  try {
    console.log("request reached");
    const {name, description, slug } = req.body;
    const newCategory = new Category({ name: name, description : description, slug: slug});
    await newCategory.save()
      .then(savedCategory => {
        console.log("category added", savedCategory);
        res.status(200).send(savedCategory);
      });
      
  } catch(error) {
    console.log(error);
    res.status(500).json({message: "Server Error adding cateogry"})
  }
})

module.exports = router;