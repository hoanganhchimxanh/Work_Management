const { google } = require("googleapis");
const mongoose = require("mongoose");
const db = require("../models");

const ChannelRevenue = db.ChannelRevenue;
const Channel = db.Channel;
const YoutubeAuth = db.YoutubeAuth;

/**
 * Helper: Lấy OAuth client với token hợp lệ
 */
const getAuthenticatedClient = async (channelId) => {
  const auth = await YoutubeAuth.findOne({
    channel: channelId,
    status: "ACTIVE",
  });

  if (!auth) {
    throw new Error("Channel chưa được authorize!");
  }

  if (new Date() >= new Date(auth.expiresAt)) {
    const youtubeAuthController = require("./youtubeAuth.controller");
    await youtubeAuthController.refreshAccessToken(auth._id);

    const refreshedAuth = await YoutubeAuth.findById(auth._id);
    auth.accessToken = refreshedAuth.accessToken;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken,
  });

  return {
    oauth2Client,
    youtubeChannelId: auth.youtubeChannelId,
  };
};

/**
 * ✅ FIXED: Helper tính date range ĐÚNG cho YouTube Analytics
 * YouTube Analytics với dimension "month" cần:
 * - startDate: ngày đầu tháng
 * - endDate: ngày cuối tháng
 */
const calculateDateRange = (startMonth, endMonth) => {
  // Input: "2025-01", "2025-02"
  const [startYear, startMonthNum] = startMonth.split("-").map(Number);
  const [endYear, endMonthNum] = endMonth.split("-").map(Number);

  // Start date: luôn là ngày 01
  const startDateStr = `${startYear}-${String(startMonthNum).padStart(2, "0")}-01`;

  // End date: ngày cuối của endMonth
  // Tạo date object cho THÁNG SAU, rồi lùi 1 ngày
  let endDate;
  if (endMonthNum === 12) {
    // Nếu là tháng 12, tháng sau là tháng 1 năm sau
    endDate = new Date(endYear + 1, 0, 0); // Day 0 = ngày cuối tháng trước
  } else {
    endDate = new Date(endYear, endMonthNum, 0); // Day 0 = ngày cuối tháng trước
  }

  const year = endDate.getFullYear();
  const month = String(endDate.getMonth() + 1).padStart(2, "0");
  const day = String(endDate.getDate()).padStart(2, "0");
  const endDateStr = `${year}-${month}-${day}`;

  return { startDateStr, endDateStr };
};

// Lấy doanh thu theo tháng của một kênh
const getChannelMonthlyRevenue = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { startMonth, endMonth } = req.query;

    const channel = await Channel.findById(channelId)
      .populate("network", "profileAdsenseId")
      .lean();

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    const query = { channel: channelId };
    if (startMonth && endMonth) {
      query.month = { $gte: startMonth, $lte: endMonth };
    }

    const revenues = await ChannelRevenue.find(query)
      .sort({ month: -1 })
      .lean();

    const totals = revenues.reduce(
      (acc, rev) => ({
        totalEstimated: acc.totalEstimated + (rev.estimatedRevenue || 0),
        totalActual: acc.totalActual + (rev.actualRevenue || 0),
        totalUsRevenue: acc.totalUsRevenue + (rev.usRevenue || 0),
        totalNonUsRevenue: acc.totalNonUsRevenue + (rev.nonUsRevenue || 0),
      }),
      {
        totalEstimated: 0,
        totalActual: 0,
        totalUsRevenue: 0,
        totalNonUsRevenue: 0,
      },
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
    const {
      month,
      estimatedRevenue,
      totalViews,
      usViews,
      taxUS,
      netNetwork,
      taxPIT,
      note,
    } = req.body;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tháng!",
      });
    }

    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng tháng không hợp lệ! (YYYY-MM)",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    let revenue = await ChannelRevenue.findOne({ channel: channelId, month });

    if (revenue) {
      if (revenue.locked) {
        return res.status(400).json({
          success: false,
          message: "Tháng này đã được khóa, không thể chỉnh sửa!",
        });
      }

      if (estimatedRevenue !== undefined)
        revenue.estimatedRevenue = estimatedRevenue;
      if (totalViews !== undefined) revenue.totalViews = totalViews;
      if (usViews !== undefined) revenue.usViews = usViews;
      if (taxUS !== undefined) revenue.taxUS = taxUS;
      if (netNetwork !== undefined) revenue.netNetwork = netNetwork;
      if (taxPIT !== undefined) revenue.taxPIT = taxPIT;
      if (note !== undefined) revenue.note = note;

      await revenue.save();
    } else {
      revenue = await ChannelRevenue.create({
        channel: channelId,
        month,
        estimatedRevenue: estimatedRevenue || 0,
        totalViews: totalViews || 0,
        usViews: usViews || 0,
        taxUS: taxUS !== undefined ? taxUS : 30,
        netNetwork: netNetwork !== undefined ? netNetwork : 20,
        taxPIT: taxPIT !== undefined ? taxPIT : 7,
        note: note || "",
      });
    }

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

// ============ ✅ FINAL FIX: Query từng tháng một ============
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

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    if (!channel.isMonetized) {
      return res.status(400).json({
        success: false,
        message: "Kênh chưa bật kiếm tiền!",
      });
    }

    // ✅ FIX 1: Chỉ sync đến THÁNG TRƯỚC (tháng hiện tại chưa hoàn thành)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    let adjustedEndMonth = endMonth;
    if (endMonth >= currentMonth) {
      const prevMonth = new Date(now);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      adjustedEndMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

      console.log(
        `⚠️ Adjusted endMonth from ${endMonth} to ${adjustedEndMonth} (current/future month excluded)`,
      );
    }

    // Lấy auth client
    let oauth2Client, youtubeChannelId;
    try {
      const authResult = await getAuthenticatedClient(channelId);
      oauth2Client = authResult.oauth2Client;
      youtubeChannelId = authResult.youtubeChannelId;
    } catch (authError) {
      return res.status(401).json({
        success: false,
        message:
          authError.message ||
          "Lỗi xác thực YouTube. Vui lòng authorize lại kênh!",
      });
    }

    console.log(`📅 Sync request: ${startMonth} to ${adjustedEndMonth}`);

    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    // ✅ FIX 2: Tạo danh sách các tháng cần sync
    const monthsToSync = [];
    const start = new Date(`${startMonth}-01`);
    const end = new Date(`${adjustedEndMonth}-01`);

    let current = new Date(start);
    while (current <= end) {
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      monthsToSync.push(monthStr);
      current.setMonth(current.getMonth() + 1);
    }

    console.log(
      `📊 Will sync ${monthsToSync.length} months: ${monthsToSync.join(", ")}`,
    );

    // ============ XỬ LÝ DỮ LIỆU ============
    const synced = [];
    const errors = [];

    // ✅ FIX 3: Query TỪNG THÁNG MỘT
    for (const month of monthsToSync) {
      try {
        const { startDateStr, endDateStr } = calculateDateRange(month, month);

        console.log(`🔄 Fetching ${month}: ${startDateStr} to ${endDateStr}`);

        // Query overall data (revenue + total views)
        const overallResponse = await youtubeAnalytics.reports.query({
          ids: `channel==${youtubeChannelId}`,
          startDate: startDateStr,
          endDate: endDateStr,
          metrics: "estimatedRevenue,views",
        });

        // Query US views
        const usViewsResponse = await youtubeAnalytics.reports.query({
          ids: `channel==${youtubeChannelId}`,
          startDate: startDateStr,
          endDate: endDateStr,
          metrics: "views",
          filters: "country==US",
        });

        const overallRow = overallResponse.data.rows?.[0];
        const usViewsRow = usViewsResponse.data.rows?.[0];

        if (!overallRow) {
          console.log(`⚠️ No data for ${month}, skipping...`);
          continue;
        }

        const [revenue, totalViews] = overallRow;
        const usViews = usViewsRow?.[0] || 0;

        console.log(
          `📊 ${month}: Revenue=$${revenue}, Total Views=${totalViews}, US Views=${usViews}`,
        );

        // Tìm hoặc tạo revenue document
        let revenueDoc = await ChannelRevenue.findOne({
          channel: channelId,
          month,
        });

        if (revenueDoc) {
          if (revenueDoc.locked) {
            errors.push({ month, error: "Tháng này đã được khóa" });
            continue;
          }
          revenueDoc.estimatedRevenue = revenue || 0;
          revenueDoc.totalViews = totalViews || 0;
          revenueDoc.usViews = usViews || 0;
          await revenueDoc.save();
        } else {
          revenueDoc = await ChannelRevenue.create({
            channel: channelId,
            month,
            estimatedRevenue: revenue || 0,
            totalViews: totalViews || 0,
            usViews: usViews || 0,
          });
        }

        synced.push({
          month,
          estimatedRevenue: revenue || 0,
          totalViews: totalViews || 0,
          usViews: usViews || 0,
          usViewsPercentage: revenueDoc.usViewsPercentage || 0,
          actualRevenue: revenueDoc.actualRevenue || 0,
        });

        // Thêm delay nhỏ giữa các request để tránh rate limit
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (monthError) {
        console.error(`❌ Error syncing ${month}:`, monthError.message);

        let errorMessage = monthError.message || "Unknown error";
        if (monthError.code === 403) {
          errorMessage = "Không có quyền truy cập";
        } else if (monthError.code === 401) {
          errorMessage = "Token hết hạn";
        } else if (monthError.code === 400) {
          errorMessage = "Request không hợp lệ";
        }

        errors.push({ month, error: errorMessage });

        // Continue với tháng tiếp theo
        continue;
      }
    }

    console.log(
      `✅ Sync completed: ${synced.length}/${monthsToSync.length} months synced`,
    );

    if (synced.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không sync được tháng nào!",
        data: { errors },
      });
    }

    res.json({
      success: true,
      message: `Đã đồng bộ ${synced.length}/${monthsToSync.length} tháng!`,
      data: {
        synced,
        errors,
        dateRange: {
          requested: `${startMonth} to ${endMonth}`,
          actual: `${startMonth} to ${adjustedEndMonth}`,
        },
      },
    });
  } catch (err) {
    console.error("💥 Sync Revenue Error:", err);
    // next(err);
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
      {
        $lookup: {
          from: "channels",
          localField: "channel",
          foreignField: "_id",
          as: "channelData",
        },
      },
      { $unwind: "$channelData" },
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
          totalUsRevenue: { $sum: "$usRevenue" },
          totalNonUsRevenue: { $sum: "$nonUsRevenue" },
          monthCount: { $sum: 1 },
        },
      },
      { $sort: { totalActual: -1 } },
    ]);

    const grandTotals = summary.reduce(
      (acc, item) => ({
        totalEstimated: acc.totalEstimated + (item.totalEstimated || 0),
        totalActual: acc.totalActual + (item.totalActual || 0),
        totalUsRevenue: acc.totalUsRevenue + (item.totalUsRevenue || 0),
        totalNonUsRevenue:
          acc.totalNonUsRevenue + (item.totalNonUsRevenue || 0),
      }),
      {
        totalEstimated: 0,
        totalActual: 0,
        totalUsRevenue: 0,
        totalNonUsRevenue: 0,
      },
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
