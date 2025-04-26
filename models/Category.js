const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String, // Optional: Add category image if needed
  },
});

module.exports = mongoose.model('Category', CategorySchema);
