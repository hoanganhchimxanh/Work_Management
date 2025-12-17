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

    // Calculate total revenue for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const revenueResult = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
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
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Revenue by Month
const getRevenueByMonth = async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const revenueByMonth = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          revenue: { $sum: "$estimatedRevenue" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: 1,
        },
      },
    ]);

    // Fill missing months with 0
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));

    revenueByMonth.forEach((item) => {
      allMonths[item.month - 1].revenue = item.revenue;
    });

    res.json({
      success: true,
      data: allMonths,
    });
  } catch (err) {
    next(err);
  }
};

// Get Top Employees by Revenue
const getTopEmployees = async (req, res, next) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;

    // Default to current month if no date range provided
    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

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

    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

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

    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

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
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month revenue
    const currentRevenue = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: currentMonthStart,
            $lte: currentMonthEnd,
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

    // Previous month revenue
    const previousRevenue = await ChannelAnalytics.aggregate([
      {
        $match: {
          date: {
            $gte: previousMonthStart,
            $lte: previousMonthEnd,
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
        currentMonth: current,
        previousMonth: previous,
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
  getRevenueByMonth,
  getTopEmployees,
  getTopTeams,
  getTopChannels,
  getRevenueComparison,
};
