const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/Restaurant");
const upload = require("../middleware/uploadMiddleware.js");
const { User } = require("../models/userModel.js");
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

const updateRestaurantRating = asyncHandler(async (req, res) => {
	const {restaurant_id, rating, review } = req.body;
	const user_id = req.headers.userID;
	// Find the restaurant
	const restaurant = await Restaurant.findById(restaurant_id);
  
	if (!restaurant) {
	  return res.status(404).json({ message: "Restaurant not found" });
	}
  
	// Check if the user has already reviewed the restaurant
	const existingReview = restaurant.reviews.find(
	  (rev) => String(rev.user_id) === String(user_id)
	);
  
	if (existingReview) {
	  // If a review already exists, update it
	  existingReview.rating = rating;
	  existingReview.review = review;
	  existingReview.createdAt = Date.now();
	} else {
	  // If no review exists, add a new one
	  restaurant.reviews.push({
		user_id,
		rating,
		review,
	  });
	}
  
	// Recalculate the average rating
	const totalRatings = restaurant.reviews.length;
	const sumRatings = restaurant.reviews.reduce((sum, rev) => sum + rev.rating, 0);
	restaurant.ratings = sumRatings / totalRatings;
  
	// Save the updated restaurant
	await restaurant.save();
  
	res.status(200).json({
	  message: "Review and rating updated successfully",
	  restaurant,
	});
  });

  const getRestaurantReviews = asyncHandler(async (req, res) => {
	const { restaurant_id } = req.params;
  
	// Find the restaurant by id and populate the reviews with user data (full_name)
	const restaurant = await Restaurant.findById(restaurant_id)
	  .populate({
		path: 'reviews.user_id',  // Populate the 'user_id' field in reviews with user data
		select: 'full_name', // Only fetch the user's full_name
	  });
  
	if (!restaurant) {
	  return res.status(404).json({ message: "Restaurant not found" });
	}
  
	// Process the reviews to include user names
	const reviewsWithUserNames = restaurant.reviews.map((review) => ({
	  review: review.review,
	  rating: review.rating,
	  createdAt: review.createdAt,
	  userName: review.user_id ? review.user_id.full_name : "Anonymous", // Correct field to 'full_name'
	}));
  
	res.status(200).json({
	  reviews: reviewsWithUserNames,
	});
  });
  
  
  

module.exports = {
  addRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantRating,
  getRestaurantReviews,
};
