const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addMenuItem, getAllMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem } = require("../controllers/MenuItemController");

const menuItemsRoutes = express.Router();

menuItemsRoutes.route("/add").post(protect, Authorization(["admin"]), addMenuItem);
menuItemsRoutes.route("/all").get(protect, Authorization(["user", "admin"]), getAllMenuItems)
menuItemsRoutes.route("/:id").get(protect, Authorization(["user", "admin"]), getMenuItemById)
menuItemsRoutes.route("/update/:id").put(protect, Authorization(["admin"]), updateMenuItem)
menuItemsRoutes.route("/delete/:id").delete(protect, Authorization(["admin"]), deleteMenuItem)

module.exports = { menuItemsRoutes };

