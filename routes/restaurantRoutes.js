const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant, updateRestaurantRating, getRestaurantReviews, getAllRestaurantsAdmin, getAllRestaurantsWithDetails } = require("../controllers/resturantController.js");

const resturantRoutes = express.Router();

resturantRoutes.route("/add").post(protect, Authorization(["admin"]), addRestaurant);
resturantRoutes.route("/all").get(protect, Authorization(["user", "admin"]), getAllRestaurants);
resturantRoutes.route("/allAdmin").get(protect, Authorization(["admin"]), getAllRestaurantsAdmin);
resturantRoutes.route("/getAllRestaurantsWithDetails").get(protect, Authorization(["admin"]), getAllRestaurantsWithDetails);
resturantRoutes.route("/:id").get(protect, Authorization(["user", "admin"]), getRestaurantById);
resturantRoutes.route("/update/:id").put(protect, Authorization(["admin", "subAdmin"]), updateRestaurant);
resturantRoutes.route("/delete/:id").delete(protect, Authorization(["admin"]), deleteRestaurant);
resturantRoutes.route("/update-rating").put(protect, Authorization(["user"]), updateRestaurantRating);
resturantRoutes.route("/reviews/:restaurant_id").get(protect, Authorization(["user", "admin"]), getRestaurantReviews);


module.exports = { resturantRoutes };
