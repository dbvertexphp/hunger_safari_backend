const express = require("express");
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

// ****************** Routes ***********************
const { userRoutes } = require("./routes/userRoutes.js");
const { categoryRoutes } = require("./routes/categoryRoutes.js");
const { resturantRoutes } = require("./routes/restaurantRoutes.js");
const { subCategoryRoutes } = require("./routes/subCategoryRoutes.js");
const { menuItemsRoutes } = require("./routes/menuItemRoutes.js");
const { cartRoutes } = require("./routes/cartRoutes.js");
const { favoriteRoutes } = require("./routes/favoriteRoutes.js");
const { paymentRoutes } = require("./routes/paymentRoutes.js");
const { adminRoutes } = require("./routes/adminRoutes.js");

connectDB();
const app = express();
app.use(cookieParser());
const __dirname1 = path.resolve();
app.use(express.static(path.join(__dirname1, "")));
app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static("uploads/category"));
app.use("/uploads", express.static("uploads/fertilizer"));
app.use("/uploads", express.static("uploads/product"));
app.use("/uploads", express.static("uploads/profiles"));
app.use("/uploads", express.static("uploads/subcategory"));
app.use("/uploads", express.static("uploads/tools"));
app.use("/uploads", express.static("uploads/notification"));
app.use(express.json()); // to accept JSON data


const corsOptions = {
	origin: (origin, callback) => {
		callback(null, true);
	},
  };
  
  app.use(cors(corsOptions));


//***********************  Define Routes************************* */
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/resturant", resturantRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/menuItem", menuItemsRoutes);
app.use("/api", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
  // --------------------------deploymentssssss------------------------------

if (process.env.NODE_ENV == "production") {
	app.use(express.static(path.join(__dirname1, "/view")));
  
	app.get("*", (req, res) => res.sendFile(path.resolve(__dirname1, "view", "index.html")));
  } else {
	app.get("/", (req, res) => {
	  res.send("API is running..");
	});
  }
  
  // --------------------------deployment------------------------------
  
  // Error handling middleware
  app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
	  message: err.message || "Internal Server Error",
	  status: false,
	});
  });
  
  // Error Handling middlewares
  app.use(notFound);
  app.use(errorHandler);
  app.use(bodyParser.json({ limit: "100mb" }));
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
  
  const PORT = process.env.PORT;
  const BASE_URL = process.env.BASE_URL;
  
  const server = app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}...`);
	console.log(`Base URL: ${BASE_URL}`);
  });
  
