const express = require("express");
const http = require("http");
const morgan = require("morgan");
const httpErrors = require("http-errors");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const refreshYoutubeToken = require("./jobs/refreshYoutubeToken");
const syncYoutubeAnalytics = require("./jobs/syncYoutubeAnalytics");
const { initSocket } = require("./socket");
const seedAdmin = require("./seed/admin.seed");
const seedAccountant = require("./seed/accountant.seed");

// Express web server
const app = express();
const server = http.createServer(app);

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Routes ---
const routes = require("./routes");

app.use("/", routes);

// --- Xử lý lỗi ---

// 1. Lỗi 404 (Route không tồn tại)
app.use((req, res, next) => {
  next(httpErrors.NotFound("This route doesn't exist!"));
});

// 2. Custom Error Handler
app.use(errorHandler);

// --- Server Startup ---
const HOST = process.env.HOST_NAME || "0.0.0.0";
const PORT = process.env.PORT || 9999;

const startServer = async () => {
  try {
    await connectDB();

    // Seed default system accounts
    console.log("🌱 Seeding default system accounts...");
    await seedAdmin();
    await seedAccountant();
    console.log("✅ System accounts seeding completed\n");

    refreshYoutubeToken();
    syncYoutubeAnalytics();
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}/`);
      initSocket(server);
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
  }
};

startServer();
