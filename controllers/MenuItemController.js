const asyncHandler = require("express-async-handler");
const upload = require("../middleware/uploadMiddleware.js");
const MenuItem = require("../models/MenuItem");
const fs = require("fs");

// 📌 Add Menu Item
const addMenuItem = asyncHandler(async (req, res, next) => {
  req.uploadPath = "uploads/menuitems";

  upload.single("image")(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message, 400));
    }

    try {
      const { name, subCategory_id, description, price } = req.body;
      const image = req.file ? `${req.uploadPath}/${req.file.filename}` : null;

      const newMenuItem = new MenuItem({
        name,
        subCategory_id,
        description,
        price,
        image,
      });

      await newMenuItem.save();

      res.status(201).json({ message: "Menu Item added successfully", menuItem: newMenuItem });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// 📌 Get All Menu Items
const getAllMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find().populate("subCategory_id", "name");
  res.status(200).json(menuItems);
});

// 📌 Get Menu Item by ID
const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await MenuItem.findById(id).populate("subCategory_id", "name");

  if (!menuItem) {
    return res.status(404).json({ message: "Menu Item not found" });
  }

  res.status(200).json(menuItem);
});

// 📌 Update Menu Item
const updateMenuItem = asyncHandler(async (req, res, next) => {
  req.uploadPath = "uploads/menuitems";

  upload.single("image")(req, res, async (err) => {
    if (err) {
      return next(new ErrorHandler(err.message, 400));
    }

    try {
      const { id } = req.params;
      const { name, subCategory_id, description, price } = req.body;
      const menuItem = await MenuItem.findById(id);

      if (!menuItem) {
        return res.status(404).json({ message: "Menu Item not found" });
      }

      // 🧹 Delete old image if new image uploaded
      let imagePath = menuItem.image;
      if (req.file) {
        if (menuItem.image && fs.existsSync(menuItem.image)) {
          fs.unlinkSync(menuItem.image);
        }
        imagePath = `${req.uploadPath}/${req.file.filename}`;
      }

      menuItem.name = name || menuItem.name;
      menuItem.subCategory_id = subCategory_id || menuItem.subCategory_id;
      menuItem.description = description || menuItem.description;
      menuItem.price = price || menuItem.price;
      menuItem.image = imagePath;

      await menuItem.save();

      res.status(200).json({ message: "Menu Item updated successfully", menuItem });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// 📌 Delete Menu Item
const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await MenuItem.findById(id);

  if (!menuItem) {
    return res.status(404).json({ message: "Menu Item not found" });
  }

  // 🧹 Delete image from server
  if (menuItem.image && fs.existsSync(menuItem.image)) {
    fs.unlinkSync(menuItem.image);
  }

  await menuItem.deleteOne();

  res.status(200).json({ message: "Menu Item deleted successfully" });
});

module.exports = {
  addMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
