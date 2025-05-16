const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const commonProtect = require("../middleware/comman_authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const verifyToken = require('../middleware/verifytoken.js');
const {
	getAllUsers,
	getAllSubAdminsWithRestaurant,
	adminAllDashboardCount,
	updateUserStatus
} = require("../controllers/adminController.js");

const adminRoutes = express.Router();


adminRoutes.route("/getAllUsers").get(protect, Authorization(["admin"]), getAllUsers);
adminRoutes.route("/getAllSubAdminsWithRestaurant").get(protect, Authorization(["admin"]), getAllSubAdminsWithRestaurant);
adminRoutes.route("/adminAllDashboardCount").get(protect, Authorization(["admin"]), adminAllDashboardCount);
adminRoutes.route("/updateUserStatus").patch(protect, Authorization(["admin"]), updateUserStatus);
module.exports = { adminRoutes };
