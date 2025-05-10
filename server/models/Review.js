// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  serviceDate: {
    type: Date
  }
}, { timestamps: true });

// Update the provider's average rating when a review is added or modified
ReviewSchema.post('save', async function() {
  const Provider = mongoose.model('Provider');
  
  const provider = await Provider.findById(this.provider);
  
  const reviews = await this.constructor.find({ provider: this.provider });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  provider.averageRating = averageRating;
  provider.reviewCount = reviews.length;
  
  await provider.save();
});

// Handle review deletion
ReviewSchema.post('remove', async function() {
  const Provider = mongoose.model('Provider');
  
  const provider = await Provider.findById(this.provider);
  
  const reviews = await this.constructor.find({ provider: this.provider });
  
  if (reviews.length === 0) {
    provider.averageRating = 0;
    provider.reviewCount = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    provider.averageRating = averageRating;
    provider.reviewCount = reviews.length;
  }
  
  await provider.save();
});

module.exports = mongoose.model('Review', ReviewSchema);