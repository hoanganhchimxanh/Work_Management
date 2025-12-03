const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  const timestamp = new Date().toISOString();

  // Tạo object lỗi trả về
  const errorResponse = {
    success: false,
    status: statusCode,
    message: message,
    timestamp: timestamp,
  };

  // Chỉ hiện Stack Trace khi ở môi trường development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // Log lỗi ra console (Server side)
  console.error(
    `[${timestamp}] [ERROR] ${req.method} ${req.originalUrl} - Status: ${statusCode}`
  );
  console.error(err.stack || message);

  // Trả về cho Client
  res.status(statusCode).json({
    error: errorResponse,
  });
};

module.exports = errorHandler;
