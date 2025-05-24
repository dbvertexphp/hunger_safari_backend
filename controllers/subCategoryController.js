const asyncHandler = require("express-async-handler");
const SubCategory = require("../models/SubCategory");
const { User } = require("../models/userModel.js");
const MenuItem = require("../models/MenuItem");
const upload = require("../middleware/uploadMiddleware.js");
const fs = require("fs");
const path = require("path");

// 📌 Add SubCategory
// const addSubCategory = asyncHandler(async (req, res, next) => {
//   req.uploadPath = "uploads/subcategory";

//   upload.single("image")(req, res, async (err) => {
//     if (err) {
//       return next(new ErrorHandler(err.message, 400));
//     }

//     try {
//       const { name, restaurant_id } = req.body;
//       const image = req.file ? `${req.uploadPath}/${req.file.filename}` : null;

//       const newSubCategory = new SubCategory({
//         name,
//         restaurant_id,
//         image,
//       });

//       await newSubCategory.save();

//       res.status(201).json({ message: "SubCategory added successfully", subCategory: newSubCategory });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   });
// });

const addSubCategory = asyncHandler(async (req, res, next) => {
  req.uploadPath = "uploads/subcategory";

  upload.single("image")(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message, 400));
    }

    try {
      const { name, restaurant_id } = req.body;
      const trimmedName = name?.trim();

      // Normalize: remove spaces and convert to lowercase
      const normalized = trimmedName.replace(/\s+/g, '').toLowerCase();

      // Block if name is some form of "and"
      if (normalized === "and") {
        return res.status(400).json({ message: "Invalid subcategory name." });
      }

      // Check for existing subcategory with same name and restaurant
      const existing = await SubCategory.findOne({ 
        name: new RegExp(`^${trimmedName}$`, 'i'), // case-insensitive exact match
        restaurant_id 
      });

      if (existing) {
        return res.status(400).json({ message: "SubCategory with this name already exists for this restaurant." });
      }

      const image = req.file ? `${req.uploadPath}/${req.file.filename}` : null;

      const newSubCategory = new SubCategory({
        name: trimmedName,
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
  const user_id = req.headers.userID;

  // Find the user
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Ensure the user has a restaurant_id
  if (!user.restaurant_id) {
    return res.status(400).json({ message: "User is not associated with a restaurant" });
  }

  // Fetch subcategories for the restaurant and include related menu items
  const subCategories = await SubCategory.aggregate([
    {
      $match: {
        restaurant_id: user.restaurant_id
      }
    },
    {
      $lookup: {
        from: "menuitems", // actual collection name in MongoDB
        localField: "_id",
        foreignField: "subCategory_id",
        as: "menuItems"
      }
    }
  ]).sort({createdAt : -1});;

  res.status(200).json(subCategories);
});

const getSubCategoriesSubAdmin = asyncHandler(async (req, res) => {
  const user_id = req.headers.userID;

  // Find the user
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Ensure the user has a restaurant_id
  if (!user.restaurant_id) {
    return res.status(400).json({ message: "User is not associated with a restaurant" });
  }

  // Fetch subcategories for the restaurant and include related menu items
  const subCategories = await SubCategory.aggregate([
    {
      $match: {
        restaurant_id: user.restaurant_id
      }
    },
  ]).sort({createdAt : -1});

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

// // 📌 Delete SubCategory
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


// 📌 Delete SubCategory
// const deleteSubCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const subCategory = await SubCategory.findById(id);

//   if (!subCategory) {
//     return res.status(404).json({ message: "SubCategory not found" });
//   }

//   // 🧹 Delete image from server
//   if (subCategory.image && fs.existsSync(subCategory.image)) {
//     fs.unlinkSync(subCategory.image);
//   }

//   // 🧹 Delete related MenuItems
//   await MenuItem.deleteMany({ subcategory_id: subCategory._id });

//   // 🗑️ Delete the SubCategory itself
//   await subCategory.deleteOne();

//   res.status(200).json({ message: "SubCategory and related MenuItems deleted successfully" });
// });

module.exports = {
  addSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
	getUnassignedSubCategories,
	getSubCategoriesSubAdmin
};
