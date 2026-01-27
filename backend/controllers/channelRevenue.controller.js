const mongoose = require("mongoose");
const db = require("../models");
const ChannelRevenue = db.ChannelRevenue;
const Channel = db.Channel;
const ChannelAnalytics = db.ChannelAnalytics;

// Lấy doanh thu theo tháng của một kênh
const getChannelMonthlyRevenue = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { startMonth, endMonth } = req.query;

    // Kiểm tra kênh có tồn tại
    const channel = await Channel.findById(channelId)
      .populate("network", "profileAdsenseId")
      .lean();

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Build query
    const query = { channel: channelId };
    if (startMonth && endMonth) {
      query.month = { $gte: startMonth, $lte: endMonth };
    }

    const revenues = await ChannelRevenue.find(query)
      .sort({ month: -1 })
      .lean();

    // Tính tổng
    const totals = revenues.reduce(
      (acc, rev) => ({
        totalEstimated: acc.totalEstimated + rev.estimatedRevenue,
        totalActual: acc.totalActual + rev.actualRevenue,
      }),
      { totalEstimated: 0, totalActual: 0 },
    );

    res.json({
      success: true,
      data: {
        channel: {
          channelId: channel._id,
          channelName: channel.name,
          channelLink: channel.link,
          isMonetized: channel.isMonetized,
          monetizeDate: channel.monetizeDate,
          hasNetwork: !!channel.network,
          networkId: channel.network?._id,
        },
        revenues,
        totals,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Tạo hoặc cập nhật doanh thu tháng
const createOrUpdateRevenue = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { month, estimatedRevenue, taxUS, netNetwork, taxPIT, note } =
      req.body;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tháng!",
      });
    }

    // Validate month format
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng tháng không hợp lệ! (YYYY-MM)",
      });
    }

    // Kiểm tra kênh
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Tìm hoặc tạo mới
    let revenue = await ChannelRevenue.findOne({ channel: channelId, month });

    if (revenue) {
      // Kiểm tra đã khóa chưa
      if (revenue.locked) {
        return res.status(400).json({
          success: false,
          message: "Tháng này đã được khóa, không thể chỉnh sửa!",
        });
      }

      // Cập nhật
      if (estimatedRevenue !== undefined)
        revenue.estimatedRevenue = estimatedRevenue;
      if (taxUS !== undefined) revenue.taxUS = taxUS;
      if (netNetwork !== undefined) revenue.netNetwork = netNetwork;
      if (taxPIT !== undefined) revenue.taxPIT = taxPIT;
      if (note !== undefined) revenue.note = note;

      await revenue.save();
    } else {
      // Tạo mới
      revenue = await ChannelRevenue.create({
        channel: channelId,
        month,
        estimatedRevenue: estimatedRevenue || 0,
        taxUS: taxUS !== undefined ? taxUS : 30,
        netNetwork: netNetwork !== undefined ? netNetwork : 20,
        taxPIT: taxPIT !== undefined ? taxPIT : 7,
        note: note || "",
      });
    }

    // Populate để trả về đầy đủ thông tin
    const populatedRevenue = await ChannelRevenue.findById(revenue._id)
      .populate("channel", "name link isMonetized network")
      .lean();

    res.json({
      success: true,
      message: revenue.isNew
        ? "Tạo doanh thu tháng thành công!"
        : "Cập nhật doanh thu tháng thành công!",
      data: populatedRevenue,
    });
  } catch (err) {
    next(err);
  }
};

// Hàm hỗ trợ lấy thời gian (tháng)
const isCurrentMonth = (monthString) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return monthString === currentMonth;
};

// Đồng bộ doanh thu
const syncRevenueFromAnalytics = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { startMonth, endMonth } = req.body;

    if (!startMonth || !endMonth) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startMonth hoặc endMonth!",
      });
    }

    // Kiểm tra kênh
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Tính startDate và endDate từ month
    const startDate = new Date(`${startMonth}-01`);
    const endDate = new Date(`${endMonth}-01`);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Ngày cuối cùng của tháng

    // Lấy analytics data theo tháng
    const analyticsData = await ChannelAnalytics.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $project: {
          month: {
            $dateToString: { format: "%Y-%m", date: "$date" },
          },
          estimatedRevenue: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          totalRevenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const synced = [];
    const errors = [];

    for (const data of analyticsData) {
      try {
        const month = data._id;
        const estimatedRevenue = data.totalRevenue;

        // ✅ Xác định trạng thái locked dựa trên tháng
        const shouldLock = !isCurrentMonth(month);

        // Tìm hoặc tạo mới
        let revenue = await ChannelRevenue.findOne({
          channel: channelId,
          month,
        });

        if (revenue) {
          // ⚠️ Chỉ cập nhật nếu chưa bị khóa
          if (revenue.locked) {
            errors.push({
              month,
              error: "Tháng này đã được khóa",
            });
            continue;
          }

          revenue.estimatedRevenue = estimatedRevenue;
          revenue.locked = shouldLock; // ✅ Tự động khóa nếu không phải tháng hiện tại
          await revenue.save();
        } else {
          revenue = await ChannelRevenue.create({
            channel: channelId,
            month,
            estimatedRevenue,
            locked: shouldLock, // ✅ Tự động khóa nếu không phải tháng hiện tại
          });
        }

        synced.push({ month, estimatedRevenue, locked: shouldLock });
      } catch (err) {
        errors.push({ month: data._id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Đã đồng bộ ${synced.length} tháng!`,
      data: {
        synced,
        errors,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Khóa/mở khóa tháng
const toggleLock = async (req, res, next) => {
  try {
    const { channelId, month } = req.params;

    const revenue = await ChannelRevenue.findOne({ channel: channelId, month });

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu doanh thu tháng này!",
      });
    }

    revenue.locked = !revenue.locked;
    await revenue.save();

    res.json({
      success: true,
      message: revenue.locked ? "Đã khóa tháng này!" : "Đã mở khóa tháng này!",
      data: revenue,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa dữ liệu doanh thu tháng
const deleteRevenue = async (req, res, next) => {
  try {
    const { channelId, month } = req.params;

    const revenue = await ChannelRevenue.findOne({ channel: channelId, month });

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu doanh thu tháng này!",
      });
    }

    if (revenue.locked) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tháng đã khóa!",
      });
    }

    await ChannelRevenue.findByIdAndDelete(revenue._id);

    res.json({
      success: true,
      message: "Đã xóa dữ liệu doanh thu tháng!",
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tổng quan doanh thu của tất cả kênh
const getAllChannelsRevenueSummary = async (req, res, next) => {
  try {
    const { month } = req.query;
    const matchStage = month ? { month } : {};

    const summary = await ChannelRevenue.aggregate([
      { $match: matchStage },

      // Join Channel
      {
        $lookup: {
          from: "channels",
          localField: "channel",
          foreignField: "_id",
          as: "channelData",
        },
      },
      { $unwind: "$channelData" },

      // Join User (assignedUser)
      {
        $lookup: {
          from: "users",
          localField: "channelData.assignedUser",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      {
        $unwind: {
          path: "$assignedUser",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Group theo CHANNEL
      {
        $group: {
          _id: "$channel",
          channelName: { $first: "$channelData.name" },
          channelLink: { $first: "$channelData.link" },

          assignedUser: {
            $first: {
              userId: "$assignedUser._id",
              fullName: "$assignedUser.fullName",
              phoneNumber: "$assignedUser.phoneNumber",
              team: "$assignedUser.team",
              status: "$assignedUser.status",
            },
          },

          totalEstimated: { $sum: "$estimatedRevenue" },
          totalActual: { $sum: "$actualRevenue" },
          monthCount: { $sum: 1 },
        },
      },

      { $sort: { totalActual: -1 } },
    ]);

    const grandTotals = summary.reduce(
      (acc, item) => ({
        totalEstimated: acc.totalEstimated + item.totalEstimated,
        totalActual: acc.totalActual + item.totalActual,
      }),
      { totalEstimated: 0, totalActual: 0 },
    );

    res.json({
      success: true,
      data: {
        channels: summary,
        grandTotals,
        channelCount: summary.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChannelMonthlyRevenue,
  createOrUpdateRevenue,
  syncRevenueFromAnalytics,
  toggleLock,
  deleteRevenue,
  getAllChannelsRevenueSummary,
};
