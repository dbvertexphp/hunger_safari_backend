const {
  User,
  NotificationMessages,
  AdminDashboard,
  WebNotification,
} = require("../models/userModel.js");
const Order = require("../models/Order");
const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errorHandler.js");
require("dotenv").config();
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem"); // 📢 You forgot to import MenuItem model earlier!
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");
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
      .populate("restaurant_id", "name") // Populate restaurant name
      .sort({ createdAt: -1 }); // Sort by creation date (optional)

    if (subAdmins.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No subAdmins found" });
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
    const [
      totalUsers,
      totalSubAdmins,
      totalRestaurants,
      codPayments,
      onlinePayments,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "subAdmin" }),
      Restaurant.countDocuments(),
      Order.countDocuments({ paymentMethod: "COD" }),
      Order.countDocuments({ paymentMethod: "Online" }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalSubAdmins,
        totalRestaurants,
        codPayments,
        onlinePayments,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const adminSubDashboardCount = async (req, res) => {
  try {
    const subAdminId = req.headers.userID;
    const user = await User.findById(subAdminId);
    const restaurantId = user.restaurant_id;

    // Get subcategories linked to restaurant
    const subCategories = await SubCategory.find(
      { restaurant_id: restaurantId },
      "_id"
    );
    const subCategoryIds = subCategories.map((sub) => sub._id);

    // Fetch counts and total amounts
    const [
      totalSubCategories,
      totalMenuItems,
      totalOrders,
      codOrders,
      onlineOrders,
      totalCodAmount,
      totalOnlineAmount,
    ] = await Promise.all([
      SubCategory.countDocuments({ restaurant_id: restaurantId }),
      MenuItem.countDocuments({ subCategory_id: { $in: subCategoryIds } }),
      Order.countDocuments({ restaurant_id: restaurantId }),
      Order.countDocuments({
        restaurant_id: restaurantId,
        paymentMethod: "COD",
      }),
      Order.countDocuments({
        restaurant_id: restaurantId,
        paymentMethod: "Online",
      }),

      // Aggregate total COD amount
      Order.aggregate([
        { $match: { restaurant_id: restaurantId, paymentMethod: "COD" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Aggregate total Online amount
      Order.aggregate([
        { $match: { restaurant_id: restaurantId, paymentMethod: "Online" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const codAmount = totalCodAmount[0]?.total || 0;
    const onlineAmount = totalOnlineAmount[0]?.total || 0;

    return res.json({
      success: true,
      data: {
        totalSubCategories,
        totalMenuItems,
        totalOrders,
        codOrders,
        onlineOrders,
        codAmount,
        onlineAmount,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateUserStatus = async (req, res, next) => {
  const { userId, active } = req.body;
  console.log("req", req.body);

  if (!userId || typeof active !== "boolean") {
    return next(
      new ErrorHandler("User ID and active status are required.", 400)
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  user.active = active;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${active ? "enabled" : "disabled"} successfully.`,
    user: {
      _id: user._id,
      full_name: user.full_name,
      active: user.active,
    },
  });
};

const getOrdersByRestaurant = async (req, res) => {
  try {
    const subAdminId = req.headers.userID;
    const user = await User.findById(subAdminId);

    if (!user || !user.restaurant_id) {
      return res.status(404).json({ message: "Restaurant not found for user" });
    }

    const restaurantId = user.restaurant_id;

    const orders = await Order.find({ restaurant_id: restaurantId, paymentMethod : "COD" }).sort({createdAt: -1})
      .populate({ path: "user_id", select: "full_name email mobile" }) // Populates user name
      .populate({ path: "items.menuItem_id", select: "name" }); // Populates each menu item name

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getOnlineOrdersByRestaurant = async (req, res) => {
  try {
    const subAdminId = req.headers.userID;
    const user = await User.findById(subAdminId);

    if (!user || !user.restaurant_id) {
      return res.status(404).json({ message: "Restaurant not found for user" });
    }

    const restaurantId = user.restaurant_id;

    const orders = await Order.find({ restaurant_id: restaurantId, paymentMethod : "Online" }).sort({createdAt: -1})
      .populate({ path: "user_id", select: "full_name email mobile" }) // Populates user name
      .populate({ path: "items.menuItem_id", select: "name" }); // Populates each menu item name

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const updateCODOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'Only COD orders can be updated via this API' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateCODPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
	console.log("oo", req.params)
  const { paymentStatus } = req.body;
  console.log("rrr", req.body);
  try {
    const order = await Order.findById(orderId);
   console.log("ddd", order);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'Only COD orders can be updated via this API' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({ message: 'Payment status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports = {
  getAllUsers,
  getAllSubAdminsWithRestaurant,
  adminAllDashboardCount,
  updateUserStatus,
  adminSubDashboardCount,
  getOrdersByRestaurant,
	getOnlineOrdersByRestaurant,
	updateCODOrderStatus,
	updateCODPaymentStatus
};
