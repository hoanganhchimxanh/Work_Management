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

// Express web server
const app = express();
const server = http.createServer(app);

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// --- Routes ---
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to ExpressJS server" });
});

const userRouter = require("./routes/user.route");
const accountRouter = require("./routes/account.route");
const teamRouter = require("./routes/team.route");
const kpiRouter = require("./routes/kpi.route");
const taskRouter = require("./routes/task.route");
const channelRouter = require("./routes/channel.route");
const networkRouter = require("./routes/network.route");
const youtubeAuthRouter = require("./routes/youtubeAuth.route");
const youtubeAnalyticsRouter = require("./routes/youtubeAnalytics.route");
const dashboardRouter = require("./routes/dashboard.route");
const excelRouter = require("./routes/excel.route");
const notificationRouter = require("./routes/notification.route");
const resourceRouter = require("./routes/resource.route");
const bugReportRouter = require("./routes/bugReport.route");

app.use("/user", userRouter);
app.use("/account", accountRouter);
app.use("/team", teamRouter);
app.use("/kpi", kpiRouter);
app.use("/task", taskRouter);
app.use("/channel", channelRouter);
app.use("/network", networkRouter);
app.use("/youtube-auth", youtubeAuthRouter);
app.use("/youtube-analytics", youtubeAnalyticsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/excel", excelRouter);
app.use("/notification", notificationRouter);
app.use("/resource", resourceRouter);
app.use("/bug-report", bugReportRouter);

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

    // Create new admin (if the backend data didn't have)
    await seedAdmin();

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
