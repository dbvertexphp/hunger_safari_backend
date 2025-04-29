const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurant");



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // amount in rupees

  const options = {
    amount: amount * 100, // convert to paise
    currency: "INR",
    receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

// Verify Razorpay Payment
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid payment signature" });
  }
});

// const checkoutOrder = asyncHandler(async (req, res) => {
// 	const { shippingAddress, paymentMethod, razorpay_order_id, razorpay_payment_id } = req.body;
// 	const user_id = req.user._id;
  
// 	// Fetch the cart items and populate menuItem_id
// 	const cartItems = await Cart.find({ user_id })
// 	  .populate("items.menuItem_id", "price name") // Populating menuItem_id with price and name
// 	  .exec();
  
// 	if (!cartItems.length) {
// 	  return res.status(400).json({ success: false, message: "Cart is empty!" });
// 	}
  
// 	// Get the restaurant ID from the first cart item (assuming all items belong to the same restaurant)
// 	const restaurant_id = cartItems[0].restaurant_id;
  
// 	// Map cart items to create order items with price, quantity, and menuItem_id
// 	const items = cartItems.flatMap(cartItem =>
// 	  cartItem.items.map(item => ({
// 		menuItem_id: item.menuItem_id._id,
// 		quantity: item.quantity,
// 		price: item.price // Price already exists in the cart item
// 	  }))
// 	);
  
// 	// Calculate the total price based on the items in the cart
// 	const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
  
// 	// Generate a unique order ID
// 	const orderId = "#" + Math.floor(100000 + Math.random() * 900000);
  
// 	// Create a new order document
// 	const order = new Order({
// 	  user_id,
// 	  restaurant_id,
// 	  items,
// 	  shippingAddress,
// 	  totalPrice,
// 	  orderStatus: "Pending",
// 	  orderId,
// 	  paymentMethod,
// 	  paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
// 	  razorpay_order_id: paymentMethod === "Online" ? razorpay_order_id : undefined,
// 	  razorpay_payment_id: paymentMethod === "Online" ? razorpay_payment_id : undefined
// 	});
  
// 	// Save the order
// 	await order.save();
  
// 	// Clear the user's cart after placing the order
// 	await Cart.deleteMany({ user_id });
  
// 	res.status(201).json({
// 	  success: true,
// 	  message: `${paymentMethod} Order placed successfully`,
// 	  order
// 	});
//   });
  
const checkoutOrder = asyncHandler(async (req, res) => {
	const { shippingAddress, paymentMethod, razorpay_order_id, razorpay_payment_id } = req.body;
	const user_id = req.user._id;
  
	// Fetch the cart items and populate menuItem_id
	const cartItems = await Cart.find({ user_id })
	  .populate("items.menuItem_id", "price name") // Populating menuItem_id with price and name
	  .exec();
  
	if (!cartItems.length) {
	  return res.status(400).json({ success: false, message: "Cart is empty!" });
	}
  
	// Get the restaurant ID from the first cart item (assuming all items belong to the same restaurant)
	const restaurant_id = cartItems[0].restaurant_id;
  
	// Fetch the restaurant to get the tax rate
	const restaurant = await Restaurant.findById(restaurant_id).select('tax_rate');
	if (!restaurant) {
	  return res.status(400).json({ success: false, message: "Restaurant not found!" });
	}
  
	// Get the tax rate from the restaurant
	const taxRate = restaurant.tax_rate;
  
	// Map cart items to create order items with price, quantity, and menuItem_id
	const items = cartItems.flatMap(cartItem =>
	  cartItem.items.map(item => ({
		menuItem_id: item.menuItem_id._id,
		quantity: item.quantity,
		price: item.price // Use the existing price from the cart item, which already reflects quantity
	  }))
	);
  
	// Calculate the total price based on the cart item price (already correctly calculated in cart)
	const totalPrice = cartItems.reduce((total, cartItem) => {
	  return total + cartItem.items.reduce((subTotal, item) => subTotal + item.price, 0);
	}, 0);
  
	// Calculate the tax amount using the restaurant's tax rate
	const taxAmount = totalPrice * (taxRate / 100); // Assuming taxRate is in percentage
  
	// Calculate the total amount (price + tax)
	const totalAmount = totalPrice + taxAmount;
  
	// Generate a unique order ID
	const orderId = "#" + Math.floor(100000 + Math.random() * 900000);
  
	// Create a new order document
	const order = new Order({
	  user_id,
	  restaurant_id,
	  items,
	  shippingAddress,
	  totalPrice,
	  taxAmount,
	  totalAmount, // Total amount includes price and tax
	  orderStatus: "Pending",
	  orderId,
	  paymentMethod,
	  paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
	  razorpay_order_id: paymentMethod === "Online" ? razorpay_order_id : undefined,
	  razorpay_payment_id: paymentMethod === "Online" ? razorpay_payment_id : undefined
	});
  
	// Save the order
	await order.save();
  
	// Clear the user's cart after placing the order
	await Cart.deleteMany({ user_id });
  
	res.status(201).json({
	  success: true,
	  message: `${paymentMethod} Order placed successfully`,
	  order
	});
  });
  
  
  

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  checkoutOrder,
};
