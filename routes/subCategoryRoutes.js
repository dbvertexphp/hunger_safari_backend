const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const Authorization = require("../middleware/Authorization.middleware.js");
const { addSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory, getUnassignedSubCategories, getSubCategoriesSubAdmin } = require("../controllers/subCategoryController");

const subCategoryRoutes = express.Router();


subCategoryRoutes.route("/add").post(protect, Authorization(["admin", "subAdmin"]), addSubCategory);
subCategoryRoutes.route("/all").get(protect, Authorization(["user", "admin", "subAdmin"]), getAllSubCategories);
subCategoryRoutes.route("/getUnassignedSubCategories").get(protect, Authorization(["admin", "subAdmin"]), getUnassignedSubCategories);
subCategoryRoutes.route("/getSubCategoriesSubAdmin").get(protect, Authorization(["admin", "subAdmin"]), getSubCategoriesSubAdmin)
subCategoryRoutes.route("/:id").get(protect, Authorization(["user", "admin"]), getSubCategoryById);
subCategoryRoutes.route("/update/:id").put(protect, Authorization(["admin", "subAdmin"]), updateSubCategory);
subCategoryRoutes.route("/delete/:id").delete(protect, Authorization(["admin", "subAdmin"]), deleteSubCategory);

module.exports = { subCategoryRoutes };
