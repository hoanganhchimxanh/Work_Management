// backend/controllers/dashboard.controller.js
const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Team = db.Team;
const Channel = db.Channel;
const Network = db.Network;
const ChannelAnalytics = db.ChannelAnalytics;

// Get Dashboard Statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Nếu không có startDate/endDate, mặc định lấy 30 ngày gần nhất
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count total employees (excluding ADMIN)
    const totalEmployees = await User.countDocuments({
      role: { $ne: "ADMIN" },
      status: "ACTIVE",
    });

    // Count total channels
    const totalChannels = await Channel.countDocuments({
      status: "ACTIVE",
    });

    // Count active networks
    const activeNetworks = await Network.countDocuments({
      status: "ACTIVE",
    });

    // Calculate total revenue for the period
    const revenueResult = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$estimatedRevenue" },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalEmployees,
        totalChannels,
        activeNetworks,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Revenue by Day for a date range
const getRevenueByDay = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const revenueByDay = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          revenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
        },
      },
    ]);

    // Fill missing dates with 0
    const allDates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      allDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const filledData = allDates.map((date) => {
      const found = revenueByDay.find((item) => item.date === date);
      return {
        date,
        revenue: found ? found.revenue : 0,
      };
    });

    res.json({
      success: true,
      data: filledData,
    });
  } catch (err) {
    next(err);
  }
};

// Get Top Employees by Revenue
const getTopEmployees = async (req, res, next) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const topEmployees = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $lookup: {
          from: "channels",
          localField: "channel",
          foreignField: "_id",
          as: "channelData",
        },
      },
      {
        $unwind: "$channelData",
      },
      {
        $lookup: {
          from: "users",
          localField: "channelData.assignedUser",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $group: {
          _id: "$userData._id",
          fullName: { $first: "$userData.fullName" },
          personalEmail: { $first: "$userData.personalEmail" },
          totalRevenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          fullName: 1,
          personalEmail: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: topEmployees,
    });
  } catch (err) {
    next(err);
  }
};

// Get Top Teams by Revenue
const getTopTeams = async (req, res, next) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const topTeams = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $lookup: {
          from: "channels",
          localField: "channel",
          foreignField: "_id",
          as: "channelData",
        },
      },
      {
        $unwind: "$channelData",
      },
      {
        $lookup: {
          from: "users",
          localField: "channelData.assignedUser",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $lookup: {
          from: "teams",
          localField: "userData.team",
          foreignField: "_id",
          as: "teamData",
        },
      },
      {
        $unwind: {
          path: "$teamData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$teamData._id",
          teamName: { $first: "$teamData.name" },
          totalRevenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          teamId: "$_id",
          teamName: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: topTeams,
    });
  } catch (err) {
    next(err);
  }
};

// Get Top Channels by Revenue
const getTopChannels = async (req, res, next) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const topChannels = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$channel",
          totalRevenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $lookup: {
          from: "channels",
          localField: "_id",
          foreignField: "_id",
          as: "channelData",
        },
      },
      {
        $unwind: "$channelData",
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          channelId: "$_id",
          channelName: "$channelData.name",
          channelLink: "$channelData.link",
          totalRevenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: topChannels,
    });
  } catch (err) {
    next(err);
  }
};

// Get Revenue Comparison (Current vs Previous Period)
const getRevenueComparison = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate!",
      });
    }

    const currentEnd = new Date(endDate);
    const currentStart = new Date(startDate);

    // Calculate the duration of the period
    const duration = currentEnd - currentStart;

    // Previous period: same duration, ending at currentStart
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);

    // Current period revenue
    const currentRevenue = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: currentStart,
            $lte: currentEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$estimatedRevenue" },
        },
      },
    ]);

    // Previous period revenue
    const previousRevenue = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: previousStart,
            $lte: previousEnd,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$estimatedRevenue" },
        },
      },
    ]);

    const current = currentRevenue.length > 0 ? currentRevenue[0].total : 0;
    const previous = previousRevenue.length > 0 ? previousRevenue[0].total : 0;

    const percentageChange =
      previous > 0 ? ((current - previous) / previous) * 100 : 0;

    res.json({
      success: true,
      data: {
        currentPeriod: {
          revenue: current,
          startDate: currentStart.toISOString(),
          endDate: currentEnd.toISOString(),
        },
        previousPeriod: {
          revenue: previous,
          startDate: previousStart.toISOString(),
          endDate: previousEnd.toISOString(),
        },
        percentageChange: parseFloat(percentageChange.toFixed(2)),
        isIncrease: current > previous,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueByDay,
  getTopEmployees,
  getTopTeams,
  getTopChannels,
  getRevenueComparison,
};
