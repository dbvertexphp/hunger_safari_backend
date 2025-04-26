const mongoose = require("mongoose");
const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;
