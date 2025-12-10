const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Team = db.Team;
const KPI = db.KPI;

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

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu!",
      });
    }

    // Kiểm tra user có tồn tại không (nếu có)
    if (user) {
      const userDoc = await User.findById(user);
      if (!userDoc) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user!",
        });
      }
    }

    // Kiểm tra team có tồn tại không (nếu có)
    if (team) {
      const teamDoc = await Team.findById(team);
      if (!teamDoc) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy team!",
        });
      }
    }

    const newKPI = await KPI.create({
      user: user || null,
      team: team || null,
      revenueTarget: revenueTarget || 0,
      bktTarget: bktTarget || 0,
      startDate,
      endDate,
    });

    const populatedKPI = await KPI.findById(newKPI._id)
      .populate("user", "fullName personalEmail role")
      .populate("team", "name")
      .lean();

    res.status(201).json({
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
      .populate("user", "fullName personalEmail role")
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
      .populate("user", "fullName personalEmail role")
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
      .populate("user", "fullName personalEmail role")
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

    const kpis = await KPI.find({ user: userId })
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
      .populate("user", "fullName personalEmail")
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

module.exports = {
  createNew,
  getAll,
  getById,
  updateKPI,
  deleteKPI,
  getMyKPIs,
  getTeamKPIs,
};
