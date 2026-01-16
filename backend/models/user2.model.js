const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // === Thông tin cơ bản ===
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "ACCOUNTANT", "EMPLOYEE"],
      default: "EMPLOYEE",
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "QUIT"],
      default: "ACTIVE",
    },

    // === Thông tin nhân viên ===
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    birthday: {
      type: Date,
      default: null,
    },

    facebookUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // === Thông tin công việc ===
    joinDate: {
      type: Date,
      default: Date.now,
    },

    department: {
      type: String,
      enum: ["CONTENT", "IT", "MARKETING", "OTHER"],
      default: "OTHER",
    },

    // === Thông tin tài chính ===
    bankAccount: {
      accountNumber: {
        type: String,
        trim: true,
        default: "",
      },
      bankName: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // === Quan hệ ===
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    // === Metadata ===
    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index để tăng hiệu năng query
userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1 });
userSchema.index({ joinDate: -1 });
userSchema.index({ team: 1 });
userSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model("User", userSchema);
