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
    isMainChannel: { type: Boolean, default: false },
    isBrandAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
