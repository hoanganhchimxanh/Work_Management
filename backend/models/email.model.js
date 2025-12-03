const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    // Đây là email công ty cấp – dùng để LOGIN + QUẢN LÝ KÊNH
    companyEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    owner: {
      // user được cấp email này
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Mỗi email này chỉ quản lý 1 kênh
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      unique: true,
      sparse: true,
      default: null,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Email", emailSchema);
