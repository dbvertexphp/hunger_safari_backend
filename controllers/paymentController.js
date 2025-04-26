const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // Pass amount from frontend (in Rupees)

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise (1 Rupee = 100 paise)
    currency: "INR",
    receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

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

  const placeCODOrder = asyncHandler(async (req, res) => {
	const { user_id, restaurant_id, items, shippingAddress, totalPrice } = req.body;
  
	const orderId = "#"+ Math.floor(100000 + Math.random() * 900000); // Like #185985
  
	const order = new Order({
	  user_id,
	  restaurant_id,
	  items,
	  shippingAddress,
	  totalPrice,
	  orderStatus: "Pending",
	  orderId: orderId,
	  paymentMethod: "COD",
	  paymentStatus: "Pending",
	});
  
	await order.save();
  
	res.status(201).json({ success: true, message: "COD Order placed successfully", order });
  });


  const placeOnlineOrder = asyncHandler(async (req, res) => {
	const { user_id, restaurant_id, items, shippingAddress, totalPrice, razorpay_order_id, razorpay_payment_id } = req.body;
  
	const orderId = "#"+ Math.floor(100000 + Math.random() * 900000); // Like #185985
  
	const order = new Order({
	  user_id,
	  restaurant_id,
	  items,
	  shippingAddress,
	  totalPrice,
	  orderStatus: "Pending",
	  orderId: orderId,
	  paymentMethod: "Online",
	  paymentStatus: "Paid",
	  razorpay_order_id,
	  razorpay_payment_id,
	});
  
	await order.save();
  
	res.status(201).json({ success: true, message: "Online Order placed successfully", order });
  });
