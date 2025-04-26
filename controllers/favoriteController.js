const Favorite = require("../models/favorite");
const { User } = require("../models/userModel.js");
const Restaurant = require("../models/Restaurant");

// Add or Remove a restaurant from favorites
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated and user ID is in req.user
    const { restaurantId } = req.params;

    // Check if the favorite entry already exists
    const existingFavorite = await Favorite.findOne({ user_id: userId, restaurant_id: restaurantId });

    if (existingFavorite) {
      // Remove from favorites if it already exists
      await existingFavorite.remove();
      return res.status(200).json({ message: "Restaurant removed from favorites" });
    } else {
      // Add to favorites
      const newFavorite = new Favorite({ user_id: userId, restaurant_id: restaurantId });
      await newFavorite.save();
      return res.status(200).json({ message: "Restaurant added to favorites" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all favorite restaurants for the user
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated and user ID is in req.user

    // Find all favorites for the user and populate the restaurant data
    const favorites = await Favorite.find({ user_id: userId }).populate("restaurant_id");

    if (!favorites) {
      return res.status(404).json({ message: "No favorites found" });
    }

    res.status(200).json(favorites.map(fav => fav.restaurant_id)); // Only return restaurant details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
};
