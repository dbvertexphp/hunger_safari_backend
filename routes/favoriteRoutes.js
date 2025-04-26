const express = require("express");
const { toggleFavorite, getFavorites } = require("../controllers/favoriteController");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js"); // Assuming you're using JWT or session-based auth

const favoriteRoutes = express.Router();



favoriteRoutes.route("/favorite/:restaurantId").post(protect, Authorization(["user"]), toggleFavorite);
favoriteRoutes.route("/favorites").get(protect, Authorization(["user"]), getFavorites);


module.exports = { favoriteRoutes };
