const mongoose = require("mongoose");

const resourceBatchSchema = new mongoose.Schema(
  {
    // Tên file Excel liên kết với batch
    excelFileName: {
      type: String,
      required: true,
      trim: true,
    },

    // Array chứa các resource thuộc batch
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        default: null,
      },
    ],

    // Người được gán quản lý batch (user chịu trách nhiệm)
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Trạng thái batch
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Index hỗ trợ truy vấn nhanh
resourceBatchSchema.index({ assignedUser: 1 });
resourceBatchSchema.index({ excelFileName: 1 }, { unique: true });

module.exports = mongoose.model("ResourceBatch", resourceBatchSchema);
