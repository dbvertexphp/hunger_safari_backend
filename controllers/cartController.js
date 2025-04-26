const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Order = require("../models/Order");


const addToCart = asyncHandler(async (req, res) => {
  const { user_id, restaurant_id, menuItem_id, quantity, price } = req.body;

  let cart = await Cart.findOne({ user_id });

  if (!cart) {
    cart = new Cart({
      user_id,
      restaurant_id,
      items: [{ menuItem_id, quantity, price }]
    });
  } else {
    // 🧠 Check if different restaurant
    if (String(cart.restaurant_id) !== String(restaurant_id)) {
      return res.status(400).json({ message: "You can order from only one restaurant at a time." });
    }
    // 🧹 Check if item already exists
    const existingItem = cart.items.find(item => String(item.menuItem_id) === String(menuItem_id));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ menuItem_id, quantity, price });
    }
  }

  await cart.save();
  res.status(200).json({ message: "Item added to cart", cart });
});

const updateCartQuantity = asyncHandler(async (req, res) => {
	const { user_id, menuItem_id, action } = req.body;
  
	const cart = await Cart.findOne({ user_id });
  
	if (!cart) {
	  return res.status(404).json({ message: "Cart not found" });
	}
  
	const item = cart.items.find(item => String(item.menuItem_id) === String(menuItem_id));
  
	if (!item) {
	  return res.status(404).json({ message: "Item not found in cart" });
	}
  
	if (action === "increase") {
	  item.quantity += 1;
	} else if (action === "decrease") {
	  item.quantity -= 1;
	  if (item.quantity <= 0) {
		// Remove item from cart if quantity is 0
		cart.items = cart.items.filter(i => String(i.menuItem_id) !== String(menuItem_id));
	  }
	} else {
	  return res.status(400).json({ message: "Invalid action" });
	}
  
	await cart.save();
	res.status(200).json({ message: "Cart updated successfully", cart });
  });
  

const viewCart = asyncHandler(async (req, res) => {
	const { user_id } = req.params;
  
	const cart = await Cart.findOne({ user_id }).populate('items.menuItem_id');
  
	if (!cart) {
	  return res.status(404).json({ message: "Cart is empty" });
	}
  
	res.status(200).json(cart);
  });

//   const placeOrder = asyncHandler(async (req, res) => {
// 	const { user_id, shippingAddress } = req.body;
  
// 	const cart = await Cart.findOne({ user_id }).populate('items.menuItem_id');
  
// 	if (!cart || cart.items.length === 0) {
// 	  return res.status(400).json({ message: "Cart is empty" });
// 	}
  
// 	let totalPrice = 0;
// 	cart.items.forEach(item => {
// 	  totalPrice += item.price * item.quantity;
// 	});
  
// 	const order = new Order({
// 	  user_id,
// 	  restaurant_id: cart.restaurant_id,
// 	  items: cart.items.map(item => ({
// 		menuItem_id: item.menuItem_id._id,
// 		quantity: item.quantity,
// 		price: item.price
// 	  })),
// 	  totalPrice,
// 	  shippingAddress
// 	});
  
// 	await order.save();
// 	await cart.deleteOne();
  
// 	res.status(201).json({ message: "Order placed successfully", order });
//   });

  const clearCart = asyncHandler(async (req, res) => {
	const { user_id } = req.params;
  
	const cart = await Cart.findOne({ user_id });
  
	if (!cart) {
	  return res.status(404).json({ message: "No cart found" });
	}
  
	await cart.deleteOne();
	res.status(200).json({ message: "Cart cleared successfully" });
  });



  module.exports = {
	addToCart,
	viewCart,
	// placeOrder,
	clearCart,
	updateCartQuantity
  };
