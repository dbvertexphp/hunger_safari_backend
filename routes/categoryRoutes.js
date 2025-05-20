const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require("../controllers/categoryControllers.js");
const categoryRoutes = express.Router();

// routes for categories

categoryRoutes.route("/addCategory").post(protect, Authorization(["admin"]), addCategory);
categoryRoutes.route("/getAllCategories").get(protect, Authorization(["user", "admin", "subAdmin"]), getAllCategories)
categoryRoutes.route("/getCategoryById/:id").get(protect, Authorization(["user", "admin"]), getCategoryById)
categoryRoutes.route("/updateCategoryById/:id").put(protect, Authorization(["admin"]), updateCategoryById)
categoryRoutes.route("/deleteCategoryById/:id").delete(protect, Authorization(["admin"]), deleteCategoryById)

module.exports = { categoryRoutes };
