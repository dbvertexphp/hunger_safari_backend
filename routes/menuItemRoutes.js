const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addMenuItem, getAllMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem, getMenuItemsByUser } = require("../controllers/MenuItemController");

const menuItemsRoutes = express.Router();

menuItemsRoutes.route("/add").post(protect, Authorization(["admin", "subAdmin"]), addMenuItem);
menuItemsRoutes.route("/all").get(protect, Authorization(["user", "admin"]), getAllMenuItems);
menuItemsRoutes.route("/getMenuItemsByUser").get(protect, Authorization(["admin", "subAdmin"]), getMenuItemsByUser);
menuItemsRoutes.route("/:id").get(protect, Authorization(["user", "admin"]), getMenuItemById);
menuItemsRoutes.route("/update/:id").put(protect, Authorization(["admin", "subAdmin"]), updateMenuItem);
menuItemsRoutes.route("/delete/:id").delete(protect, Authorization(["admin", "subAdmin"]), deleteMenuItem);

module.exports = { menuItemsRoutes };

