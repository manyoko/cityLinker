// server.js - Main Express Server File
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const categoryRoutes = require('./routes/categories');
const providerRoutes = require('./routes/providers');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cityLinker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));


// Middleware
app.use(cors());
app.use(express.json());

// After middleware setup (e.g. after app.use(express.json()))
app.use('/api/categories', categoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/`);
});