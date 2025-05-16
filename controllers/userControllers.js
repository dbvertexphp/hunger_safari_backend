const ErrorHandler = require("../utils/errorHandler.js");
const http = require("https");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const baseURL = process.env.BASE_URL;
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const cookie = require("cookie");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const upload = require("../middleware/uploadMiddleware.js");
const fs = require("fs");
const path = require('path');
const sendEmail = require("../utils/emailSender");
const argon2 = require("argon2");
const { generateToken, blacklistToken } = require("../config/generateToken.js");
const { User, NotificationMessages, AdminDashboard, WebNotification } = require("../models/userModel.js");
const Order = require("../models/Order")

function generateOTP() {
	const min = 1000; // Minimum 4-digit number
	const max = 9999; // Maximum 4-digit number
  
	// Generate a random number between min and max (inclusive)
	const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  
	return otp.toString(); // Convert the number to a string
  }

  //   function sendOTP(name, mobile, otp) {
// 	console.log(name);
// 	console.log(mobile);
  
// 	const options = {
// 	  method: "POST",
// 	  hostname: "control.msg91.com",
// 	  port: null,
// 	  path: `/api/v5/otp?template_id=${process.env.TEMPLATE_ID}&mobile=91${mobile}&authkey=${process.env.MSG91_API_KEY}&realTimeResponse=1`,
// 	  headers: {
// 		"Content-Type": "application/json",
// 	  },
// 	};
  
// 	const req = http.request(options, function (res) {
// 	  const chunks = [];
  
// 	  res.on("data", function (chunk) {
// 		chunks.push(chunk);
// 	  });
  
// 	  res.on("end", function () {
// 		const body = Buffer.concat(chunks);
// 		console.log(body.toString());
// 	  });
// 	});
  
// 	const payload = JSON.stringify({
// 	  name: name,
// 	  OTP: otp,
// 	});
  
// 	req.write(payload);
// 	req.end();
//   }

const registerUser = asyncHandler(async (req, res, next) => {
	req.uploadPath = "uploads/profiles";
	upload.single("profile_pic")(req, res, async (err) => {
	  if (err) {
		return next(new ErrorHandler(err.message, 400));
	  }
  
	  const { full_name, email, mobile, password, firebase_token, pin_code } = req.body;
  
	  // Validate required fields (remove role from validation)
	  if (!full_name || !email || !mobile || !password) {
		return next(new ErrorHandler("Please enter all the required fields.", 400));
	  }
  
	  // Check if user already exists
	  const mobileExists = await User.findOne({ mobile });
	  if (mobileExists) {
		return next(new ErrorHandler("User with this mobile number already exists.", 400));
	  }
  
	  const emailExists = await User.findOne({ email });
	  if (emailExists) {
		return next(new ErrorHandler("User with this Email already exists.", 400));
	  }
  
	  // Check if this is the first user
	  const userCount = await User.countDocuments();
	  const role = userCount === 0 ? "admin" : "user";
  
	  // Generate OTP
	  const otp = generateOTP();
  
	  // Handle profile picture
	  const profile_pic = req.file ? `${req.uploadPath}/${req.file.filename}` : null;
  
	  const user = await User.create({
		full_name,
		email,
		mobile,
		role,
		password,
		otp,
		firebase_token,
		pin_code,
		profile_pic,
	  });
  
	  if (user) {
		// Send welcome email (async)
		// setImmediate(async () => {
		//   try {
		// 	await sendEmail(
		// 	  email,
		// 	  "Welcome to Our Service!",
		// 	  `Hello ${full_name},\n\nThank you for registering. Your OTP is: ${otp}`
		// 	);
		//   } catch (error) {
		// 	console.error("Failed to send email:", error);
		//   }
		// });
  
		// try {
		//   const adminDashboard = await AdminDashboard.findOne();
		//   if (adminDashboard) {
		// 	adminDashboard.user_count++;
		// 	await adminDashboard.save();
		//   } else {
		// 	console.error("AdminDashboard not found");
		//   }
		// } catch (error) {
		//   console.error("Failed to update admin dashboard:", error);
		// }
  
		res.status(201).json({
		  _id: user._id,
		  full_name: user.full_name,
		  email: user.email,
		  mobile: user.mobile,
		  role: user.role,
		  otp_verified: user.otp_verified,
		  otp: user.otp,
		  firebase_token,
		  pin_code,
		  profile_pic: user.profile_pic,
		  token: generateToken(user._id),
		  status: true,
		});
	  } else {
		return next(new ErrorHandler("User registration failed.", 400));
	  }
	});
  });
  



//   const loginUser = asyncHandler(async (req, res, next) => {
// 	const { email, mobile, password, firebase_token } = req.body;
  
// 	// Ensure that either email or mobile and password are provided
// 	if ((!email && !mobile) || !password) {
// 	  return next(new ErrorHandler("Email or Mobile and Password are required.", 400));
// 	}
  
// 	// Find the user by email or mobile
// 	const user = await User.findOne({
// 	  $or: [{ email: email || null }, { mobile: mobile || null }],
// 	});
  
// 	if (!user) {
// 	  return next(new ErrorHandler("Invalid email or mobile number.", 401));
// 	}
  
// 	// Check if the password matches
// 	const isMatch = await user.matchPassword(password);
// 	if (!isMatch) {
// 	  return next(new ErrorHandler("Invalid password.", 401));
// 	}
  
// 	// Handle OTP verification if not verified
// 	if (user.otp_verified === 0) {
// 	  const otp = generateOTP();
// 	  await User.updateOne({ _id: user._id }, { $set: { otp } });
  
// 	  return res.status(400).json({
// 		otp,
// 		message: "OTP not verified.",
// 		status: false,
// 	  });
// 	}
  
// 	// Save the firebase_token if provided (to track devices)
// 	if (firebase_token) {
// 	  user.firebase_token = firebase_token;
// 	}
  
// 	// Generate a new JWT token for the session
// 	const token = generateToken(user._id, user.role);
  
// 	// Invalidate the previous session (single login functionality)
// 	user.current_token = token;
// 	await user.save();
  
// 	// Optionally, set the token as a cookie for the client
// 	res.setHeader(
// 	  "Set-Cookie",
// 	  cookie.serialize("Websitetoken", token, {
// 		httpOnly: true,
// 		path: "/",
// 		maxAge: 30 * 24 * 60 * 60, // Token expires after 30 days
// 	  })
// 	);
  
// 	// Create a user data object to return
// 	const userData = {
// 	  _id: user._id,
// 	  full_name: user.full_name,
// 	  email: user.email,
// 	  mobile: user.mobile,
// 	  role: user.role,
// 	  profile_pic: user.profile_pic || null,
// 	  token, // The new token to use for subsequent requests
// 	};
  
// 	// Send the response with the user data and token
// 	res.status(200).json({
// 	  user: userData,
// 	  status: true,
// 	});
//   });
  
  

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, mobile, password, firebase_token } = req.body;

  // Ensure that either email or mobile and password are provided
  if ((!email && !mobile) || !password) {
    return next(new ErrorHandler("Email or Mobile and Password are required.", 400));
  }

  // Find the user by email or mobile
  const user = await User.findOne({
    $or: [{ email: email || null }, { mobile: mobile || null }],
  });

  if (!user) {
    return next(new ErrorHandler("Invalid email or mobile number.", 401));
  }

  // Check if user is active (skip check for admin and subAdmin)
  if (user.role !== 'admin' && !user.active) {
    return next(new ErrorHandler("Admin has disabled your account. Please contact admin.", 403));
  }

  // Check if the password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid password.", 401));
  }

  // Skip OTP verification if role is 'admin' or 'subAdmin'
  if (user.role !== 'admin' && user.role !== 'subAdmin' && user.otp_verified === 0) {
    const otp = generateOTP();
    await User.updateOne({ _id: user._id }, { $set: { otp } });

    return res.status(400).json({
      otp,
      message: "OTP not verified.",
      status: false,
    });
  }

  // Save the firebase_token if provided (to track devices)
  if (firebase_token) {
    user.firebase_token = firebase_token;
  }

  // Generate a new JWT token for the session
  const token = generateToken(user._id, user.role);

  // Invalidate the previous session (single login functionality)
  user.current_token = token;
  await user.save();

  // Optionally, set the token as a cookie for the client
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("Websitetoken", token, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // Token expires after 30 days
    })
  );

  // Create a user data object to return
  const userData = {
    _id: user._id,
    full_name: user.full_name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    profile_pic: user.profile_pic || null,
    token,
  };

  // Send the response with the user data and token
  res.status(200).json({
    user: userData,
    status: true,
  });
});

  

  const verifyOtp = asyncHandler(async (req, res) => {
	const { mobile, email, otp } = req.body;
  
	try {
	  if (!otp || (!mobile && !email)) {
		throw new ErrorHandler("OTP and either mobile or email are required.", 400);
	  }
  
	  // Find user by either mobile or email
	  const user = await User.findOne({
		$or: [{ mobile: mobile || null }, { email: email || null }],
	  });
  
	  if (!user) {
		throw new ErrorHandler("User not found.", 400);
	  }
  
	  if (user.otp_verified) {
		throw new ErrorHandler("User is already OTP verified.", 400);
	  }
  
	  if (user.otp !== otp) {
		throw new ErrorHandler("Invalid OTP.", 400);
	  }
  
	  // Mark user as verified
	  const result = await User.updateOne(
		{ _id: user._id },
		{
		  $set: {
			otp_verified: 1,
		  },
		}
	  );
  
	  const updatedUser = await User.findById(user._id);
  
	  const authToken = jwt.sign(
		{ _id: updatedUser._id, role: updatedUser.role },
		process.env.JWT_SECRET
	  );
  
	  res.status(200).json({
		user: updatedUser,
		token: authToken,
		status: true,
		message: "OTP verified successfully.",
	  });
	} catch (error) {
	  throw new ErrorHandler(error.message || "OTP verification failed.", 500);
	}
  });


  const resendOTP = asyncHandler(async (req, res) => {
	const { mobile, email } = req.body;
  
	if (!mobile && !email) {
	  throw new ErrorHandler("Please provide either mobile or email.", 400);
	}
  
	// Find the user by mobile or email
	const user = await User.findOne({
	  $or: [{ mobile: mobile || null }, { email: email || null }],
	});
  
	if (!user) {
	  throw new ErrorHandler("User not found.", 400);
	}
  
	// Generate a new OTP
	const newOTP = generateOTP();
  
	// Update user's OTP
	await User.updateOne({ _id: user._id }, { $set: { otp: newOTP } });
  
	// Send the new OTP to the user's email
	const sendEmailAsync = async () => {
		const subject = "Your OTP has been Sent";
		const text = `Hello ${user.full_name},\n\nYour new OTP for verification is: ${newOTP}`;
	
		try {
		  await sendEmail(user.email, subject, text); // Send email with new OTP
		} catch (error) {
		  console.error("Failed to send OTP email:", error);
		}
	  };
	
	  // Schedule the email to be sent
	  // setImmediate(sendEmailAsync);
  
	res.status(200).json({
	  message: "New OTP sent successfully.",
	  newOTP, // ⚠️ In production, avoid sending OTP in response
	  status: true,
	});
  });

  const ForgetresendOTP = asyncHandler(async (req, res) => {
	const { mobile, email } = req.body;
  
	if (!mobile && !email) {
	  throw new ErrorHandler("Please provide either mobile or email.", 400);
	}
  
	const user = await User.findOne({
	  $or: [{ mobile: mobile || null }, { email: email || null }],
	});
  
	if (!user) {
	  throw new ErrorHandler("User not found.", 400);
	}
  
	const newOTP = generateOTP();
  
	// Send via SMS if mobile is available
	// if (user.mobile) {
	//   try {
	// 	await sendOTP(user.first_name || user.full_name, user.mobile, newOTP);
	//   } catch (err) {
	// 	console.error("SMS sending failed:", err);
	//   }
	// }
  
	// Send via Email if email is available
	// if (user.email) {
	//   try {
	// 	const subject = "Password Reset OTP";
	// 	const text = `Hello ${user.first_name || user.full_name},\n\nYour OTP for password reset is: ${newOTP}`;
	// 	await sendEmail(user.email, subject, text);
	//   } catch (err) {
	// 	console.error("Email sending failed:", err);
	//   }
	// }
  
	await User.updateOne({ _id: user._id }, { $set: { otp: newOTP } });
  
	res.status(200).json({
	  message: "OTP sent successfully.",
	  otp: newOTP, // ⚠️ Remove in production
	  status: true,
	});
  });
  
  const forgetPassword = asyncHandler(async (req, res) => {
	const { newPassword, mobile, email, otp } = req.body;
  
	if (!newPassword || !otp || (!mobile && !email)) {
	  return res.status(400).json({
		message: "Please enter all the required fields.",
		status: false,
	  });
	}
  
	// Find the user by email or mobile
	const user = await User.findOne({
	  $or: [{ mobile: mobile || null }, { email: email || null }],
	});
  
	if (!user) {
	  return res.status(404).json({
		message: "User not found.",
		status: false,
	  });
	}
  
	if (user.otp !== otp) {
	  return res.status(400).json({
		message: "Invalid OTP.",
		status: false,
	  });
	}
  
	// Hash the new password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(newPassword, salt);
  
	const result = await User.updateOne(
	  { _id: user._id },
	  { $set: { password: hashedPassword } }
	);
  
	if (result.modifiedCount === 1 || result.nModified === 1) {
	  // Optional: clear the OTP after use
	  await User.updateOne({ _id: user._id }, { $unset: { otp: "" } });
  
	  // Notify user via email if available
	  if (user.email) {
		// const sendEmailAsync = async () => {
		//   const subject = "Password Reset Successful!";
		//   const text = `Hello ${user.full_name || "User"},\n\nYour password has been successfully reset. You can now log in with your new password.\n\nIf you did not request this change, please contact our support team immediately.`;
  
		//   try {
		// 	await sendEmail(user.email, subject, text);
		//   } catch (error) {
		// 	console.error("Failed to send password reset email:", error);
		//   }
		// };
  
		// setImmediate(sendEmailAsync);
	  }
  
	  return res.status(200).json({
		message: "Password reset successfully.",
		status: true,
	  });
	} else {
	  return res.status(500).json({
		message: "Password reset failed.",
		status: false,
	  });
	}
  });
  
  const ChangePassword = asyncHandler(async (req, res, next) => {
	const userId = req.headers.userID; // Assuming you have user authentication middleware
	const { oldPassword, newPassword, confirmPassword } = req.body;
  
	if (!oldPassword || !newPassword || !confirmPassword || !userId) {
	  return next(new ErrorHandler("Please enter all the required fields.", 400));
	}
  
	if (newPassword !== confirmPassword) {
	  return next(new ErrorHandler("New password and confirm password do not match.", 400));
	}
  
	// Find the user by _id
	const user = await User.findById(userId);
  
	if (!user) {
	  return next(new ErrorHandler("User Not Found.", 404));
	}
  
	// Check if the old password is correct
	const isMatch = await bcrypt.compare(oldPassword, user.password);
	if (!isMatch) {
	  return next(new ErrorHandler("Old password is incorrect.", 400));
	}
  
	// Hash the new password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(newPassword, salt);
  
	// Update the password in MongoDB
	try {
	  const result = await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
  
	  // Regenerate token after password change
	  const newToken = generateToken(user._id, user.role); // Ensure generateToken is available to create a new token
  
	  // Invalidate old token (or mark it as blacklisted if you are maintaining a blacklist)
  
	  // Update current_token with new token
	  user.current_token = newToken;
	  await user.save();
  
	  // Fetch the updated user
	  const updatedUser = await User.findById(user._id);
  
	//   // Send email asynchronously to notify user of password change
	//   const sendEmailAsync = async () => {
	// 	const subject = "Password changed successfully!";
	// 	const text = `Hello ${updatedUser.full_name},\n\nYour password has been successfully changed. You can now log in with your new password.\n\nIf you did not request this change, please contact our support team immediately.\n\nThank you!`;
  
	// 	try {
	// 	  await sendEmail(updatedUser.email, subject, text); // Send email after user registration
	// 	} catch (error) {
	// 	  console.error("Failed to send email notification:", error);
	// 	}
	//   };
  
	//   // Schedule the email to be sent
	//   setImmediate(sendEmailAsync);
  
	  // Return response with the new token
	  res.status(200).json({
		message: "Password changed successfully.",
		updatedUser,
		token: newToken,  // Send new token as part of the response
		status: true,
	  });
	} catch (error) {
	  return next(new ErrorHandler("Failed to update password in MongoDB.", 500));
	}
  });
  
  const logoutUser = asyncHandler(async (req, res) => {
	const authHeader = req.headers.authorization;
	const userId = req.headers.userID;
  
	if (authHeader) {
	  const token = authHeader.split(" ")[1]; // Extract token from "Bearer {token}"
  
	  // Blacklist the token if you're maintaining a blacklist
	  blacklistToken(token);
  
	  // Expire the cookie immediately
	  res.setHeader(
		"Set-Cookie",
		cookie.serialize("Websitetoken", "", {
		  httpOnly: true,  // Ensure the cookie is not accessible via JavaScript
		  expires: new Date(0),
		  path: "/",
		})
	  );
  
	  // Also update the user document to clear the current_token field
	  await User.updateOne({ _id: userId }, { $unset: { current_token: "" } });
  
	  return res.status(200).json({
		message: "Logout successful",
		status: true,
	  });
	} else {
	  return res.status(200).json({
		message: "Invalid token",
		status: false,
	  });
	}
  });
  
  const updateProfile = asyncHandler(async (req, res, next) => {
	req.uploadPath = "uploads/profiles";
	upload.single("profile_pic")(req, res, async (err) => {
	  if (err) {
		return next(new ErrorHandler(err.message, 400));
	  }
  
	  const { full_name, email, mobile, pin_code } = req.body;
	  const userId = req.headers.userID; // Assuming userID is in headers
  
	  // Validate required fields
	  if (!full_name || !email || !mobile) {
		return next(new ErrorHandler("Please enter all the required fields.", 400));
	  }
  
	  // Find the user by ID
	  const user = await User.findById(userId);
	  if (!user) {
		return next(new ErrorHandler("User not found.", 404));
	  }
  
	  // Check if mobile or email already exists for other users
	  const mobileExists = await User.findOne({ mobile, _id: { $ne: userId } });
	  if (mobileExists) {
		return next(new ErrorHandler("User with this mobile number already exists.", 400));
	  }
  
	  const emailExists = await User.findOne({ email, _id: { $ne: userId } });
	  if (emailExists) {
		return next(new ErrorHandler("User with this email already exists.", 400));
	  }
  
	  // Handle profile picture upload
	  let profile_pic = user.profile_pic;
  
	  // If a new profile picture is provided, delete the old one from the filesystem
	  if (req.file) {
		// Delete the old profile picture if it exists
		if (profile_pic) {
		  const oldProfilePicPath = path.join(__dirname, `../${profile_pic}`);
		  if (fs.existsSync(oldProfilePicPath)) {
			fs.unlinkSync(oldProfilePicPath); // Remove old file from the server
		  }
		}
  
		// Assign the new profile picture path
		profile_pic = `${req.uploadPath}/${req.file.filename}`;
	  }
  
	  // Update user profile
	  const updatedUser = await User.findByIdAndUpdate(
		userId,
		{
		  full_name,
		  email,
		  mobile,
		  pin_code,
		  profile_pic,
		},
		{ new: true } // To return the updated document
	  );
  
	  if (!updatedUser) {
		return next(new ErrorHandler("Failed to update profile.", 400));
	  }
  
	  res.status(200).json({
		_id: updatedUser._id,
		full_name: updatedUser.full_name,
		email: updatedUser.email,
		mobile: updatedUser.mobile,
		role: updatedUser.role,
		profile_pic: updatedUser.profile_pic,
		status: true,
	  });
	});
  });

  const getOrderHistory = asyncHandler(async (req, res) => {
	const user_id = req.headers.userID;;
  
	// Fetch all orders for the user
	const orders = await Order.find({ user_id }).populate('items.menuItem_id');
  
	if (!orders || orders.length === 0) {
	  return res.status(404).json({ message: "No orders found" });
	}
  
	// Return orders with some user-friendly details
	res.status(200).json({
	  success: true,
	  orders,
	});
  });
  
//   const createSubAdmin = async (req, res) => {
// 	try {
// 	  const { full_name, email, mobile, password, restaurant_id } = req.body;
  
// 	  const subAdmin = await User.create({
// 		full_name,
// 		email,
// 		mobile,
// 		password,
// 		plain_password: password,  // Save plain password
// 		role: 'subAdmin',
// 		restaurant_id,
// 	  });
  
// 	  res.status(201).json({
// 		success: true,
// 		subAdmin,
// 	  });
// 	} catch (error) {
// 	  res.status(500).json({ success: false, message: error.message });
// 	}
//   };

const createSubAdmin = async (req, res) => {
  try {
    const { full_name, email, mobile, password, restaurant_id } = req.body;

    // Check for existing email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check for existing mobile
    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    // Create sub-admin
    const subAdmin = await User.create({
      full_name,
      email,
      mobile,
      password,
      plain_password: password,
      role: 'subAdmin',
      restaurant_id,
    });

    res.status(201).json({
      success: true,
      subAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, mobile, restaurant_id } = req.body;

    // Check for duplicate email
    const emailExists = await User.findOne({
      email,
      _id: { $ne: id }, // exclude current user
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another user",
      });
    }

    // Check for duplicate mobile
    const mobileExists = await User.findOne({
      mobile,
      _id: { $ne: id },
    });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already in use by another user",
      });
    }

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        email,
        full_name,
        mobile,
        restaurant_id,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

  const getAllSubAdmins = async (req, res) => {
	try {
	  const subAdmins = await User.find({ role: "subAdmin" }).sort({createdAt: -1})
		.populate("restaurant_id", "name") // only bring restaurant name
		.select("full_name email mobile plain_password restaurant_id"); // bring plain password
  
	  res.status(200).json({
		success: true,
		subAdmins,
	  });
	} catch (error) {
	  res.status(500).json({ success: false, message: error.message });
	}
  };
  
  const deleteSubAdmin = async (req, res) => {
	try {
	  const { id } = req.params; // SubAdmin _id from URL params
  
	  // First, find the user
	  const user = await User.findById(id);
  
	  if (!user) {
		return res.status(404).json({ success: false, message: "SubAdmin not found" });
	  }
  
	  if (user.role !== "subAdmin") {
		return res.status(400).json({ success: false, message: "User is not a subAdmin" });
	  }
  
	  // Delete the SubAdmin
	  await User.deleteOne({ _id: id });
  
	  res.status(200).json({ success: true, message: "SubAdmin deleted successfully" });
	} catch (error) {
	  res.status(500).json({ success: false, message: error.message });
	}
  };
  

  module.exports = {
	registerUser,
	loginUser,
	verifyOtp,
	resendOTP,
	ForgetresendOTP,
	forgetPassword,
	ChangePassword,
	logoutUser,
	updateProfile,
	getOrderHistory,
	createSubAdmin,
	getAllSubAdmins,
	deleteSubAdmin,
	updateSubAdmin
  }
