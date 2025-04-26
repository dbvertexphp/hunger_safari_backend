const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/Restaurant");
const upload = require("../middleware/uploadMiddleware.js");
const fs = require("fs");
const path = require("path");

// 📌 Create Restaurant
// const addRestaurant = asyncHandler(async (req, res, next) => {
//   req.uploadPath = "uploads/restaurant";

//   upload.single("image")(req, res, async (err) => {
//     if (err) {
//       return next(new ErrorHandler(err.message, 400));
//     }

//     try {
//       const { name, category_id, address, details } = req.body;
//       const image = req.file ? `${req.uploadPath}/${req.file.filename}` : null;

//       const newRestaurant = new Restaurant({
//         name,
//         category_id,
//         address,
//         image,
// 		details,
//       });

//       await newRestaurant.save();

//       res.status(201).json({ message: "Restaurant added successfully", restaurant: newRestaurant });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   });
// });

const addRestaurant = asyncHandler(async (req, res, next) => {
	req.uploadPath = "uploads/restaurant";
  
	upload.single("image")(req, res, async (err) => {
	  if (err) {
		return next(new ErrorHandler(err.message, 400));
	  }
  
	  try {
		const { name, category_id, address, details, opening_time, closing_time, rating, locationAddress, latitude, longitude } = req.body;
		const image = req.file ? `${req.uploadPath}/${req.file.filename}` : null;
  
		const restaurantData = {
		  name,
		  category_id,
		  address,
		  details,
		  opening_time,
		  closing_time,
		  rating: rating ? parseFloat(rating) : undefined,
		  image,
		};
  
		// ✅ Safe handling for location
		const lat = parseFloat(latitude);
		const lng = parseFloat(longitude);
		if (!isNaN(lat) && !isNaN(lng)) {
		  restaurantData.location = {
			type: "Point",
			coordinates: [lng, lat],
			address: locationAddress || address,
		  };
		}
  
		const newRestaurant = new Restaurant(restaurantData);
		await newRestaurant.save();
  
		res.status(201).json({ message: "Restaurant added successfully", restaurant: newRestaurant });
	  } catch (error) {
		res.status(400).json({ message: error.message });
	  }
	});
  });
  
  

// 📌 Get All Restaurants
const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().populate("category_id", "name");
  res.status(200).json(restaurants);
});

// 📌 Get Single Restaurant by ID
const getRestaurantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id).populate("category_id", "name");

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  res.status(200).json(restaurant);
});

// 📌 Update Restaurant
// const updateRestaurant = asyncHandler(async (req, res, next) => {
//   req.uploadPath = "uploads/restaurant";

//   upload.single("image")(req, res, async (err) => {
//     if (err) {
//       return next(new ErrorHandler(err.message, 400));
//     }

//     try {
//       const { id } = req.params;
//       const { name, category_id, address } = req.body;
//       const restaurant = await Restaurant.findById(id);

//       if (!restaurant) {
//         return res.status(404).json({ message: "Restaurant not found" });
//       }

//       // 🧹 Delete old image if new image uploaded
//       let imagePath = restaurant.image;
//       if (req.file) {
//         if (restaurant.image && fs.existsSync(restaurant.image)) {
//           fs.unlinkSync(restaurant.image);
//         }
//         imagePath = `${req.uploadPath}/${req.file.filename}`;
//       }

//       restaurant.name = name || restaurant.name;
//       restaurant.category_id = category_id || restaurant.category_id;
//       restaurant.address = address || restaurant.address;
//       restaurant.image = imagePath;

//       await restaurant.save();

//       res.status(200).json({ message: "Restaurant updated successfully", restaurant });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   });
// });

const updateRestaurant = asyncHandler(async (req, res, next) => {
	req.uploadPath = "uploads/restaurant";
  
	upload.single("image")(req, res, async (err) => {
	  if (err) {
		return next(new ErrorHandler(err.message, 400));
	  }
  
	  try {
		const { id } = req.params;
		const { name, category_id, address, details, opening_time, closing_time, rating, locationAddress, latitude, longitude } = req.body;
  
		const restaurant = await Restaurant.findById(id);
  
		if (!restaurant) {
		  return res.status(404).json({ message: "Restaurant not found" });
		}
  
		// 🧹 Delete old image if new image uploaded
		let imagePath = restaurant.image;
		if (req.file) {
		  if (restaurant.image && fs.existsSync(restaurant.image)) {
			fs.unlinkSync(restaurant.image);
		  }
		  imagePath = `${req.uploadPath}/${req.file.filename}`;
		}
  
		restaurant.name = name || restaurant.name;
		restaurant.category_id = category_id || restaurant.category_id;
		restaurant.address = address || restaurant.address;
		restaurant.details = details || restaurant.details;
		restaurant.opening_time = opening_time || restaurant.opening_time;
		restaurant.closing_time = closing_time || restaurant.closing_time;
		restaurant.rating = rating ? parseFloat(rating) : restaurant.rating;
		restaurant.image = imagePath;
  
		// ✅ Only update location if valid latitude and longitude
		const lat = parseFloat(latitude);
		const lng = parseFloat(longitude);
		if (!isNaN(lat) && !isNaN(lng)) {
		  restaurant.location = {
			type: "Point",
			coordinates: [lng, lat],
			address: locationAddress || address || restaurant.address,
		  };
		}
  
		await restaurant.save();
  
		res.status(200).json({ message: "Restaurant updated successfully", restaurant });
	  } catch (error) {
		res.status(400).json({ message: error.message });
	  }
	});
  });
  
  

// 📌 Delete Restaurant
const deleteRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  // 🧹 Delete image from server
  if (restaurant.image && fs.existsSync(restaurant.image)) {
    fs.unlinkSync(restaurant.image);
  }

  await restaurant.deleteOne();

  res.status(200).json({ message: "Restaurant deleted successfully" });
});

module.exports = {
  addRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
