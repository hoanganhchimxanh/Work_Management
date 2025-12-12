// channelAnalytics.model.js
const mongoose = require("mongoose");

const channelAnalyticsSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // Ngày của dữ liệu
    date: { type: Date, required: true },

    // Metrics
    estimatedRevenue: { type: Number, default: 0 },
    totalSubscribers: { type: Number, default: 0 },
    subscribersGained: { type: Number, default: 0 },
    subscribersLost: { type: Number, default: 0 },

    // Chi tiết hơn nếu cần
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Metadata
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index để query nhanh
channelAnalyticsSchema.index({ channel: 1, date: -1 });

module.exports = mongoose.model("ChannelAnalytics", channelAnalyticsSchema);
