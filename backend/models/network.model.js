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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: [
        "ACTIVE", // Hoạt động bình thường
        "STRIKE", // Bị gậy / vi phạm
        "DEMONETIZED", // Tắt kiếm tiền (TKT)
        "DEAD", // Die / account chết
      ],
      default: "ACTIVE",
    },

    // Note
    note: {
      type: String,
      enum: [
        "PENDING_ACTIVATION", // Chờ active
        "REJECTED", // Từ chối
        "PENDING_IDENTITY_VERIFICATION", // Chờ XMDT
        "IDENTITY_VERIFICATION_REVIEW", // XMDT chờ duyệt
        "PENDING_32", // Chờ 32 (mã nội bộ)
        "PENDING_PIN", // Chờ PIN
        "ACTIVATED", // Active
      ],
      default: "PENDING_ACTIVATION",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Network", networkSchema);
