// routes/cartRoutes.js
const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addToCart, viewCart, placeOrder, clearCart, updateCartQuantity } = require("../controllers/cartController");

const cartRoutes = express.Router();


cartRoutes.route("/add").post(protect, Authorization(["user"]), addToCart);
cartRoutes.route("/all").get(protect, Authorization(["user"]), viewCart);
cartRoutes.route("/update").patch(protect, Authorization(["user"]), updateCartQuantity);
// cartRoutes.route("/placeorder").post(protect, Authorization(["user"]), placeOrder);
// cartRoutes.route("/clear/:user_id").delete(protect, Authorization(["user"]), clearCart);

module.exports = { cartRoutes };
