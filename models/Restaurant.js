const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: {
    type: String,
  },
  address: {
    type: String,
  },
  details: {
    type: String,
  },
  opening_time: {
    type: String,   // Example: "09:00 AM"
  },
  closing_time: {
    type: String,   // Example: "10:00 PM"
  },
	tax_rate: {
		type: Number,
		required: true,
		default: 10, // tax rate in percentage, e.g., 10 for 10%
	},
	active: { type: Boolean, default: true },
  rating: {
    type: Number,
    default: 0,     // Default rating can be 0
    min: 0,
    max: 5
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: {
      type: String
    }
  },
  reviews: [    // <<=== Added this new field
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // assuming you have a User model
      },
      review: {
        type: String,
      },
      rating: {
        type: Number,
        min: 0,
        max: 5
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
