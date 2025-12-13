const db = require("../models");
const User = db.User;
const Account = db.Account;
const Channel = db.Channel;
const Team = db.Team;
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const sendEmail = require("../utils/mailer");
const XLSX = require("xlsx");
const sendNewAccountTemplate = require("../utils/emailTemplates/sendNewAccount");
const sendRejectTemplate = require("../utils/emailTemplates/sendReject");

// Tạo người dùng mới thủ công
const createNewUser = async (req, res, next) => {
  try {
    const { fullName, personalEmail, role, team } = req.body;

    // Validate tối thiểu
    if (!fullName || !personalEmail) {
      return res.status(400).json({
        success: false,
        message: "fullName và personalEmail là bắt buộc",
      });
    }

    // Check trùng email
    const existed = await User.findOne({ personalEmail });
    if (existed) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      personalEmail,
      role: role || "EMPLOYEE",
      status: "ACTIVE",
      team: team || null,
      isFirstLogin: true,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// Tạo người dùng mới (bởi user tự đăng ký)
const registerByUser = async (req, res, next) => {
  try {
    const { fullName, personalEmail } = req.body;

    if (!fullName || !personalEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ personalEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email cá nhân này đã được đăng ký!",
      });
    }

    // Tạo user với status PENDING
    const newUser = await User.create({
      fullName,
      personalEmail,
      role: "EMPLOYEE", // Mặc định
      status: "PENDING", // Chờ admin duyệt
      team: null,
      isFirstLogin: true,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng chờ admin phê duyệt.",
      data: {
        userId: newUser._id,
        fullName: newUser.fullName,
        personalEmail: newUser.personalEmail,
        status: newUser.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Tạo người dùng mới (bởi Admin)
const createByAdmin = async (req, res, next) => {
  try {
    const { fullName, personalEmail, role, team } = req.body;

    if (!fullName || !personalEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ personalEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email cá nhân này đã được sử dụng!",
      });
    }

    // Tạo user với status ACTIVE
    const newUser = await User.create({
      fullName,
      personalEmail,
      role: role || "EMPLOYEE",
      status: "ACTIVE",
      team: team || null,
      isFirstLogin: true,
    });

    // Tạo tài khoản đăng nhập tự động
    const loginEmail = `${personalEmail.split("@")[0]}@company.com`;
    const tempPassword = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      strict: true,
    });

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newAccount = await Account.create({
      email: loginEmail,
      password: hashedPassword,
      user: newUser._id,
      isActive: false, // INACTIVE cho đến khi user đổi mật khẩu
    });

    //Gửi mail về cho người dùng
    try {
      await sendEmail({
        to: newUser.personalEmail,
        subject: "Tài khoản đăng nhập hệ thống của bạn",
        text: "",
        html: sendNewAccountTemplate(
          newUser.fullName,
          loginEmail,
          tempPassword
        ),
        attachments: [],
      });
      console.log("Email tạo tài khoản đã được gửi!");
    } catch (mailErr) {
      console.error("Gửi email thất bại:", mailErr);
    }

    const populatedUser = await User.findById(newUser._id)
      .populate("team", "name")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo nhân viên thành công!",
      data: {
        user: populatedUser,
        account: {
          email: loginEmail,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin phê duyệt user đăng ký
const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, team } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    if (user.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "User này không ở trạng thái PENDING!",
      });
    }

    // Cập nhật user thành ACTIVE
    user.status = "ACTIVE";
    user.role = role || "EMPLOYEE";
    user.team = team || null;
    await user.save();

    // Tạo tài khoản đăng nhập
    const loginEmail = `${user.personalEmail.split("@")[0]}@company.com`;
    const tempPassword = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      strict: true,
    });

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newAccount = await Account.create({
      email: loginEmail,
      password: hashedPassword,
      user: user._id,
      isActive: false, // INACTIVE cho đến khi user đổi mật khẩu
    });

    // TODO: Gửi email cho user
    try {
      await sendEmail({
        to: user.personalEmail,
        subject: "Tài khoản đăng nhập hệ thống của bạn",
        text: "",
        html: sendNewAccountTemplate(user.fullName, loginEmail, tempPassword),
        attachments: [],
      });
      console.log("Email tạo tài khoản đã được gửi!");
    } catch (mailErr) {
      console.error("Gửi email thất bại:", mailErr);
    }

    const populatedUser = await User.findById(user._id)
      .populate("team", "name")
      .lean();

    res.json({
      success: true,
      message: "Phê duyệt thành công!",
      data: {
        user: populatedUser,
        account: {
          email: loginEmail,
          tempPassword, // Chỉ để testing
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin từ chối user đăng ký
const rejectUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    if (user.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "User này không ở trạng thái PENDING!",
      });
    }

    // Gửi email thông báo từ chối
    try {
      await sendEmail({
        to: user.personalEmail,
        subject: "Thông báo về đơn đăng ký của bạn",
        text: "",
        html: sendRejectTemplate(user.fullName),
        attachments: [],
      });
      console.log("Email từ chối đã được gửi!");
    } catch (mailErr) {
      console.error("Gửi email thất bại:", mailErr);
      // Vẫn tiếp tục xóa user ngay cả khi gửi email thất bại
    }

    // Xóa user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Đã từ chối và xóa user!",
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin toàn bộ người dùng
const getAll = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = { role: { $ne: "ADMIN" } }; // $ne = not equal

    if (status) {
      filter.status = status;
    }

    const users = await User.find(filter).populate("team", "name").lean();

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        // Lấy tài khoản đăng nhập của user
        const account = await Account.findOne({ user: user._id }).lean();

        // Lấy các kênh mà user đang quản lý
        const channels = await Channel.find({ assignedUser: user._id }).lean();

        return {
          userId: user._id,
          fullName: user.fullName,
          role: user.role,
          personalEmail: user.personalEmail,
          loginEmail: account ? account.email : null,
          hasAccount: !!account,
          accountIsActive: account ? account.isActive : false,
          status: user.status,
          team: user.team ? user.team.name : null,
          isFirstLogin: user.isFirstLogin,
          channelCount: channels.length,
          joinedAt: user.createdAt,
        };
      })
    );

    res.json({ success: true, data: usersWithDetails });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin của 1 người dùng theo ID
const getPersonal = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("team", "name").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    // Lấy tài khoản đăng nhập
    const account = await Account.findOne({ user: user._id }).lean();

    // Lấy các kênh mà user đang quản lý
    const channels = await Channel.find({ assignedUser: user._id })
      .populate("network", "name")
      .lean();

    res.json({
      success: true,
      data: {
        userId: user._id,
        fullName: user.fullName,
        role: user.role,
        personalEmail: user.personalEmail,
        loginEmail: account ? account.email : null,
        hasAccount: !!account,
        accountIsActive: account ? account.isActive : false,
        status: user.status,
        team: user.team ? user.team.name : null,
        isFirstLogin: user.isFirstLogin,
        channels: channels.map((ch) => ({
          channelId: ch._id,
          name: ch.name,
          link: ch.link,
          status: ch.status,
          channelEmail: ch.channelEmail,
          network: ch.network ? ch.network.name : null,
          subscriber: ch.subscriber,
        })),
        channelCount: channels.length,
        joinedAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin user
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { fullName, personalEmail, role, status, team } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // Cập nhật các field nếu có
    if (fullName) user.fullName = fullName;
    if (personalEmail) user.personalEmail = personalEmail;
    if (role) user.role = role;
    if (status) user.status = status;
    if (team !== undefined) user.team = team;

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("team", "name")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa user (soft delete - chuyển status thành QUIT)
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    user.status = "QUIT";
    await user.save();

    // Vô hiệu hóa tài khoản đăng nhập của user
    await Account.updateOne({ user: userId }, { isActive: false });

    res.json({
      success: true,
      message: "Xóa người dùng thành công!",
    });
  } catch (err) {
    next(err);
  }
};

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
      "Lần đăng nhập đầu": user.isFirstLogin ? "Chưa" : "Rồi",
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

module.exports = {
  createNewUser,
  registerByUser,
  createByAdmin,
  approveUser,
  rejectUser,
  getAll,
  getPersonal,
  updateUser,
  deleteUser,
  importUserExcel,
  exportUserExcel,
  exportUserTemplate,
};
