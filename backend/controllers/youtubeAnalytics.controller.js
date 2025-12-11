const { google } = require("googleapis");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const ChannelAnalytics = db.ChannelAnalytics;
const Channel = db.Channel;
const { refreshAccessToken } = require("./youtubeAuth.controller");

// Helper: Lấy OAuth client với token hợp lệ
const getAuthenticatedClient = async (channelId, userId) => {
  const auth = await YoutubeAuth.findOne({
    channel: channelId,
    user: userId,
    status: "ACTIVE",
  });

  if (!auth) {
    throw new Error("Channel chưa được authorize!");
  }

  // Kiểm tra token có hết hạn không
  if (new Date() >= new Date(auth.expiresAt)) {
    await refreshAccessToken(auth._id);
    // Reload auth sau khi refresh
    const refreshedAuth = await YoutubeAuth.findById(auth._id);
    auth.accessToken = refreshedAuth.accessToken;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken,
  });

  return {
    oauth2Client,
    youtubeChannelId: auth.youtubeChannelId,
    authDoc: auth,
  };
};

// Sync analytics data cho một channel
const syncChannelAnalytics = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const { oauth2Client, youtubeChannelId, authDoc } =
      await getAuthenticatedClient(channelId, userId);

    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    // Lấy metrics từ YouTube Analytics API
    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${youtubeChannelId}`,
      startDate,
      endDate,
      metrics: "estimatedRevenue,subscribersGained,subscribersLost",
      dimensions: "day",
      sort: "day",
    });

    const rows = response.data.rows || [];

    // Lưu hoặc cập nhật analytics data
    const savedRecords = [];
    for (const row of rows) {
      const [date, revenue, subGained, subLost] = row;

      const existingRecord = await ChannelAnalytics.findOne({
        channel: channelId,
        date: new Date(date),
      });

      if (existingRecord) {
        existingRecord.estimatedRevenue = revenue;
        existingRecord.subscribersGained = subGained;
        existingRecord.subscribersLost = subLost;
        existingRecord.syncedAt = new Date();
        await existingRecord.save();
        savedRecords.push(existingRecord);
      } else {
        const newRecord = await ChannelAnalytics.create({
          channel: channelId,
          date: new Date(date),
          estimatedRevenue: revenue,
          subscribersGained: subGained,
          subscribersLost: subLost,
        });
        savedRecords.push(newRecord);
      }
    }

    // Cập nhật lastSyncedAt
    authDoc.lastSyncedAt = new Date();
    await authDoc.save();

    res.json({
      success: true,
      message: `Đã sync ${savedRecords.length} bản ghi analytics!`,
      data: {
        recordCount: savedRecords.length,
        startDate,
        endDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Lấy analytics data từ database
const getChannelAnalytics = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Kiểm tra quyền truy cập
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Chỉ người quản lý hoặc admin mới xem được
    if (
      req.user.role !== "ADMIN" &&
      channel.assignedUser.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem analytics của kênh này!",
      });
    }

    // Build query
    const query = { channel: channelId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const analytics = await ChannelAnalytics.find(query)
      .sort({ date: 1 })
      .lean();

    // Tính tổng
    const totals = analytics.reduce(
      (acc, record) => ({
        totalRevenue: acc.totalRevenue + record.estimatedRevenue,
        totalSubsGained: acc.totalSubsGained + record.subscribersGained,
        totalSubsLost: acc.totalSubsLost + record.subscribersLost,
      }),
      {
        totalRevenue: 0,
        totalSubsGained: 0,
        totalSubsLost: 0,
      }
    );

    res.json({
      success: true,
      data: {
        analytics,
        totals,
        recordCount: analytics.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// [ADMIN] Lấy analytics của tất cả channels
const getAllChannelsAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const analytics = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$channel",
          totalRevenue: { $sum: "$estimatedRevenue" },
          totalSubsGained: { $sum: "$subscribersGained" },
          totalSubsLost: { $sum: "$subscribersLost" },
          recordCount: { $sum: 1 },
        },
      },
    ]);

    // Populate channel info
    const channelIds = analytics.map((a) => a._id);
    const channels = await Channel.find({ _id: { $in: channelIds } })
      .populate("assignedUser", "fullName personalEmail")
      .populate("network", "name")
      .lean();

    const channelMap = channels.reduce((acc, ch) => {
      acc[ch._id.toString()] = ch;
      return acc;
    }, {});

    const result = analytics.map((a) => {
      const channel = channelMap[a._id.toString()];
      return {
        channelId: a._id,
        channelName: channel?.name,
        assignedUser: channel?.assignedUser?.fullName,
        network: channel?.network?.name,
        ...a,
      };
    });

    // Tính grand totals
    const grandTotals = result.reduce(
      (acc, item) => ({
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        totalSubsGained: acc.totalSubsGained + item.totalSubsGained,
        totalSubsLost: acc.totalSubsLost + item.totalSubsLost,
      }),
      {
        totalRevenue: 0,
        totalSubsGained: 0,
        totalSubsLost: 0,
      }
    );

    res.json({
      success: true,
      data: {
        channels: result,
        grandTotals,
        channelCount: result.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// [ADMIN] Sync tất cả channels đã authorize
const syncAllChannels = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    // Lấy tất cả channels đã authorize
    const authorizedChannels = await YoutubeAuth.find({
      status: "ACTIVE",
    }).populate("channel user");

    const results = [];
    const errors = [];

    for (const auth of authorizedChannels) {
      try {
        // Sync từng channel
        const { oauth2Client, youtubeChannelId } = await getAuthenticatedClient(
          auth.channel._id,
          auth.user._id
        );

        const youtubeAnalytics = google.youtubeAnalytics({
          version: "v2",
          auth: oauth2Client,
        });

        const response = await youtubeAnalytics.reports.query({
          ids: `channel==${youtubeChannelId}`,
          startDate,
          endDate,
          metrics: "estimatedRevenue,subscribersGained,subscribersLost",
          dimensions: "day",
          sort: "day",
        });

        const rows = response.data.rows || [];

        for (const row of rows) {
          const [date, revenue, subGained, subLost] = row;

          await ChannelAnalytics.findOneAndUpdate(
            {
              channel: auth.channel._id,
              date: new Date(date),
            },
            {
              estimatedRevenue: revenue,
              subscribersGained: subGained,
              subscribersLost: subLost,
              syncedAt: new Date(),
            },
            { upsert: true }
          );
        }

        auth.lastSyncedAt = new Date();
        await auth.save();

        results.push({
          channelId: auth.channel._id,
          channelName: auth.channel.name,
          recordCount: rows.length,
          success: true,
        });
      } catch (err) {
        errors.push({
          channelId: auth.channel._id,
          channelName: auth.channel.name,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Đã sync ${results.length} channels!`,
      data: {
        successful: results,
        failed: errors,
        totalChannels: authorizedChannels.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  syncChannelAnalytics,
  getChannelAnalytics,
  getAllChannelsAnalytics,
  syncAllChannels,
};
