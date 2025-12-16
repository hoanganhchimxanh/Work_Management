const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    link: { type: String },
    youtubeChannelId: { type: String, sparse: true, unique: true },

    status: {
      type: String,
      enum: ["ACTIVE", "HIDDEN", "LOCKED", "STRIKED"],
      default: "ACTIVE",
    },

    // Network mà kênh này thuộc về
    network: { type: mongoose.Schema.Types.ObjectId, ref: "Network" },

    // User được gán quản lý kênh này trong hệ thống nội bộ
    // (Không phải chủ sở hữu thực tế trên YouTube)
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isMainChannel: { type: Boolean, default: false },
    isBrandAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
