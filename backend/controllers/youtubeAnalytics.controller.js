const { google } = require("googleapis");
const mongoose = require("mongoose");
const db = require("../models");
const YoutubeAuth = db.YoutubeAuth;
const ChannelAnalytics = db.ChannelAnalytics;
const ChannelManager = db.ChannelManager;
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

    // Bước 1: Lấy thông tin channel với populate trong 1 query
    const channel = await Channel.findById(channelId)
      .populate("assignedUser", "fullName personalEmail role team")
      .populate("network", "profileAdsenseId emailAddress")
      .lean();

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Kiểm tra quyền truy cập
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "ACCOUNTANT" &&
      channel.assignedUser?._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem analytics của kênh này!",
      });
    }

    // Bước 2: Lấy thông tin team nếu có (1 query)
    let teamInfo = null;
    if (channel.assignedUser?.team) {
      const team = await db.Team.findById(channel.assignedUser.team)
        .select("name")
        .lean();
      if (team) {
        teamInfo = {
          teamId: team._id,
          teamName: team.name,
        };
      }
    }

    // Bước 3: Lấy channel managers (1 query)
    const channelManagers = await ChannelManager.find({
      channel: channelId,
      status: "ACTIVE",
    })
      .select("managerEmail role")
      .lean();

    // Bước 4: Aggregate analytics data với totals trong 1 query
    const query = { channel: new mongoose.Types.ObjectId(channelId) };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [analytics, totalsResult] = await Promise.all([
      // Lấy chi tiết analytics
      ChannelAnalytics.find(query).sort({ date: 1 }).lean(),

      // Tính tổng bằng aggregation (hiệu quả hơn reduce)
      ChannelAnalytics.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$estimatedRevenue" },
            totalSubsGained: { $sum: "$subscribersGained" },
            totalSubsLost: { $sum: "$subscribersLost" },
            recordCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totals = totalsResult[0] || {
      totalRevenue: 0,
      totalSubsGained: 0,
      totalSubsLost: 0,
      recordCount: 0,
    };

    // Bước 5: Format response
    res.json({
      success: true,
      data: {
        // Thông tin kênh
        channel: {
          channelId: channel._id,
          channelName: channel.name,
          channelLink: channel.link,
          channelStatus: channel.status,
          isMainChannel: channel.isMainChannel,
          isBrandAccount: channel.isBrandAccount,
        },

        // Thông tin nhân viên quản lý
        assignedUser: channel.assignedUser
          ? {
              userId: channel.assignedUser._id,
              fullName: channel.assignedUser.fullName,
              personalEmail: channel.assignedUser.personalEmail,
              role: channel.assignedUser.role,
            }
          : null,

        // Thông tin team
        team: teamInfo,

        // Thông tin network
        network: channel.network
          ? {
              networkId: channel.network._id,
              profileAdsenseId: channel.network.profileAdsenseId,
              emailAddress: channel.network.emailAddress,
            }
          : null,

        // Tài khoản quản lý kênh
        channelManagers: channelManagers.map((m) => ({
          managerEmail: m.managerEmail,
          role: m.role,
        })),

        // Analytics data theo ngày
        analytics: analytics.map((record) => ({
          date: record.date,
          estimatedRevenue: record.estimatedRevenue,
          subscribersGained: record.subscribersGained,
          subscribersLost: record.subscribersLost,
          totalSubscribers: record.totalSubscribers,
        })),

        // Tổng kết
        totals: {
          totalRevenue: totals.totalRevenue,
          totalSubsGained: totals.totalSubsGained,
          totalSubsLost: totals.totalSubsLost,
          netSubsChange: totals.totalSubsGained - totals.totalSubsLost,
        },

        // Metadata
        recordCount: totals.recordCount,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
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

    // Bước 1: Aggregate analytics data với lookup trực tiếp
    const analyticsData = await ChannelAnalytics.aggregate([
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
      // Lookup Channel với nested populate
      {
        $lookup: {
          from: "channels",
          localField: "_id",
          foreignField: "_id",
          as: "channel",
        },
      },
      { $unwind: "$channel" },
      // Lookup User (assignedUser)
      {
        $lookup: {
          from: "users",
          localField: "channel.assignedUser",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
      // Lookup Team
      {
        $lookup: {
          from: "teams",
          localField: "assignedUser.team",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
      // Lookup Network
      {
        $lookup: {
          from: "networks",
          localField: "channel.network",
          foreignField: "_id",
          as: "network",
        },
      },
      { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
      // Project final shape
      {
        $project: {
          channelId: "$_id",
          channelName: "$channel.name",
          channelLink: "$channel.link",
          channelStatus: "$channel.status",
          assignedUser: {
            userId: "$assignedUser._id",
            fullName: "$assignedUser.fullName",
            personalEmail: "$assignedUser.personalEmail",
            role: "$assignedUser.role",
          },
          team: {
            teamId: "$team._id",
            teamName: "$team.name",
          },
          network: {
            networkId: "$network._id",
            networkName: "$network.profileAdsenseId",
          },
          totalRevenue: 1,
          totalSubsGained: 1,
          totalSubsLost: 1,
          recordCount: 1,
        },
      },
    ]);

    // Bước 2: Lấy channelIds để query ChannelManager
    const channelIds = analyticsData.map((item) => item.channelId);

    // Lấy tất cả channel managers trong 1 query duy nhất
    const channelManagers = await ChannelManager.find({
      channel: { $in: channelIds },
      status: "ACTIVE",
    })
      .select("channel managerEmail role")
      .lean();

    // Tạo map để tra cứu nhanh managers theo channelId
    const managersMap = channelManagers.reduce((acc, manager) => {
      const channelId = manager.channel.toString();
      if (!acc[channelId]) {
        acc[channelId] = [];
      }
      acc[channelId].push({
        managerEmail: manager.managerEmail,
        role: manager.role,
      });
      return acc;
    }, {});

    // Bước 3: Kết hợp dữ liệu
    const result = analyticsData.map((item) => ({
      channelId: item.channelId,
      channelName: item.channelName,
      channelLink: item.channelLink,
      channelStatus: item.channelStatus,

      // Thông tin nhân viên
      assignedUser: item.assignedUser?.userId
        ? {
            userId: item.assignedUser.userId,
            fullName: item.assignedUser.fullName,
            personalEmail: item.assignedUser.personalEmail,
            role: item.assignedUser.role,
          }
        : null,

      // Thông tin team
      team: item.team?.teamId
        ? {
            teamId: item.team.teamId,
            teamName: item.team.teamName,
          }
        : null,

      // Thông tin network
      network: item.network?.networkId
        ? {
            networkId: item.network.networkId,
            networkName: item.network.networkName,
          }
        : null,

      // Tài khoản quản lý kênh
      channelManagers: managersMap[item.channelId.toString()] || [],

      // Metrics
      totalRevenue: item.totalRevenue,
      totalSubsGained: item.totalSubsGained,
      totalSubsLost: item.totalSubsLost,
      recordCount: item.recordCount,
    }));

    // Bước 4: Tính grand totals
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
        dateRange: {
          startDate,
          endDate,
        },
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
