// youtubeAuth.model.js
const mongoose = require("mongoose");

const youtubeAuthSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // OAuth tokens từ Google
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },

    // Scope được cấp phép
    scopes: [{ type: String }],

    // Token expiry
    expiresAt: { type: Date, required: true },

    // YouTube channel ID (từ API)
    youtubeChannelId: { type: String },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "REVOKED"],
      default: "ACTIVE",
    },

    // Lần cuối sync data
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

youtubeAuthSchema.index({ user: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model("YoutubeAuth", youtubeAuthSchema);
