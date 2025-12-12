const mongoose = require("mongoose");

const networkSchema = new mongoose.Schema(
  {
    // Thông tin nhân viên quản lý
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Lịch kiểm tra (admin reminder)
    reminderDate: {
      type: Date,
      default: null,
    },

    // Thông tin Profile AdSense
    profileAdsenseId: {
      type: String,
      required: true,
      unique: true, // Mã ID duy nhất
    },

    // Email của profile AdSense
    emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Email khôi phục
    recoveryEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // Ngày tạo của profile AdSense
    creationDate: {
      type: Date,
      required: true,
    },

    // Thông tin thuế
    taxName: {
      type: String,
      default: "",
    },

    // Vị trí làm việc
    location: {
      type: String,
      enum: ["HOME", "OFFICE", "OTHER"],
      default: "OFFICE",
    },

    // Thông tin kênh chính
    mainChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },

    // Link kênh
    linkedChannelUrl: {
      type: String,
      default: "",
    },

    // Email brand account của kênh
    emailChannel: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // Ngày tạo kênh
    channelJoinDate: {
      type: Date,
      default: null,
    },

    // Quốc gia
    country: {
      type: String,
      default: "VN",
    },

    // Trạng thái
    status: {
      type: String,
      enum: ["ACTIVE", "PROCESSING", "INACTIVE", "LOCKED"],
      default: "ACTIVE",
    },

    // Ghi chú bổ sung
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
