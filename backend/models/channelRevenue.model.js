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

    // ============ DỮ LIỆU VIEWS TỪ YOUTUBE ANALYTICS ============
    totalViews: {
      type: Number,
      default: 0,
    },

    usViews: {
      type: Number,
      default: 0,
    },

    // Tỷ lệ views từ Mỹ (tính tự động)
    usViewsPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ============ DOANH THU THEO KHU VỰC (TÍNH TỰ ĐỘNG) ============
    // Doanh thu từ Mỹ (ước tính dựa trên tỷ lệ views)
    usRevenue: {
      type: Number,
      default: 0,
    },

    // Doanh thu ngoài Mỹ
    nonUsRevenue: {
      type: Number,
      default: 0,
    },

    // ============ CÁC KHOẢN KHẤU TRỪ ============
    // Thuế Mỹ (áp dụng cho phần doanh thu từ Mỹ)
    taxUS: {
      type: Number,
      default: 30, // Mặc định 30%
      min: 0,
      max: 100,
    },

    // Network fee (áp dụng sau khi đã trừ thuế Mỹ)
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
  },
);

// Index để query nhanh
channelRevenueSchema.index({ channel: 1, month: -1 });

// Tính toán tự động trước khi save
channelRevenueSchema.pre("save", async function (next) {
  // 1. Tính tỷ lệ views từ Mỹ
  if (this.totalViews > 0 && this.usViews > 0) {
    this.usViewsPercentage = (this.usViews / this.totalViews) * 100;
  } else {
    this.usViewsPercentage = 0;
  }

  // 2. Tính doanh thu theo khu vực (dựa trên tỷ lệ views)
  if (this.usViewsPercentage > 0) {
    this.usRevenue = this.estimatedRevenue * (this.usViewsPercentage / 100);
    this.nonUsRevenue = this.estimatedRevenue - this.usRevenue;
  } else {
    this.usRevenue = 0;
    this.nonUsRevenue = this.estimatedRevenue;
  }

  // 3. Tính doanh thu thực tế theo công thức mới
  if (
    this.isModified("estimatedRevenue") ||
    this.isModified("totalViews") ||
    this.isModified("usViews") ||
    this.isModified("taxUS") ||
    this.isModified("netNetwork") ||
    this.isModified("taxPIT")
  ) {
    // Lấy thông tin channel để biết có thuộc network không
    const Channel = mongoose.model("Channel");
    const channel = await Channel.findById(this.channel).populate("network");

    if (!channel || !channel.isMonetized) {
      this.actualRevenue = 0;
      return next();
    }

    // Tính doanh thu Mỹ sau thuế
    const usRevenueAfterTax = this.usRevenue * (1 - this.taxUS / 100);

    // Tổng doanh thu sau thuế Mỹ
    const totalRevenueAfterUsTax = usRevenueAfterTax + this.nonUsRevenue;

    if (channel.network) {
      // ============ CÓ NETWORK ============
      // DT Thực tế = [ (DT Mỹ × (100% − %Thuế Mỹ)) + DT Ngoài Mỹ ] × (100% − %Net Network − %Thuế TNCN)
      this.actualRevenue =
        totalRevenueAfterUsTax * (1 - (this.netNetwork + this.taxPIT) / 100);
    } else {
      // ============ KHÔNG CÓ NETWORK ============
      // DT Thực tế = [ (DT Mỹ × (100% − %Thuế Mỹ)) + DT Ngoài Mỹ ] × (100% − %Thuế TNCN)
      this.actualRevenue = totalRevenueAfterUsTax * (1 - this.taxPIT / 100);
    }
  }

  next();
});

module.exports = mongoose.model("ChannelRevenue", channelRevenueSchema);
