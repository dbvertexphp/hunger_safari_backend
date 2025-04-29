const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem"); // 📢 You forgot to import MenuItem model earlier!
const Restaurant = require("../models/Restaurant");

// ✅ Add to Cart - Safe (price from DB)
const addToCart = asyncHandler(async (req, res) => {
	const { restaurant_id, menuItem_id, quantity } = req.body;
	const user_id = req.user._id;
	
	// 🧠 Find the menu item first
	const menuItem = await MenuItem.findById(menuItem_id);
  
	if (!menuItem) {
	  return res.status(404).json({ message: "Menu item not found" });
	}
  
	// Calculate price based on the menu item's price and quantity
	const price = menuItem.price * quantity;
  
	let cart = await Cart.findOne({ user_id });
  
	if (!cart) {
	  // If cart doesn't exist, create a new one
	  cart = new Cart({
		user_id,
		restaurant_id,
		items: [{ menuItem_id, quantity, price }],
	  });
	} else {
	  // 🧠 Check if user is trying to add from a different restaurant
	  if (String(cart.restaurant_id) !== String(restaurant_id)) {
		return res
		  .status(400)
		  .json({ message: "You can order from only one restaurant at a time." });
	  }
  
	  // 🧹 Check if item already exists in the cart
	  const existingItem = cart.items.find(
		(item) => String(item.menuItem_id) === String(menuItem_id)
	  );
  
	  if (existingItem) {
		// Update the quantity and recalculate the price
		existingItem.quantity += quantity;
		existingItem.price = menuItem.price * existingItem.quantity;
	  } else {
		// Add new item with the calculated price
		cart.items.push({ menuItem_id, quantity, price });
	  }
	}
  
	// Save the updated cart
	await cart.save();
	res.status(200).json({ message: "Item added to cart successfully", cart });
  });
  

// ✅ Update Cart Quantity
const updateCartQuantity = asyncHandler(async (req, res) => {
	const { menuItem_id, action } = req.body;
	const user_id = req.user._id;
	const cart = await Cart.findOne({ user_id });
  
	if (!cart) {
	  return res.status(404).json({ message: "Cart not found" });
	}
  
	const item = cart.items.find(
	  (item) => String(item.menuItem_id) === String(menuItem_id)
	);
  
	if (!item) {
	  return res.status(404).json({ message: "Item not found in cart" });
	}
  
	// 🧠 Find the menu item to get its price
	const menuItem = await MenuItem.findById(menuItem_id);
  
	if (!menuItem) {
	  return res.status(404).json({ message: "Menu item not found" });
	}
  
	// 🧠 Recalculate price after quantity update
	if (action === "increase") {
	  item.quantity += 1;
	} else if (action === "decrease") {
	  item.quantity -= 1;
	  if (item.quantity <= 0) {
		// Remove item from cart if quantity is 0 or lower
		cart.items = cart.items.filter(
		  (i) => String(i.menuItem_id) !== String(menuItem_id)
		);
	  }
	} else {
	  return res.status(400).json({ message: "Invalid action" });
	}
  
	// Recalculate price based on new quantity
	item.price = menuItem.price * item.quantity;
  
	// Save the updated cart
	await cart.save();
	res.status(200).json({ message: "Cart updated successfully", cart });
  });
  

// ✅ View Cart
// const viewCart = asyncHandler(async (req, res) => {
// 	const user_id = req.user._id;

//   const cart = await Cart.findOne({ user_id }).populate("items.menuItem_id");

//   if (!cart) {
//     return res.status(404).json({ message: "Cart is empty" });
//   }

//   res.status(200).json(cart);
// });


const viewCart = asyncHandler(async (req, res) => {
	const user_id = req.user._id;
  
	// Find the cart and populate menu item details
	const cart = await Cart.findOne({ user_id }).populate("items.menuItem_id");
  
	if (!cart) {
	  return res.status(404).json({ message: "Cart is empty" });
	}
  
	// Fetch the restaurant tax rate
	const restaurant = await Restaurant.findById(cart.restaurant_id);
  
	if (!restaurant) {
	  return res.status(404).json({ message: "Restaurant not found" });
	}
  
	// Initialize subtotal and total variables
	let subtotal = 0;
  
	// Iterate through the items and calculate subtotal for each item
	cart.items.forEach(item => {
	  // Ensure each item has a valid quantity and menu item details
	  if (item.menuItem_id && item.quantity) {
		const itemSubtotal = item.menuItem_id.price * item.quantity; // price * quantity
		item.subtotal = itemSubtotal; // Add subtotal to the item object
		subtotal += itemSubtotal; // Add to total subtotal
	  }
	});
  
	// Calculate the tax based on the restaurant's tax rate
	const taxAmount = (restaurant.tax_rate > 0) ? (subtotal * restaurant.tax_rate) / 100 : 0;
  
	// Calculate total amount (subtotal + tax)
	const totalAmount = subtotal + taxAmount;
  
	// Add subtotal, tax, and total to the response
	res.status(200).json({
	  cart,
	  subtotal,
	  taxAmount,
	  totalAmount,
	});
  });
  
  

// ✅ Clear Cart
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
  updateCartQuantity,
  viewCart,
  clearCart,
};
