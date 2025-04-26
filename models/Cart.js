// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  items: [
    {
      menuItem_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
