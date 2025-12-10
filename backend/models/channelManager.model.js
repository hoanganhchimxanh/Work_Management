// channelManager.model.js
const mongoose = require("mongoose");

const channelManagerSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // Email tài khoản quản lý kênh YouTube
    managerEmail: {
      type: String,
      required: true,
    },

    // Vai trò quản lý trên YouTube
    role: {
      type: String,
      enum: ["PRIMARY_OWNER", "OWNER", "MANAGER"],
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// Đảm bảo không trùng email và kênh
channelManagerSchema.index({ channel: 1, managerEmail: 1 }, { unique: true });

module.exports = mongoose.model("ChannelManager", channelManagerSchema);
