// models/SubCategory.js
const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("SubCategory", subCategorySchema);
