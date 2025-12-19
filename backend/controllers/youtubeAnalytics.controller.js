const { google } = require("googleapis");
const mongoose = require("mongoose");
const db = require("../models");

const YoutubeAuth = db.YoutubeAuth;
const ChannelAnalytics = db.ChannelAnalytics;
const Channel = db.Channel;

const { refreshAccessToken } = require("./youtubeAuth.controller");

/**
 * Helper: Lấy OAuth client với token hợp lệ
 */
const getAuthenticatedClient = async (channelId, userId) => {
  const auth = await YoutubeAuth.findOne({
    channel: channelId,
    user: userId,
    status: "ACTIVE",
  });

  if (!auth) {
    throw new Error("Channel chưa được authorize!");
  }

  // Refresh token nếu hết hạn
  if (new Date() >= new Date(auth.expiresAt)) {
    await refreshAccessToken(auth._id);
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

/**
 * Sync analytics cho 1 channel
 */
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

    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${youtubeChannelId}`,
      startDate,
      endDate,
      metrics: "estimatedRevenue,subscribersGained,subscribersLost",
      dimensions: "day",
      sort: "day",
    });

    const rows = response.data.rows || [];
    const savedRecords = [];

    for (const row of rows) {
      const [date, revenue, subGained, subLost] = row;

      const record = await ChannelAnalytics.findOneAndUpdate(
        {
          channel: channelId,
          date: new Date(date),
        },
        {
          estimatedRevenue: revenue,
          subscribersGained: subGained,
          subscribersLost: subLost,
          syncedAt: new Date(),
        },
        { new: true, upsert: true }
      );

      savedRecords.push(record);
    }

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

/**
 * Lấy analytics của 1 channel
 */
const getChannelAnalytics = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Lấy channel
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

    // Kiểm tra quyền
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

    // Lấy team nếu có
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

    // Query analytics
    const query = { channel: new mongoose.Types.ObjectId(channelId) };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [analytics, totalsResult] = await Promise.all([
      ChannelAnalytics.find(query).sort({ date: 1 }).lean(),
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

    res.json({
      success: true,
      data: {
        channel: {
          channelId: channel._id,
          channelName: channel.name,
          channelLink: channel.link,
          channelStatus: channel.status,
          isMainChannel: channel.isMainChannel,
          isBrandAccount: channel.isBrandAccount,
        },

        assignedUser: channel.assignedUser
          ? {
              userId: channel.assignedUser._id,
              fullName: channel.assignedUser.fullName,
              personalEmail: channel.assignedUser.personalEmail,
              role: channel.assignedUser.role,
            }
          : null,

        team: teamInfo,

        network: channel.network
          ? {
              networkId: channel.network._id,
              profileAdsenseId: channel.network.profileAdsenseId,
              emailAddress: channel.network.emailAddress,
            }
          : null,

        analytics: analytics.map((r) => ({
          date: r.date,
          estimatedRevenue: r.estimatedRevenue,
          subscribersGained: r.subscribersGained,
          subscribersLost: r.subscribersLost,
          totalSubscribers: r.totalSubscribers,
        })),

        totals: {
          totalRevenue: totals.totalRevenue,
          totalSubsGained: totals.totalSubsGained,
          totalSubsLost: totals.totalSubsLost,
          netSubsChange: totals.totalSubsGained - totals.totalSubsLost,
        },

        recordCount: totals.recordCount,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * [ADMIN] Lấy analytics của tất cả channels
 */
const getAllChannelsAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

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
      {
        $lookup: {
          from: "channels",
          localField: "_id",
          foreignField: "_id",
          as: "channel",
        },
      },
      { $unwind: "$channel" },
      {
        $lookup: {
          from: "users",
          localField: "channel.assignedUser",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      { $unwind: { path: "$assignedUser", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "teams",
          localField: "assignedUser.team",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "networks",
          localField: "channel.network",
          foreignField: "_id",
          as: "network",
        },
      },
      { $unwind: { path: "$network", preserveNullAndEmptyArrays: true } },
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
            profileAdsenseId: "$network.profileAdsenseId",
          },
          totalRevenue: 1,
          totalSubsGained: 1,
          totalSubsLost: 1,
          recordCount: 1,
        },
      },
    ]);

    const grandTotals = analyticsData.reduce(
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
        channels: analyticsData,
        grandTotals,
        channelCount: analyticsData.length,
        dateRange: { startDate, endDate },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * [ADMIN] Sync tất cả channels đã authorize
 */
const syncAllChannels = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const authorizedChannels = await YoutubeAuth.find({
      status: "ACTIVE",
    }).populate("channel user");

    const results = [];
    const errors = [];

    for (const auth of authorizedChannels) {
      try {
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
