const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");

const {getRestaurantByUserId} = require("../controllers/subadminController.js")


const subadminRoutes = express.Router();


subadminRoutes.route("/getRestaurantByUserId").get(protect, Authorization(["subAdmin"]), getRestaurantByUserId);
// subadminRoutes.route("/getAllSubAdminsWithRestaurant").get(protect, Authorization(["admin"]), getAllSubAdminsWithRestaurant);
// subadminRoutes.route("/adminAllDashboardCount").get(protect, Authorization(["admin"]), adminAllDashboardCount);
// subadminRoutes.route("/updateUserStatus").patch(protect, Authorization(["admin"]), updateUserStatus);
module.exports = { subadminRoutes };
