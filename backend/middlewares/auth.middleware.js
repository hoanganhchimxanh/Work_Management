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

    // ✅ GÁN PAYLOAD VÀO req.user
    req.user = {
      accountId: payload.accountId,
      userId: payload.userId, // ✅ Lấy từ root level của token
      role: payload.role,
      isActive: payload.isActive,
      isFirstLogin: payload.isFirstLogin,
    };

    next();
  } catch (err) {
    // 3. Xử lý lỗi xác thực JWT
    console.error("JWT verification error:", err.message);
    return next(createError(401, err.message || "Token invalid or expired"));
  }
};

// Kiểm tra quyền dựa trên role
const authorizeRoles = (allowedRoles) => {
  // Đảm bảo allowedRoles luôn là array
  if (!Array.isArray(allowedRoles)) {
    allowedRoles = [allowedRoles];
  }

  return (req, res, next) => {
    // Kiểm tra req.user tồn tại
    if (!req.user || !req.user.role) {
      console.error(
        "Authorization failed: req.user không tồn tại hoặc thiếu role"
      );
      return next(createError(401, "Thông tin người dùng không xác định!"));
    }

    const userRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toUpperCase()
    );

    if (normalizedAllowedRoles.includes(userRole)) {
      next();
    } else {
      return next(createError(403, "Không có quyền truy cập tài nguyên này!"));
    }
  };
};

module.exports = { authenticateJWT, authorizeRoles };
