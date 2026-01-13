const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema(
  {
    // PUB-ID
    pubId: {
      type: String,
      unique: true,
    },

    // Employment (thay cho assignedUser)
    employment: {
      type: String,
      default: "",
    },

    // Reminder (admin reminder)
    reminderDate: {
      type: Date,
      default: null,
    },

    // Profile AdSense ID
    profileAdsenseId: {
      type: String,
      unique: true,
    },

    // Email đăng nhập AdSense
    emailAddress: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // Password
    password: {
      type: String,
    },

    // Recovery Email
    recoveryEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // 2FA
    twoFA: {
      type: Boolean,
      default: false,
    },

    // Ngày tạo profile AdSense
    creationDate: {
      type: Date,
      default: null,
    },

    // Tax Form (thay cho taxName)
    taxForm: {
      type: String,
      default: "",
    },

    // Location
    location: {
      type: String,
      enum: ["HOME", "OFFICE", "OTHER"],
      default: "OFFICE",
    },

    // Linked Channel
    linkedChannelUrl: {
      type: String,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: ["ACTIVE", "PROCESSING", "INACTIVE", "LOCKED"],
      default: "ACTIVE",
    },

    // Note
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Network", networkSchema);
