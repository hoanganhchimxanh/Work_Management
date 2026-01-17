const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    // Thông tin liên hệ
    phoneNumber: { type: String, required: true },
    facebookLink: { type: String, default: null },

    // Thông tin ngân hàng
    bankInfo: {
      bankName: { type: String, default: null },
      accountNumber: { type: String, default: null },
    },

    role: {
      type: String,
      enum: ["ADMIN", "ACCOUNTANT", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "QUIT"],
      default: "ACTIVE",
    },

    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },

    // Ngày vào làm
    joinDate: { type: Date, default: null },

    // Nhiệm vụ/Mảng
    responsibilities: { type: String, default: null },

    // Ghi chú
    note: { type: String, default: null },

    isFirstLogin: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
