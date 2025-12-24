const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    /**
     * Email tài nguyên
     * Dùng để tạo / quản lý kênh YouTube
     */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Mật khẩu ban đầu
     * Chỉ dùng khi bàn giao cho nhân viên
     */
    defaultPassword: {
      type: String,
      required: true,
      select: false, // tránh bị populate lộ mật khẩu
    },

    /**
     * Email khôi phục
     */
    recoveryEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Trạng thái vòng đời resource
     */
    status: {
      type: String,
      enum: ["AVAILABLE", "ASSIGNED", "DISABLED"],
      default: "AVAILABLE",
    },

    /**
     * Nhân viên đang quản lý resource này
     * (người được giao sử dụng)
     */
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /**
     * Kênh YouTube mà resource này gắn với
     */
    assignedChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },

    /**
     * Ghi chú nội bộ (lý do khóa, lịch sử, v.v.)
     */
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index hỗ trợ truy vấn nhanh
 */
resourceSchema.index({ status: 1 });
resourceSchema.index({ assignedUser: 1 });
resourceSchema.index({ assignedChannel: 1 });

module.exports = mongoose.model("Resource", resourceSchema);
