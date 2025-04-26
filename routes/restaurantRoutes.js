const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } = require("../controllers/resturantController.js");

const resturantRoutes = express.Router();

resturantRoutes.route("/add").post(protect, Authorization(["admin"]), addRestaurant);
resturantRoutes.route("/all").get(protect, Authorization(["user", "admin"]), getAllRestaurants);
resturantRoutes.route("/:id").get(protect, Authorization(["user", "admin"]), getRestaurantById);
resturantRoutes.route("/update/:id").put(protect, Authorization(["admin"]), updateRestaurant);
resturantRoutes.route("/delete/:id").delete(protect, Authorization(["admin"]), deleteRestaurant);

module.exports = { resturantRoutes };
