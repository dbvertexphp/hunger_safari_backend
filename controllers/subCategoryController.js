const asyncHandler = require("express-async-handler");
const SubCategory = require("../models/SubCategory");
const upload = require("../middleware/uploadMiddleware.js");
const fs = require("fs");
const path = require("path");

// 📌 Add SubCategory
const addSubCategory = asyncHandler(async (req, res, next) => {
  req.uploadPath = "uploads/subcategory";

  upload.single("image")(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message, 400));
    }

    try {
      const { name, restaurant_id } = req.body;
      const image = req.file ? `${req.uploadPath}/${req.file.filename}` : null;

      const newSubCategory = new SubCategory({
        name,
        restaurant_id,
        image,
      });

      await newSubCategory.save();

      res.status(201).json({ message: "SubCategory added successfully", subCategory: newSubCategory });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// 📌 Get All SubCategories
const getAllSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find().populate("restaurant_id", "name");
  res.status(200).json(subCategories);
});

const getUnassignedSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find({
    $or: [
      { restaurant_id: { $exists: false } },
      { restaurant_id: null }
    ]
  });

  res.status(200).json(subCategories);
});

// 📌 Get SubCategory by ID
const getSubCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id).populate("restaurant_id", "name");

  if (!subCategory) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  res.status(200).json(subCategory);
});

// 📌 Update SubCategory
const updateSubCategory = asyncHandler(async (req, res, next) => {
  req.uploadPath = "uploads/subcategory";

  upload.single("image")(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message, 400));
    }

    try {
      const { id } = req.params;
      const { name, restaurant_id } = req.body;
      const subCategory = await SubCategory.findById(id);

      if (!subCategory) {
        return res.status(404).json({ message: "SubCategory not found" });
      }

      // 🧹 Delete old image if new image uploaded
      let imagePath = subCategory.image;
      if (req.file) {
        if (subCategory.image && fs.existsSync(subCategory.image)) {
          fs.unlinkSync(subCategory.image);
        }
        imagePath = `${req.uploadPath}/${req.file.filename}`;
      }

      subCategory.name = name || subCategory.name;
      subCategory.restaurant_id = restaurant_id || subCategory.restaurant_id;
      subCategory.image = imagePath;

      await subCategory.save();

      res.status(200).json({ message: "SubCategory updated successfully", subCategory });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// 📌 Delete SubCategory
const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  // 🧹 Delete image from server
  if (subCategory.image && fs.existsSync(subCategory.image)) {
    fs.unlinkSync(subCategory.image);
  }

  await subCategory.deleteOne();

  res.status(200).json({ message: "SubCategory deleted successfully" });
});

module.exports = {
  addSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
	getUnassignedSubCategories,
};
