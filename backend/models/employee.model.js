const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Đảm bảo 1 user chỉ có 1 employee record
    },

    // Thông tin cá nhân
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

    // Thông tin công việc
    joinDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    department: {
      type: String,
      enum: ["CONTENT", "IT", "MARKETING"],
      default: "OTHER",
    },

    // Thông tin tài chính
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

    //
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({ user: 1 });
employeeSchema.index({ joinDate: -1 });

module.exports = mongoose.model("Employee", employeeSchema);
