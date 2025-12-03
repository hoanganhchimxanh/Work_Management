const express = require("express");
const morgan = require("morgan");
const httpErrors = require("http-errors");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Express web server
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Routes ---
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to ExpressJS server" });
});

// --- Xử lý lỗi ---

// 1. Lỗi 404 (Route không tồn tại)
app.use((req, res, next) => {
  next(httpErrors.NotFound("This route doesn't exist!"));
});

// 2. Custom Error Handler
app.use(errorHandler);

// --- Server Startup ---
const HOST = process.env.HOST_NAME || "localhost";
const PORT = process.env.PORT || 9999;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}/`);
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
  }
};

startServer();
