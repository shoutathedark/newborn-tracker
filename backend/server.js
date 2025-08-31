require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const logRoutes = require("./routes/logs");

const app = express();
connectDB();

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL = isProd ? process.env.FRONTEND_PROD : process.env.FRONTEND_DEV;

const corsOptions = {
  origin: FRONTEND_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());


// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later"
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms", logRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
