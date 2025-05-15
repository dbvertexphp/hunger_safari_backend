const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const commonProtect = require("../middleware/comman_authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const userRoutes = express.Router();
const verifyToken = require('../middleware/verifytoken.js');
const {
	registerUser,
	loginUser,
	verifyOtp,
	resendOTP,
	ForgetresendOTP,
	forgetPassword,
	ChangePassword,
	logoutUser,
	updateProfile,
	getOrderHistory,
	createSubAdmin,
	getAllSubAdmins,
	deleteSubAdmin,
	updateSubAdmin
} = require("../controllers/userControllers.js");

userRoutes.route("/register").post(registerUser);
userRoutes.route("/login").post(loginUser);
userRoutes.route("/verifyOtp").post(verifyOtp);
userRoutes.route("/resendOTP").post(resendOTP);
userRoutes.route("/ForgetresendOTP").post(ForgetresendOTP);
userRoutes.route("/forgetPassword").put(forgetPassword);
userRoutes.route("/ChangePassword").put(protect, ChangePassword);
userRoutes.route("/logoutUser").get(protect, logoutUser);
userRoutes.route("/updateProfile").put(protect, updateProfile);
userRoutes.route("/order-history").get(protect, Authorization(["user"]), getOrderHistory);



// Admin Routes

userRoutes.route("/createSubAdmin").post(protect, Authorization(["admin"]), createSubAdmin);
userRoutes.route("/updateSubAdmin/:id").put(protect, Authorization(["admin"]), updateSubAdmin);
userRoutes.route("/getAllSubAdmins").get(protect, Authorization(["admin"]), getAllSubAdmins);
userRoutes.route("/deleteSubAdmin/:id").delete(protect, Authorization(["admin"]), deleteSubAdmin);

module.exports = { userRoutes };
