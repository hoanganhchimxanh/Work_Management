const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Người nhận thông báo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Nội dung hiển thị
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Phân loại thông báo
    type: {
      type: String,
      enum: ["SYSTEM", "CHANNEL", "USER"],
      default: "SYSTEM",
      index: true,
    },

    // Trạng thái đã đọc
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Dữ liệu mở rộng (dùng cho redirect / context)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      /*
        Ví dụ:
        {
          channelId: ObjectId,
          channelName: "ABC Channel",
          redirectUrl: "/channels/123"
        }
      */
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/**
 * Index gợi ý cho hiệu năng
 * Query phổ biến: lấy thông báo chưa đọc của user
 */
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
