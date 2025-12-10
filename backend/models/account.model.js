const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    // Email dùng để đăng nhập vào hệ thống quản lý
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Liên kết đến User sở hữu tài khoản này
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
