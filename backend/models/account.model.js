const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    // Đây là email công ty cấp – dùng để LOGIN + QUẢN LÝ KÊNH
    companyEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      sparse: true,
      default: null,
    },

    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
