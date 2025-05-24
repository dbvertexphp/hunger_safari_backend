const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const commonProtect = require("../middleware/comman_authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const verifyToken = require('../middleware/verifytoken.js');
const {
	getAllUsers,
	getAllSubAdminsWithRestaurant,
	adminAllDashboardCount,
	updateUserStatus,
	adminSubDashboardCount,
	getOrdersByRestaurant,
	getOnlineOrdersByRestaurant,
	updateCODOrderStatus,
	updateCODPaymentStatus
} = require("../controllers/adminController.js");

const adminRoutes = express.Router();


adminRoutes.route("/getAllUsers").get(protect, Authorization(["admin"]), getAllUsers);
adminRoutes.route("/getAllSubAdminsWithRestaurant").get(protect, Authorization(["admin"]), getAllSubAdminsWithRestaurant);
adminRoutes.route("/adminAllDashboardCount").get(protect, Authorization(["admin", "subAdmin"]), adminAllDashboardCount);
adminRoutes.route("/adminSubDashboardCount").get(protect, Authorization(["subAdmin"]), adminSubDashboardCount);
adminRoutes.route("/getOrdersByRestaurant").get(protect, Authorization(["subAdmin"]), getOrdersByRestaurant);
adminRoutes.route("/getOnlineOrdersByRestaurant").get(protect, Authorization(["subAdmin"]), getOnlineOrdersByRestaurant);
adminRoutes.route("/updateUserStatus").patch(protect, Authorization(["admin"]), updateUserStatus);

adminRoutes.route("/update-cod-order-status/:orderId").patch(protect, Authorization(["subAdmin"]), updateCODOrderStatus);
adminRoutes.route("/update-cod-payment-status/:orderId").patch(protect, Authorization(["subAdmin"]), updateCODPaymentStatus);



module.exports = { adminRoutes };
