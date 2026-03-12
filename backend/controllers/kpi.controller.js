const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Team = db.Team;
const KPI = db.KPI;

const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notification.service");

// ===== HELPERS =====

/**
 * Tính trạng thái KPI dựa trên ngày hiện tại
 */
const getKpiStatus = (kpi, now = new Date()) => {
  if (now >= new Date(kpi.startDate) && now <= new Date(kpi.endDate)) {
    return "ongoing";
  } else if (now > new Date(kpi.endDate)) {
    return "completed";
  }
  return "upcoming";
};

/**
 * Tính tiến độ thực tế của KPI (doanh thu + BKT)
 */
const calculateKpiProgress = async (kpi, now = new Date()) => {
  let actualRevenue = 0;
  let actualBkt = 0;

  const hasStarted = now >= new Date(kpi.startDate);
  if (!hasStarted) {
    return { actualRevenue, actualBkt, revenueProgress: 0, bktProgress: 0 };
  }

  try {
    // Xác định danh sách channels cần tính
    let channels = [];

    if (kpi.user) {
      channels = await db.Channel.find({
        assignedUser: kpi.user._id || kpi.user,
      }).lean();
    } else if (kpi.team) {
      const teamUsers = await db.User.find({
        team: kpi.team._id || kpi.team,
      }).lean();
      const userIds = teamUsers.map((u) => u._id);
      channels = await db.Channel.find({
        assignedUser: { $in: userIds },
      }).lean();
    }

    if (channels.length === 0) {
      return { actualRevenue, actualBkt, revenueProgress: 0, bktProgress: 0 };
    }

    const channelIds = channels.map((ch) => ch._id);

    // Tính tổng revenue
    const revenueData = await db.ChannelAnalytics.aggregate([
      {
        $match: {
          channel: { $in: channelIds },
          date: {
            $gte: new Date(kpi.startDate),
            $lte: new Date(kpi.endDate),
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

    actualRevenue = revenueData[0]?.totalRevenue || 0;

    // Đếm số kênh được BKT trong khoảng thời gian KPI
    actualBkt = channels.filter((ch) => {
      if (!ch.isMonetized || !ch.monetizeDate) return false;
      const monetizeDate = new Date(ch.monetizeDate);
      const kpiStart = new Date(kpi.startDate);
      const kpiEnd = new Date(kpi.endDate);
      return monetizeDate >= kpiStart && monetizeDate <= kpiEnd;
    }).length;
  } catch (error) {
    console.error("Error calculating KPI progress:", error);
  }

  const revenueProgress =
    kpi.revenueTarget > 0
      ? Math.min(100, Math.round((actualRevenue / kpi.revenueTarget) * 100))
      : 0;

  const bktProgress =
    kpi.bktTarget > 0
      ? Math.min(100, Math.round((actualBkt / kpi.bktTarget) * 100))
      : 0;

  return { actualRevenue, actualBkt, revenueProgress, bktProgress };
};

// Thêm KPI mới
const createNew = async (req, res, next) => {
  try {
    const { user, team, revenueTarget, bktTarget, startDate, endDate } =
      req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ngày bắt đầu hoặc ngày kết thúc!",
      });
    }

    if (!user && !team) {
      return res.status(400).json({
        success: false,
        message: "Phải chọn ít nhất một user hoặc team!",
      });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu!",
      });
    }

    let teamUserIds = [];

    // Kiểm tra user
    if (user) {
      const userDoc = await User.findById(user);
      if (!userDoc) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user!",
        });
      }
      teamUserIds = [user];
    }

    // Kiểm tra team
    if (team) {
      const teamDoc = await Team.findById(team).populate("members", "_id");
      if (!teamDoc) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy team!",
        });
      }
      teamUserIds = teamDoc.members.map((m) => m._id);
    }

    // Tạo KPI
    const newKPI = await KPI.create({
      user: user || null,
      team: team || null,
      revenueTarget: revenueTarget || 0,
      bktTarget: bktTarget || 0,
      startDate,
      endDate,
    });

    const populatedKPI = await KPI.findById(newKPI._id)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (teamUserIds.length === 1) {
      await sendNotification({
        userId: teamUserIds[0],
        title: "Bạn được giao KPI mới",
        message: "Một KPI mới vừa được tạo và gán cho bạn.",
        metadata: {
          kpiId: newKPI._id,
          startDate,
          endDate,
        },
      });
    } else if (teamUserIds.length > 1) {
      await sendBulkNotification({
        userIds: teamUserIds,
        title: "Team bạn được giao KPI mới",
        message: "Một KPI mới vừa được tạo cho team của bạn.",
        metadata: {
          kpiId: newKPI._id,
          startDate,
          endDate,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Tạo KPI thành công!",
      data: populatedKPI,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả KPI
const getAll = async (req, res, next) => {
  try {
    const { user, team, status } = req.query;

    // Build filter
    const filter = {};
    if (user) filter.user = user;
    if (team) filter.team = team;

    const kpis = await KPI.find(filter)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .sort({ startDate: -1 })
      .lean();

    // Thêm status (ongoing, completed, upcoming)
    const now = new Date();
    const kpisWithStatus = kpis.map((kpi) => {
      let kpiStatus = "upcoming";
      if (now >= new Date(kpi.startDate) && now <= new Date(kpi.endDate)) {
        kpiStatus = "ongoing";
      } else if (now > new Date(kpi.endDate)) {
        kpiStatus = "completed";
      }

      return {
        ...kpi,
        status: kpiStatus,
      };
    });

    // Filter by status nếu có
    const filteredKPIs = status
      ? kpisWithStatus.filter((k) => k.status === status)
      : kpisWithStatus;

    res.json({
      success: true,
      data: filteredKPIs,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy KPI theo ID
const getById = async (req, res, next) => {
  try {
    const kpiId = req.params.id;

    const kpi = await KPI.findById(kpiId)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .lean();

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy KPI!",
      });
    }

    // Thêm status
    const now = new Date();
    let status = "upcoming";
    if (now >= new Date(kpi.startDate) && now <= new Date(kpi.endDate)) {
      status = "ongoing";
    } else if (now > new Date(kpi.endDate)) {
      status = "completed";
    }

    res.json({
      success: true,
      data: {
        ...kpi,
        status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật KPI
const updateKPI = async (req, res, next) => {
  try {
    const kpiId = req.params.id;
    const { revenueTarget, bktTarget, startDate, endDate } = req.body;

    const kpi = await KPI.findById(kpiId);
    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy KPI!",
      });
    }

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    const newStartDate = startDate || kpi.startDate;
    const newEndDate = endDate || kpi.endDate;

    if (new Date(newEndDate) <= new Date(newStartDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu!",
      });
    }

    // Cập nhật các field
    if (revenueTarget !== undefined) kpi.revenueTarget = revenueTarget;
    if (bktTarget !== undefined) kpi.bktTarget = bktTarget;
    if (startDate) kpi.startDate = startDate;
    if (endDate) kpi.endDate = endDate;

    await kpi.save();

    const updatedKPI = await KPI.findById(kpiId)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật KPI thành công!",
      data: updatedKPI,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa KPI
const deleteKPI = async (req, res, next) => {
  try {
    const kpiId = req.params.id;

    const kpi = await KPI.findById(kpiId);
    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy KPI!",
      });
    }

    await KPI.findByIdAndDelete(kpiId);

    res.json({
      success: true,
      message: "Xóa KPI thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Lấy KPI của user hiện tại
const getMyKPIs = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Từ JWT token

    // Lấy thông tin user để biết team
    const user = await User.findById(userId).select("team").lean();

    // Tìm KPIs được gán cho user HOẶC team của user
    const filter = {
      $or: [{ user: userId }],
    };

    // Nếu user thuộc team nào thì thêm điều kiện tìm theo team
    if (user && user.team) {
      filter.$or.push({ team: user.team });
    }

    const kpis = await KPI.find(filter)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .sort({ startDate: -1 })
      .lean();

    // Thêm status
    const now = new Date();
    const kpisWithStatus = kpis.map((kpi) => {
      let status = "upcoming";
      if (now >= new Date(kpi.startDate) && now <= new Date(kpi.endDate)) {
        status = "ongoing";
      } else if (now > new Date(kpi.endDate)) {
        status = "completed";
      }

      return { ...kpi, status };
    });

    res.json({
      success: true,
      data: kpisWithStatus,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy KPI của team
const getTeamKPIs = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy team!",
      });
    }

    const kpis = await KPI.find({ team: teamId })
      .populate("user", "fullName phoneNumber")
      .sort({ startDate: -1 })
      .lean();

    // Thêm status
    const now = new Date();
    const kpisWithStatus = kpis.map((kpi) => {
      let status = "upcoming";
      if (now >= new Date(kpi.startDate) && now <= new Date(kpi.endDate)) {
        status = "ongoing";
      } else if (now > new Date(kpi.endDate)) {
        status = "completed";
      }

      return { ...kpi, status };
    });

    res.json({
      success: true,
      data: kpisWithStatus,
    });
  } catch (err) {
    next(err);
  }
};

const getAllWithProgress = async (req, res, next) => {
  try {
    const { user, team, status } = req.query;

    // Build filter
    const filter = {};
    if (user) filter.user = user;
    if (team) filter.team = team;

    const kpis = await KPI.find(filter)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .sort({ startDate: -1 })
      .lean();

    const now = new Date();

    const kpisWithProgressPromises = kpis.map(async (kpi) => {
      const kpiStatus = getKpiStatus(kpi, now);
      const progress = await calculateKpiProgress(kpi, now);

      return {
        ...kpi,
        status: kpiStatus,
        ...progress,
      };
    });

    const kpisWithProgress = await Promise.all(kpisWithProgressPromises);

    // Filter by status nếu có
    const filteredKPIs = status
      ? kpisWithProgress.filter((k) => k.status === status)
      : kpisWithProgress;

    res.json({
      success: true,
      data: filteredKPIs,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy KPI của user hiện tại với progress
const getMyKPIsWithProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Từ JWT token

    // Lấy thông tin user để biết team
    const user = await User.findById(userId).select("team").lean();

    // Tìm KPIs được gán cho user HOẶC team của user
    const filter = {
      $or: [{ user: userId }],
    };

    // Nếu user thuộc team nào thì thêm điều kiện tìm theo team
    if (user && user.team) {
      filter.$or.push({ team: user.team });
    }

    const kpis = await KPI.find(filter)
      .populate("user", "fullName phoneNumber role")
      .populate("team", "name")
      .sort({ startDate: -1 })
      .lean();

    const now = new Date();

    const kpisWithProgressPromises = kpis.map(async (kpi) => {
      const kpiStatus = getKpiStatus(kpi, now);
      const progress = await calculateKpiProgress(kpi, now);

      return {
        ...kpi,
        status: kpiStatus,
        ...progress,
      };
    });

    const kpisWithProgress = await Promise.all(kpisWithProgressPromises);

    res.json({
      success: true,
      data: kpisWithProgress,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getById,
  updateKPI,
  deleteKPI,
  getMyKPIs,
  getTeamKPIs,
  getAllWithProgress,
  getMyKPIsWithProgress,
};
