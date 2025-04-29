const express = require("express");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  checkoutOrder
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");


const paymentRoutes = express.Router();

// Payment Routes

paymentRoutes.route("/create-razorpay-order").post(protect, Authorization(["user"]), createRazorpayOrder);
paymentRoutes.route("/verify-razorpay-payment").post(protect, Authorization(["user"]), verifyRazorpayPayment);


// Order Routes

paymentRoutes.route("/checkOut").post(protect, Authorization(["user"]), checkoutOrder);



module.exports = { paymentRoutes };

