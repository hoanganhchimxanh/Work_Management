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

    // Email công ty quản lý channel này
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
      required: true,
      unique: true,
    },

    network: { type: mongoose.Schema.Types.ObjectId, ref: "Network" },

    subscriber: { type: Number, default: 0 },
    monthRevenue: { type: Number, default: 0 },
    bktDay: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
