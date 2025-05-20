const { User, NotificationMessages, AdminDashboard, WebNotification } = require("../models/userModel.js");
const Order = require("../models/Order")
const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errorHandler.js");
require("dotenv").config();
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem"); 
const Restaurant = require("../models/Restaurant");
const Category = require('../models/Category');
const fs = require("fs");
const path = require('path');
const Favorite = require("../models/favorite");
const upload = require("../middleware/uploadMiddleware.js");
const SubCategory = require("../models/SubCategory");


const getRestaurantByUserId = async (req, res) => {
  const userId = req.user._id;
  const baseURL = `${req.protocol}://${req.get("host")}/`;

  // Step 1: Find user and get restaurant_id
  const user = await User.findById(userId, "restaurant_id full_name");
  if (!user || !user.restaurant_id) {
    return res.status(404).json({ message: "User or restaurant not found" });
  }

  // Step 2: Find the restaurant
  const restaurant = await Restaurant.findById(user.restaurant_id).populate("category_id", "name");
  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  // Step 3: Find subcategories of the restaurant
  const subcategories = await SubCategory.find({ restaurant_id: restaurant._id });

  // Step 4: Fetch menu items for each subcategory
  const subcategoriesWithMenus = await Promise.all(
    subcategories.map(async (sub) => {
      const menuItems = await MenuItem.find({ subCategory_id: sub._id });

      const updatedMenuItems = menuItems.map(menu => ({
        ...menu.toObject(),
        image: menu.image ? baseURL + menu.image : null
      }));

      return {
        ...sub.toObject(),
        image: sub.image ? baseURL + sub.image : null,
        menuItems: updatedMenuItems
      };
    })
  );

  // Step 5: Construct final restaurant object
  const restaurantData = {
    ...restaurant.toObject(),
    image: restaurant.image ? baseURL + restaurant.image : null,
    subAdminName: user.full_name || null,
    subcategories: subcategoriesWithMenus
  };

  res.status(200).json(restaurantData);
};





module.exports = {
	getRestaurantByUserId,
}
