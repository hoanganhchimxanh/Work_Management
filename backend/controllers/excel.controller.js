const db = require("../models");
const User = db.User;
const Account = db.Account;
const Team = db.Team;
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const XLSX = require("xlsx");

// Import users từ Excel
const importUserExcel = async (req, res, next) => {
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

    const session = await User.startSession();
    session.startTransaction();

    const results = { success: [], errors: [], total: data.length };

    // Load teams 1 lần
    const teams = await Team.find().lean();
    const teamMap = Object.fromEntries(
      teams.map((t) => [t.name.trim(), t._id])
    );

    const allowedRoles = ["ADMIN", "ACCOUNTANT", "EMPLOYEE"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        if (!row.fullName || !row.personalEmail) {
          results.errors.push({
            row: rowNumber,
            error: "Thiếu fullName hoặc personalEmail",
            data: row,
          });
          continue;
        }

        if (!emailRegex.test(row.personalEmail)) {
          results.errors.push({
            row: rowNumber,
            error: "Email không hợp lệ",
            data: row,
          });
          continue;
        }

        const exist = await User.findOne({
          personalEmail: row.personalEmail,
        }).session(session);
        if (exist) {
          results.errors.push({
            row: rowNumber,
            error: `Email ${row.personalEmail} đã tồn tại`,
            data: row,
          });
          continue;
        }

        let teamId = null;
        if (row.teamName) {
          if (!teamMap[row.teamName.trim()]) {
            results.errors.push({
              row: rowNumber,
              error: `Team "${row.teamName}" không tồn tại`,
              data: row,
            });
            continue;
          }
          teamId = teamMap[row.teamName.trim()];
        }

        const role = allowedRoles.includes(row.role?.toUpperCase())
          ? row.role.toUpperCase()
          : "EMPLOYEE";

        const newUser = await User.create(
          [
            {
              fullName: row.fullName.trim(),
              personalEmail: row.personalEmail.trim().toLowerCase(),
              role,
              status: "ACTIVE",
              team: teamId,
              isFirstLogin: true,
            },
          ],
          { session }
        );

        let loginEmailBase = row.personalEmail.split("@")[0];
        let loginEmail = `${loginEmailBase}@company.com`;
        let counter = 2;

        // tránh trùng login email
        while (await Account.findOne({ email: loginEmail }).session(session)) {
          loginEmail = `${loginEmailBase}.${counter}@company.com`;
          counter++;
        }

        const tempPassword = generator.generate({
          length: 10,
          numbers: true,
          uppercase: true,
          lowercase: true,
          symbols: false,
          strict: true,
        });

        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await Account.create(
          [
            {
              email: loginEmail,
              password: hashedPassword,
              user: newUser[0]._id,
              isActive: false,
            },
          ],
          { session }
        );

        results.success.push({
          row: rowNumber,
          userId: newUser[0]._id,
          fullName: newUser[0].fullName,
          personalEmail: newUser[0].personalEmail,
          loginEmail,
          tempPassword,
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

// Export users ra Excel
const exportUserExcel = async (req, res, next) => {
  try {
    const { status, role, teamId } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (teamId) filter.team = teamId;

    // Lấy users với populate
    const users = await User.find(filter)
      .populate("team", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Lấy thêm thông tin account cho mỗi user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const account = await Account.findOne({ user: user._id }).lean();
        return {
          ...user,
          loginEmail: account?.email || "",
          accountIsActive: account?.isActive || false,
        };
      })
    );

    // Chuẩn bị data cho Excel
    const excelData = usersWithDetails.map((user, index) => ({
      STT: index + 1,
      "Họ và tên": user.fullName,
      "Email cá nhân": user.personalEmail,
      "Email đăng nhập": user.loginEmail,
      "Vai trò": user.role,
      "Trạng thái": user.status,
      Team: user.team?.name || "",
      "Tài khoản hoạt động": user.accountIsActive ? "Có" : "Không",
      "Lần đăng nhập đầu": user.isFirstLogin ? "Có" : "Không",
      "Ngày tham gia": new Date(user.createdAt).toLocaleDateString("vi-VN"),
    }));

    // Tạo workbook và worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // STT
      { wch: 25 }, // Họ và tên
      { wch: 30 }, // Email cá nhân
      { wch: 30 }, // Email đăng nhập
      { wch: 12 }, // Vai trò
      { wch: 12 }, // Trạng thái
      { wch: 20 }, // Team
      { wch: 15 }, // Tài khoản hoạt động
      { wch: 15 }, // Lần đăng nhập đầu
      { wch: 15 }, // Ngày tham gia
    ];
    worksheet["!cols"] = columnWidths;

    // Xuất ra buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers cho response
    const filename = `users_${new Date().toISOString().split("T")[0]}.xlsx`;
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

// Export template Excel (để user có thể download mẫu import)
const exportUserTemplate = async (req, res, next) => {
  try {
    // Dữ liệu mẫu
    const templateData = [
      {
        fullName: "Nguyễn Văn A",
        personalEmail: "nguyenvana@gmail.com",
        role: "EMPLOYEE",
        teamName: "Team Marketing",
      },
      {
        fullName: "Trần Thị B",
        personalEmail: "tranthib@gmail.com",
        role: "EMPLOYEE",
        teamName: "Team Content",
      },
    ];

    // Tạo worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Thêm ghi chú vào header
    const headers = [
      { v: "fullName", c: [{ t: "Họ và tên (bắt buộc)" }] },
      { v: "personalEmail", c: [{ t: "Email cá nhân (bắt buộc, duy nhất)" }] },
      {
        v: "role",
        c: [{ t: "Vai trò: ADMIN, ACCOUNTANT, EMPLOYEE (mặc định EMPLOYEE)" }],
      },
      { v: "teamName", c: [{ t: "Tên team (phải tồn tại trong hệ thống)" }] },
    ];

    // Thêm sheet hướng dẫn
    const instructionData = [
      { Cột: "fullName", "Mô tả": "Họ và tên đầy đủ", "Bắt buộc": "Có" },
      {
        Cột: "personalEmail",
        "Mô tả": "Email cá nhân (duy nhất)",
        "Bắt buộc": "Có",
      },
      {
        Cột: "role",
        "Mô tả": "ADMIN / ACCOUNTANT / EMPLOYEE",
        "Bắt buộc": "Không (mặc định EMPLOYEE)",
      },
      {
        Cột: "teamName",
        "Mô tả": "Tên team trong hệ thống",
        "Bắt buộc": "Không",
      },
    ];

    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Hướng dẫn");

    // Set column widths
    worksheet["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];

    instructionSheet["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 15 }];

    // Xuất ra buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="user_import_template.xlsx"'
    );

    res.send(buffer);
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
  importUserExcel,
  exportUserExcel,
  exportUserTemplate,
  importTeamExcel,
  exportTeamExcel,
  exportTeamTemplate,
};
