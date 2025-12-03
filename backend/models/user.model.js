const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    // 👇 email cá nhân để nhận thông tin, không dùng login
    secondaryEmail: { type: String, required: true },

    role: {
      type: String,
      enum: ["ADMIN", "CEO", "ACCOUNTANT", "EMPLOYEE"],
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
