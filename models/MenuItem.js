// models/MenuItem.js
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  subCategory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);
