const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    // Email cá nhân để nhận thông tin (không dùng để đăng nhập)
    personalEmail: { type: String, required: true },

    role: {
      type: String,
      enum: ["ADMIN", "ACCOUNTANT", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "QUIT"],
      default: "ACTIVE",
    },

    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },

    isFirstLogin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
