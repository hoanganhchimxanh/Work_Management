const mongoose = require("mongoose");

const channelRevenueSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    // Tháng và năm (format: YYYY-MM)
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/, // Validate format YYYY-MM
    },

    // Doanh thu ước tính từ YouTube Analytics
    estimatedRevenue: {
      type: Number,
      default: 0,
    },

    // Thuế Mỹ (chỉ áp dụng cho kênh không thuộc network)
    taxUS: {
      type: Number,
      default: 30, // Mặc định 30%
      min: 0,
      max: 100,
    },

    // Network fee (chỉ áp dụng cho kênh thuộc network)
    netNetwork: {
      type: Number,
      default: 20, // Mặc định 20%
      min: 0,
      max: 100,
    },

    // Thuế thu nhập cá nhân
    taxPIT: {
      type: Number,
      default: 7, // Mặc định 7%
      min: 0,
      max: 100,
    },

    // Doanh thu thực tế sau thuế
    actualRevenue: {
      type: Number,
      default: 0,
    },

    // Trạng thái khóa (khi đã xác nhận không thể chỉnh sửa)
    locked: {
      type: Boolean,
      default: false,
    },

    // Ghi chú
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index để query nhanh
channelRevenueSchema.index({ channel: 1, month: -1 });

// Tính toán doanh thu thực tế trước khi save
channelRevenueSchema.pre("save", async function (next) {
  if (
    this.isModified("estimatedRevenue") ||
    this.isModified("taxUS") ||
    this.isModified("netNetwork") ||
    this.isModified("taxPIT")
  ) {
    // Lấy thông tin channel để biết có thuộc network không
    const Channel = mongoose.model("Channel");
    const channel = await Channel.findById(this.channel).populate("network");

    let deductionPercent = this.taxPIT;

    if (channel.network && channel.isMonetized) {
      // Kênh thuộc network: trừ network fee + thuế TNCN
      deductionPercent += this.netNetwork;
    } else if (!channel.network && channel.isMonetized) {
      // Kênh không thuộc network: trừ thuế Mỹ + thuế TNCN
      deductionPercent += this.taxUS;
    }

    // Tính doanh thu thực tế
    this.actualRevenue = this.estimatedRevenue * (1 - deductionPercent / 100);
  }

  // next();
});

module.exports = mongoose.model("ChannelRevenue", channelRevenueSchema);
