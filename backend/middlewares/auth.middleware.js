const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// Kiểm tra JWT và gắn req.user
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // 1. Kiểm tra Token thiếu
  if (!authHeader) {
    return next(
      createError(401, "Token missing or Authorization header not provided")
    );
  }

  const tokenParts = authHeader.split(" ");
  const token =
    tokenParts.length === 2 && tokenParts[0] === "Bearer"
      ? tokenParts[1]
      : null;

  // 2. Kiểm tra định dạng Token không hợp lệ
  if (!token) {
    return next(
      createError(401, 'Invalid token format. Must be "Bearer <token>"')
    );
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    // 3. Xử lý lỗi xác thực JWT
    return next(createError(401, err.message || "Token invalid or expired"));
  }
};

// Kiểm tra quyền dựa trên role
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(createError(500, "Thông tin người dùng không xác định!"));
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return next(createError(403, "Không có quyền sử dụng, truy cập!"));
    }
  };
};

module.exports = { authenticateJWT, authorizeRoles };
