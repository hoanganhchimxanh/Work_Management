const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "PROCESSING", "INACTIVE"],
      default: "ACTIVE",
    },

    // Kênh chính của Network (brand account chính)
    mainChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // Tài khoản YouTube chính của network (primary owner)
    primaryAccountEmail: {
      type: String,
      required: true,
    },

    note: { type: String },
  },
  { timestamps: true }
);
