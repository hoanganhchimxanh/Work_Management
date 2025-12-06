const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "PROCESSING", "INACTIVE"],
      default: "ACTIVE",
    },

    // Kênh chính của Network
    mainChannel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },

    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Network", networkSchema);
