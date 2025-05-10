// routes/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');

// Get all reviews for a specific provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const { sort = 'newest' } = req.query;
    
    let sortOption = {};
    
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const reviews = await Review.find({ provider: providerId })
      .sort(sortOption)
      .populate('user', 'name avatar')
      .exec();
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new review
router.post('/', async (req, res) => {
  try {
    const { provider, user, rating, comment, serviceDate } = req.body;
    
    // Check if provider exists
    const providerExists = await Provider.findById(provider);
    if (!providerExists) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Check if user has already reviewed this provider
    const existingReview = await Review.findOne({ provider, user });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this provider' });
    }
    
    const newReview = new Review({
      provider,
      user,
      rating,
      comment,
      serviceDate: serviceDate || null,
      verified: false // Default to false, admin can verify later
    });
    
    const savedReview = await newReview.save();
    
    // Note: The average rating update happens in the model's post-save hook
    
    res.status(201).json(savedReview);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // In a real app, check if the user is the owner of the review
    // if (review.user.toString() !== req.user.id) {
    //   return res.status(401).json({ message: 'Not authorized' });
    // }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    // The average rating update happens in the model's post-save hook
    
    res.json(updatedReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // In a real app, check if the user is the owner of the review
    // if (review.user.toString() !== req.user.id) {
    //   return res.status(401).json({ message: 'Not authorized' });
    // }
    
    await review.remove();
    // The average rating update happens in the model's post-remove hook
    
    res.json({ message: 'Review removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;