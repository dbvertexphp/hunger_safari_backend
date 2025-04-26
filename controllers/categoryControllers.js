const Category = require('../models/Category');
const upload = require("../middleware/uploadMiddleware.js");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require('path');

  const addCategory = asyncHandler(async (req, res, next) => {
	req.uploadPath = "uploads/category";
  
	upload.single("image")(req, res, async (err) => {
	  if (err) {
		return next(new ErrorHandler(err.message, 400));
	  }
  
	  try {
		const { name } = req.body;
  
		// Save image path in DB
		const imagePath = req.file ? `${req.uploadPath}/${req.file.filename}` : null;
  
		const newCategory = new Category({ 
		  name, 
		  image: imagePath 
		});
  
		await newCategory.save();
  
		// Now when responding, add a full URL for the image
		const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/${imagePath}` : null;
  
		res.status(201).json({
		  _id: newCategory._id,
		  name: newCategory.name,
		  image: imageUrl,  // Full URL here!
		});
  
	  } catch (error) {
		res.status(400).json({ message: error.message });
	  }
	});
  });
  

  const getAllCategories = asyncHandler(async (req, res) => {
	try {
	  const categories = await Category.find().sort({_id : -1});
	  
	  const formattedCategories = categories.map(cat => ({
		_id: cat._id,
		name: cat.name,
		image: cat.image ? `${req.protocol}://${req.get('host')}/${cat.image}` : null,
	  }));
  
	  res.status(200).json(formattedCategories);
	} catch (error) {
	  res.status(500).json({ message: error.message });
	}
  });

  const getCategoryById = asyncHandler(async (req, res) => {
	try {
	  const category = await Category.findById(req.params.id);
  
	  if (!category) {
		return res.status(404).json({ message: "Category not found" });
	  }
  
	  res.status(200).json({
		_id: category._id,
		name: category.name,
		image: category.image ? `${req.protocol}://${req.get('host')}/${category.image}` : null,
	  });
	} catch (error) {
	  res.status(500).json({ message: error.message });
	}
  });


  const updateCategoryById = asyncHandler(async (req, res, next) => {
	req.uploadPath = "uploads/category";
  
	upload.single("image")(req, res, async (err) => {
	  if (err) {
		return next(new ErrorHandler(err.message, 400));
	  }
  
	  try {
		const category = await Category.findById(req.params.id);
  
		if (!category) {
		  return res.status(404).json({ message: "Category not found" });
		}
  
		// Update name if provided
		if (req.body.name) {
		  category.name = req.body.name;
		}
  
		// If new image uploaded
		if (req.file) {
		  // Delete old image
		  if (category.image) {
			const oldImagePath = category.image; // like 'uploads/category/old-image.jpg'
			fs.unlink(oldImagePath, (err) => {
			  if (err) {
				console.error("Failed to delete old image:", err.message);
			  }
			});
		  }
  
		  // Set new image path
		  category.image = `${req.uploadPath}/${req.file.filename}`;
		}
  
		await category.save();
  
		res.status(200).json({
		  _id: category._id,
		  name: category.name,
		  image: category.image ? `${req.protocol}://${req.get('host')}/${category.image}` : null,
		});
	  } catch (error) {
		res.status(500).json({ message: error.message });
	  }
	});
  });
  

  const deleteCategoryById = asyncHandler(async (req, res) => {
	try {
	  const category = await Category.findById(req.params.id);
  
	  if (!category) {
		return res.status(404).json({ message: "Category not found" });
	  }
  
	  // Delete image from server if exists
	  if (category.image) {
		const oldImagePath = category.image; // example: 'uploads/category/abc.jpg'
		const fs = require('fs');
		fs.unlink(oldImagePath, (err) => {
		  if (err) {
			console.error("Failed to delete old image:", err.message);
		  }
		});
	  }
  
	  // Delete category document from MongoDB
	  await category.deleteOne();
  
	  res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
	  res.status(500).json({ message: error.message });
	}
  });
  

  module.exports = {
	addCategory,
	getAllCategories,
	getCategoryById,
	updateCategoryById,
	deleteCategoryById
  }
