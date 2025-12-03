const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "PROCESSING", "INACTIVE"],
      default: "ACTIVE",
    },

    linkedAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    mainChannel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },

    monthRevenue: { type: Number, default: 0 },

    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Network", networkSchema);
