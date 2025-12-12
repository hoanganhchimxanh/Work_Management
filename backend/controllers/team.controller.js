const db = require("../models");
const User = db.User;
const Account = db.Account;
const Team = db.Team;
const XLSX = require("xlsx");

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

// Import teams từ Excel
const importTeamExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng upload file Excel!" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "File Excel không có dữ liệu!" });
    }

    const session = await Team.startSession();
    session.startTransaction();

    const results = { success: [], errors: [], total: data.length };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        if (!row.name) {
          results.errors.push({
            row: rowNumber,
            error: "Thiếu tên team",
            data: row,
          });
          continue;
        }

        // Kiểm tra team đã tồn tại chưa
        const exist = await Team.findOne({
          name: row.name.trim(),
        }).session(session);

        if (exist) {
          results.errors.push({
            row: rowNumber,
            error: `Team "${row.name}" đã tồn tại`,
            data: row,
          });
          continue;
        }

        // Tìm leader nếu có
        let leaderId = null;
        if (row.leaderEmail) {
          const leader = await User.findOne({
            personalEmail: row.leaderEmail.trim().toLowerCase(),
          }).session(session);

          if (!leader) {
            results.errors.push({
              row: rowNumber,
              error: `Không tìm thấy leader với email ${row.leaderEmail}`,
              data: row,
            });
            continue;
          }
          leaderId = leader._id;
        }

        // Tìm members nếu có
        let memberIds = [];
        if (row.memberEmails) {
          const emails = row.memberEmails
            .split(",")
            .map((e) => e.trim().toLowerCase());

          const members = await User.find({
            personalEmail: { $in: emails },
          }).session(session);

          if (members.length !== emails.length) {
            results.errors.push({
              row: rowNumber,
              error: "Một số email member không tồn tại",
              data: row,
            });
            continue;
          }

          memberIds = members.map((m) => m._id);

          // Loại bỏ leader khỏi members nếu có
          if (leaderId) {
            memberIds = memberIds.filter(
              (id) => id.toString() !== leaderId.toString()
            );
          }
        }

        const status =
          row.status?.toUpperCase() === "UNAVAILABLE"
            ? "UNAVAILABLE"
            : "AVAILABLE";

        const newTeam = await Team.create(
          [
            {
              name: row.name.trim(),
              leader: leaderId,
              members: memberIds,
              status,
            },
          ],
          { session }
        );

        // Gán team cho users
        const userIds = [leaderId, ...memberIds].filter(Boolean);
        if (userIds.length > 0) {
          await User.updateMany(
            { _id: { $in: userIds } },
            { team: newTeam[0]._id },
            { session }
          );
        }

        results.success.push({
          row: rowNumber,
          teamId: newTeam[0]._id,
          name: newTeam[0].name,
          memberCount: memberIds.length,
        });
      } catch (err) {
        results.errors.push({ row: rowNumber, error: err.message, data: row });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: `Import hoàn tất: ${results.success.length}/${results.total} thành công`,
      data: results,
    });
  } catch (err) {
    return next(err);
  }
};

// Export teams ra Excel
const exportTeamExcel = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const teams = await Team.find(filter)
      .populate("leader", "fullName personalEmail")
      .populate("members", "fullName personalEmail")
      .sort({ createdAt: -1 })
      .lean();

    const excelData = teams.map((team, index) => ({
      STT: index + 1,
      "Tên Team": team.name,
      "Trạng thái": team.status,
      Leader: team.leader?.fullName || "",
      "Email Leader": team.leader?.personalEmail || "",
      "Số thành viên": team.members.length,
      "Danh sách thành viên": team.members.map((m) => m.fullName).join(", "),
      "Email thành viên": team.members.map((m) => m.personalEmail).join(", "),
      "Ngày tạo": new Date(team.createdAt).toLocaleDateString("vi-VN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");

    const columnWidths = [
      { wch: 5 }, // STT
      { wch: 25 }, // Tên Team
      { wch: 15 }, // Trạng thái
      { wch: 25 }, // Leader
      { wch: 30 }, // Email Leader
      { wch: 15 }, // Số thành viên
      { wch: 50 }, // Danh sách thành viên
      { wch: 50 }, // Email thành viên
      { wch: 15 }, // Ngày tạo
    ];
    worksheet["!cols"] = columnWidths;

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `teams_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// Export template Excel
const exportTeamTemplate = async (req, res, next) => {
  try {
    const templateData = [
      {
        name: "Team Marketing",
        leaderEmail: "nguyenvana@gmail.com",
        memberEmails: "tranthib@gmail.com,levanc@gmail.com",
        status: "AVAILABLE",
      },
      {
        name: "Team Content",
        leaderEmail: "phamthid@gmail.com",
        memberEmails: "hoangvane@gmail.com",
        status: "AVAILABLE",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    const instructionData = [
      {
        Cột: "name",
        "Mô tả": "Tên team",
        "Bắt buộc": "Có",
      },
      {
        Cột: "leaderEmail",
        "Mô tả": "Email của leader (phải tồn tại trong hệ thống)",
        "Bắt buộc": "Không",
      },
      {
        Cột: "memberEmails",
        "Mô tả": "Email các thành viên, phân cách bằng dấu phẩy",
        "Bắt buộc": "Không",
      },
      {
        Cột: "status",
        "Mô tả": "AVAILABLE / UNAVAILABLE (mặc định AVAILABLE)",
        "Bắt buộc": "Không",
      },
    ];

    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Hướng dẫn");

    worksheet["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 50 }, { wch: 15 }];
    instructionSheet["!cols"] = [{ wch: 20 }, { wch: 50 }, { wch: 15 }];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="team_import_template.xlsx"'
    );

    res.send(buffer);
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
  importTeamExcel,
  exportTeamExcel,
  exportTeamTemplate,
};
