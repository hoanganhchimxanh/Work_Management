const db = require("../models");
const User = db.User;
const Account = db.Account;
const Team = db.Team;

// Tạo đội mới
const createNew = async (req, res, next) => {
  try {
    const { name, leader, members = [], status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên team là bắt buộc!",
      });
    }

    // Validate leader
    if (leader) {
      const leaderExists = await User.findById(leader);
      if (!leaderExists) {
        return res.status(404).json({
          success: false,
          message: "Leader không tồn tại!",
        });
      }
    }

    // Validate members
    if (members.length > 0) {
      const count = await User.countDocuments({ _id: { $in: members } });
      if (count !== members.length) {
        return res.status(400).json({
          success: false,
          message: "Danh sách members chứa user không hợp lệ!",
        });
      }
    }

    // Tạo team
    const newTeam = await Team.create({
      name,
      leader,
      members,
      status,
    });

    // Gán team cho user
    const userIds = [leader, ...members].filter(Boolean);

    if (userIds.length > 0) {
      await User.updateMany({ _id: { $in: userIds } }, { team: newTeam._id });
    }

    res.status(201).json({
      success: true,
      data: newTeam,
    });
  } catch (err) {
    next(err);
  }
};

// Xem thông tin của tất cả các đội
const getAll = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate({
        path: "leader",
        select: "fullName role status",
      })
      .populate({
        path: "members",
        select: "fullName role status",
      })
      .sort({ createdAt: -1 });

    const formatted = teams.map((team) => ({
      _id: team._id,
      name: team.name,
      status: team.status,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,

      leader: team.leader
        ? {
            _id: team.leader._id,
            fullName: team.leader.fullName,
            role: team.leader.role,
            status: team.leader.status,
          }
        : null,

      members: team.members.map((m) => ({
        _id: m._id,
        fullName: m.fullName,
        role: m.role,
        status: m.status,
      })),

      memberCount: team.members.length,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const teamId = req.params.id;

    const team = await Team.findById(teamId)
      .populate({
        path: "leader",
        select: "fullName role status",
      })
      .populate({
        path: "members",
        select: "fullName role status",
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team không tồn tại!",
      });
    }

    const formatted = {
      _id: team._id,
      name: team.name,
      status: team.status,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,

      leader: team.leader
        ? {
            _id: team.leader._id,
            fullName: team.leader.fullName,
            role: team.leader.role,
            status: team.leader.status,
          }
        : null,

      members: team.members.map((m) => ({
        _id: m._id,
        fullName: m.fullName,
        role: m.role,
        status: m.status,
      })),

      memberCount: team.members.length,
    };

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// Sửa thông tin của đội
const editInfo = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const { name, leader, members = [], status } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team không tồn tại!",
      });
    }

    // 1. Validate leader mới (nếu gửi lên)
    let oldLeader = team.leader;
    let newLeader = leader !== undefined ? leader : oldLeader;

    if (newLeader) {
      const leaderExists = await User.findById(newLeader);
      if (!leaderExists) {
        return res.status(400).json({
          success: false,
          message: "Leader không tồn tại!",
        });
      }
    }

    // 2. Validate danh sách members
    if (members.length > 0) {
      const count = await User.countDocuments({ _id: { $in: members } });
      if (count !== members.length) {
        return res.status(400).json({
          success: false,
          message: "Danh sách members không hợp lệ!",
        });
      }
    }

    // Không để leader nằm trong danh sách members
    const cleanMembers = newLeader
      ? members.filter((m) => m !== newLeader)
      : members;

    // --- TÍNH TOÁN USERS CŨ & USERS MỚI ---

    const oldUserIds = [oldLeader, ...team.members].filter(Boolean);
    const newUserIds = [newLeader, ...cleanMembers].filter(Boolean);

    const removedUsers = oldUserIds.filter((id) => !newUserIds.includes(id));
    const addedUsers = newUserIds.filter((id) => !oldUserIds.includes(id));

    // 3. Gỡ team khỏi user bị xóa
    if (removedUsers.length > 0) {
      await User.updateMany({ _id: { $in: removedUsers } }, { team: null });
    }

    // 4. Gán team cho user mới thêm
    if (addedUsers.length > 0) {
      await User.updateMany({ _id: { $in: addedUsers } }, { team: teamId });
    }

    // 5. Update team info
    team.name = name ?? team.name;
    team.leader = newLeader;
    team.members = cleanMembers;
    team.status = status;

    await team.save();

    res.json({
      success: true,
      data: team,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa đội
const deleteTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team không tồn tại!",
      });
    }

    // Gỡ team khỏi tất cả user
    const userIds = [team.leader, ...team.members].filter(Boolean);

    if (userIds.length > 0) {
      await User.updateMany({ _id: { $in: userIds } }, { team: null });
    }

    await team.deleteOne();

    res.json({
      success: true,
      message: "Xóa team thành công!",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getById,
  editInfo,
  deleteTeam,
};
