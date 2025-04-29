const { User, NotificationMessages, AdminDashboard, WebNotification } = require("../models/userModel.js");
const Order = require("../models/Order")
const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errorHandler.js");
require("dotenv").config();
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem"); // 📢 You forgot to import MenuItem model earlier!
const Restaurant = require("../models/Restaurant");
const Category = require('../models/Category');
const fs = require("fs");
const path = require('path');
const Favorite = require("../models/favorite");
const upload = require("../middleware/uploadMiddleware.js");
const SubCategory = require("../models/SubCategory");

const getAllUsers = async (req, res) => {
	try {
	  const page = parseInt(req.query.page) || 1;
	  const limit = parseInt(req.query.limit) || 10;
	  const search = req.query.search || "";
  
	  const query = {
		role: "user",
		$or: [
		  { name: { $regex: search, $options: "i" } },
		  { email: { $regex: search, $options: "i" } },
		],
	  };
  
	  const totalUsers = await User.countDocuments(query);
	  const users = await User.find(query)
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit);
  
	  res.status(200).json({
		success: true,
		message: "Users fetched successfully",
		users,
		totalUsers,
		totalPages: Math.ceil(totalUsers / limit),
		currentPage: page,
	  });
	} catch (error) {
	  res.status(500).json({
		success: false,
		message: "Something went wrong",
		error: error.message,
	  });
	}
  };
  
  const getAllSubAdminsWithRestaurant = async (req, res) => {
	try {
	  // Fetch all subAdmins and populate the 'restaurant_id' field
	  const subAdmins = await User.find({ role: "subAdmin" })
		.populate('restaurant_id', 'name') // Populate restaurant name
		.sort({ createdAt: -1 }); // Sort by creation date (optional)
  
	  if (subAdmins.length === 0) {
		return res.status(404).json({ success: false, message: "No subAdmins found" });
	  }
  
	  res.status(200).json({
		success: true,
		message: "Fetched all subAdmins with restaurant name",
		subAdmins,
	  });
	} catch (error) {
	  res.status(500).json({
		success: false,
		message: "Something went wrong",
		error: error.message,
	  });
	}
  };
  
const adminAllDashboardCount = async (req, res) => {
	try {
	  const [totalUsers, totalSubAdmins, totalRestaurants, codPayments, onlinePayments] = await Promise.all([
		User.countDocuments({ role: 'user' }),
		User.countDocuments({ role: 'subAdmin' }),
		Restaurant.countDocuments(),
		Order.countDocuments({ payment_type: 'cod' }),
		Order.countDocuments({ payment_type: 'online' })
	  ]);
  
	  return res.json({
		success: true,
		data: {
		  totalUsers,
		  totalSubAdmins,
		  totalRestaurants,
		  codPayments,
		  onlinePayments
		}
	  });
	} catch (err) {
	  console.error(err);
	  return res.status(500).json({ success: false, message: 'Server Error' });
	}
  };


  module.exports = {
	getAllUsers,
	getAllSubAdminsWithRestaurant,
	adminAllDashboardCount,
  }
