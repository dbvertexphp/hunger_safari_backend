const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory } = require("../controllers/SubCategoryController");

const subCategoryRoutes = express.Router();


subCategoryRoutes.route("/add").post(protect, Authorization(["admin"]), addSubCategory);
subCategoryRoutes.route("/all").get(protect, Authorization(["user", "admin"]), getAllSubCategories)
subCategoryRoutes.route("/:id").get(protect, Authorization(["user", "admin"]), getSubCategoryById)
subCategoryRoutes.route("/update/:id").put(protect, Authorization(["admin"]), updateSubCategory)
subCategoryRoutes.route("/delete/:id").delete(protect, Authorization(["admin"]), deleteSubCategory)

module.exports = { subCategoryRoutes };
