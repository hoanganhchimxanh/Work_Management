const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    link: { type: String },

    status: {
      type: String,
      enum: ["ACTIVE", "HIDDEN", "LOCKED", "STRIKED"],
      default: "ACTIVE",
    },

    // Email/tài khoản YouTube được gắn vào kênh (do Admin gửi riêng)
    channelEmail: {
      type: String,
      required: true,
      unique: true,
    },

    // Password của tài khoản kênh (tùy chọn, có thể Admin giữ riêng)
    channelPassword: { type: String },

    // Network mà kênh này thuộc về
    network: { type: mongoose.Schema.Types.ObjectId, ref: "Network" },

    // User quản lý kênh này
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    subscriber: { type: Number, default: 0 },

    bktEnabled: { type: Boolean, default: false },
    bktDay: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
