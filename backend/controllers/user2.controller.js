const db = require("../models");
const User = db.User;
const Account = db.Account;
const Channel = db.Channel;
const Team = db.Team;
const Network = db.Network;
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const mongoose = require("mongoose");
const sendEmail = require("../utils/mailer");
const sendNewAccountTemplate = require("../utils/emailTemplates/sendNewAccount");
const sendRejectTemplate = require("../utils/emailTemplates/sendReject");

// ============================================
// CREATE USER - Manual (Admin tạo thủ công)
// ============================================
const createNewUser = async (req, res, next) => {
  try {
    const {
      fullName,
      role,
      team,
      phoneNumber,
      birthday,
      facebookUrl,
      joinDate,
      department,
      bankAccount,
      note,
    } = req.body;

    // Validate tối thiểu
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "fullName là bắt buộc",
      });
    }

    // Create user với thông tin đầy đủ
    const user = await User.create({
      fullName,
      role: role || "EMPLOYEE",
      status: "ACTIVE",
      team: team || null,
      phoneNumber: phoneNumber || "",
      birthday: birthday || null,
      facebookUrl: facebookUrl || "",
      joinDate: joinDate || Date.now(),
      department: department || "OTHER",
      bankAccount: bankAccount || { accountNumber: "", bankName: "" },
      note: note || "",
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

// ============================================
// REGISTER BY USER (User tự đăng ký)
// ============================================
const registerByUser = async (req, res, next) => {
  try {
    const { fullName, phoneNumber } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Tạo user với status PENDING (chờ admin duyệt)
    const newUser = await User.create({
      fullName,
      phoneNumber: phoneNumber || "",
      role: "EMPLOYEE",
      status: "PENDING",
      team: null,
      department: "OTHER",
      isFirstLogin: true,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng chờ admin phê duyệt.",
      data: {
        userId: newUser._id,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        status: newUser.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// CREATE BY ADMIN (Admin tạo và gửi email)
// ============================================
const createByAdmin = async (req, res, next) => {
  try {
    const {
      fullName,
      email, // Email để tạo account đăng nhập
      role,
      team,
      phoneNumber,
      birthday,
      facebookUrl,
      joinDate,
      department,
      bankAccount,
      note,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Kiểm tra email đã tồn tại chưa (trong Account)
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng!",
      });
    }

    // Tạo user với status ACTIVE
    const newUser = await User.create({
      fullName,
      role: role || "EMPLOYEE",
      status: "ACTIVE",
      team: team || null,
      phoneNumber: phoneNumber || "",
      birthday: birthday || null,
      facebookUrl: facebookUrl || "",
      joinDate: joinDate || Date.now(),
      department: department || "OTHER",
      bankAccount: bankAccount || { accountNumber: "", bankName: "" },
      note: note || "",
      isFirstLogin: true,
    });

    // Tạo tài khoản đăng nhập tự động
    const tempPassword = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      strict: true,
    });

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await Account.create({
      email,
      password: hashedPassword,
      user: newUser._id,
      isActive: true,
    });

    // Gửi mail về cho người dùng
    try {
      await sendEmail({
        to: email,
        subject: "Tài khoản đăng nhập hệ thống của bạn",
        text: "",
        html: sendNewAccountTemplate(newUser.fullName, email, tempPassword),
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
          email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// APPROVE USER (Admin phê duyệt user đăng ký)
// ============================================
const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, team, email, department } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc để tạo tài khoản đăng nhập!",
      });
    }

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

    // Kiểm tra email đã tồn tại chưa
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng!",
      });
    }

    // Cập nhật user thành ACTIVE
    user.status = "ACTIVE";
    user.role = role || "EMPLOYEE";
    user.team = team || null;
    user.department = department || "OTHER";
    await user.save();

    // Tạo tài khoản đăng nhập
    const tempPassword = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      strict: true,
    });

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await Account.create({
      email,
      password: hashedPassword,
      user: user._id,
      isActive: true,
    });

    // Gửi email cho user
    try {
      await sendEmail({
        to: email,
        subject: "Tài khoản đăng nhập hệ thống của bạn",
        text: "",
        html: sendNewAccountTemplate(user.fullName, email, tempPassword),
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
          email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// REJECT USER (Admin từ chối user đăng ký)
// ============================================
const rejectUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason, notificationEmail } = req.body;

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

    // Gửi email thông báo từ chối (nếu có email)
    if (notificationEmail) {
      try {
        await sendEmail({
          to: notificationEmail,
          subject: "Thông báo về đơn đăng ký của bạn",
          text: "",
          html: sendRejectTemplate(user.fullName, reason),
          attachments: [],
        });
        console.log("Email từ chối đã được gửi!");
      } catch (mailErr) {
        console.error("Gửi email thất bại:", mailErr);
      }
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

// ============================================
// GET ALL USERS
// ============================================
const getAll = async (req, res, next) => {
  try {
    const { status, role, department } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter).populate("team", "name").lean();

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        // Lấy tài khoản đăng nhập của user
        const account = await Account.findOne({ user: user._id }).lean();

        // Lấy các kênh mà user đang quản lý
        const channels = await Channel.find({ assignedUser: user._id }).lean();

        // Lấy các network mà user đang quản lý
        const networks = await Network.find({ employment: user._id }).lean();

        // Lấy các resource mà user đang quản lý
        const resources = await db.Resource.find({
          assignedUser: user._id,
        }).lean();

        return {
          userId: user._id,
          fullName: user.fullName,
          role: user.role,
          status: user.status,

          // Thông tin cá nhân
          phoneNumber: user.phoneNumber || "",
          birthday: user.birthday || null,
          facebookUrl: user.facebookUrl || "",

          // Thông tin công việc
          joinDate: user.joinDate || user.createdAt,
          department: user.department || "OTHER",
          team: user.team ? user.team.name : null,
          teamId: user.team ? user.team._id : null,

          // Thông tin tài chính
          bankAccount: user.bankAccount || {
            accountNumber: "",
            bankName: "",
          },

          // Account info
          loginEmail: account ? account.email : null,
          hasAccount: !!account,
          accountIsActive: account ? account.isActive : false,
          isFirstLogin: user.isFirstLogin,

          // Số lượng tài nguyên quản lý
          channelCount: channels.length,
          networkCount: networks.length,
          resourceCount: resources.length,

          // Metadata
          note: user.note || "",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      })
    );

    res.json({ success: true, data: usersWithDetails });
  } catch (err) {
    next(err);
  }
};

// ============================================
// GET PERSONAL (Chi tiết 1 user)
// ============================================
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
      .populate("network", "pubId")
      .lean();

    // Lấy các network mà user đang quản lý
    const networks = await Network.find({ employment: user._id }).lean();

    // Lấy các resource mà user đang quản lý
    const resources = await db.Resource.find({ assignedUser: user._id }).lean();

    res.json({
      success: true,
      data: {
        // Thông tin cơ bản
        userId: user._id,
        fullName: user.fullName,
        role: user.role,
        status: user.status,

        // Thông tin cá nhân
        phoneNumber: user.phoneNumber || "",
        birthday: user.birthday || null,
        facebookUrl: user.facebookUrl || "",

        // Thông tin công việc
        joinDate: user.joinDate || user.createdAt,
        department: user.department || "OTHER",
        team: user.team
          ? {
              _id: user.team._id,
              name: user.team.name,
            }
          : null,

        // Thông tin tài chính
        bankAccount: user.bankAccount || {
          accountNumber: "",
          bankName: "",
        },

        // Account info
        loginEmail: account ? account.email : null,
        hasAccount: !!account,
        accountIsActive: account ? account.isActive : false,
        isFirstLogin: user.isFirstLogin,

        // Channels
        channels: channels.map((ch) => ({
          channelId: ch._id,
          name: ch.name,
          link: ch.link,
          status: ch.status,
          network: ch.network ? ch.network.pubId : null,
          isBrandAccount: ch.isBrandAccount,
          isMonetized: ch.isMonetized,
        })),
        channelCount: channels.length,

        // Networks
        networks: networks.map((nw) => ({
          networkId: nw._id,
          pubId: nw.pubId,
          status: nw.status,
          note: nw.note,
        })),
        networkCount: networks.length,

        // Resources
        resourceCount: resources.length,

        // Metadata
        note: user.note || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// UPDATE USER
// ============================================
const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const {
      fullName,
      role,
      status,
      team,
      phoneNumber,
      birthday,
      facebookUrl,
      joinDate,
      department,
      bankAccount,
      note,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // Cập nhật các field nếu có
    if (fullName !== undefined) user.fullName = fullName;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (team !== undefined) user.team = team;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (birthday !== undefined) user.birthday = birthday;
    if (facebookUrl !== undefined) user.facebookUrl = facebookUrl;
    if (joinDate !== undefined) user.joinDate = joinDate;
    if (department !== undefined) user.department = department;
    if (bankAccount !== undefined) user.bankAccount = bankAccount;
    if (note !== undefined) user.note = note;

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

// ============================================
// DELETE USER (Soft delete - chuyển status thành QUIT)
// ============================================
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

// ============================================
// DELETE SELF ACCOUNT (User tự xóa tài khoản)
// ============================================
const deleteSelfAccount = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId; // Từ JWT token
    const { confirmPassword } = req.body;

    // 1. Kiểm tra user tồn tại
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // 2. Kiểm tra role (chỉ cho phép EMPLOYEE và ACCOUNTANT)
    if (user.role === "ADMIN") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "Admin không được phép tự xóa tài khoản!",
      });
    }

    // 3. Xác thực mật khẩu (nếu có)
    if (confirmPassword) {
      const account = await Account.findOne({ user: userId }).session(session);
      if (account) {
        const isPasswordValid = await bcrypt.compare(
          confirmPassword,
          account.password
        );
        if (!isPasswordValid) {
          await session.abortTransaction();
          session.endSession();
          return res.status(401).json({
            success: false,
            message: "Mật khẩu không chính xác!",
          });
        }
      }
    }

    // 4. Lấy thông tin liên quan để log
    const relatedData = {
      channels: await Channel.countDocuments({ assignedUser: userId }).session(
        session
      ),
      networks: await Network.countDocuments({ employment: userId }).session(
        session
      ),
      resources: await db.Resource.countDocuments({
        assignedUser: userId,
      }).session(session),
      tasks: await db.Task.countDocuments({ assignedToUser: userId }).session(
        session
      ),
      kpis: await db.KPI.countDocuments({ user: userId }).session(session),
    };

    console.log(`[DELETE ACCOUNT] User ${user.fullName}:`, relatedData);

    // 5. Xóa Account
    await Account.deleteMany({ user: userId }, { session });

    // 6. Xử lý Channel - Gỡ assignedUser (không xóa channel)
    await Channel.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" } },
      { session }
    );

    // 7. Xử lý Network - Gỡ employment (không xóa network)
    await Network.updateMany(
      { employment: userId },
      { $unset: { employment: "" } },
      { session }
    );

    // 8. Xử lý Resource - Gỡ assignedUser và chuyển về AVAILABLE
    await db.Resource.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" }, status: "AVAILABLE" },
      { session }
    );

    // 9. Xử lý ResourceBatch
    await db.ResourceBatch.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" } },
      { session }
    );

    // 10. Xử lý Team
    await Team.updateMany(
      { members: userId },
      { $pull: { members: userId } },
      { session }
    );

    await Team.updateMany(
      { leader: userId },
      { $unset: { leader: "" } },
      { session }
    );

    // 11. Xử lý Task - Gỡ assignedToUser
    await db.Task.updateMany(
      { assignedToUser: userId },
      { $unset: { assignedToUser: "" } },
      { session }
    );

    // 12. Xóa KPI cá nhân
    await db.KPI.deleteMany({ user: userId }, { session });

    // 13. Xóa YoutubeAuth
    await db.YoutubeAuth.deleteMany({ user: userId }, { session });

    // 14. Xóa Notification
    await db.Notification.deleteMany({ user: userId }, { session });

    // 15. Cuối cùng, xóa User
    await User.findByIdAndDelete(userId, { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 16. Gửi email thông báo (optional)
    const account = await Account.findOne({ user: userId });
    if (account) {
      try {
        await sendEmail({
          to: account.email,
          subject: "Xác nhận xóa tài khoản",
          text: "",
          html: `
            <h2>Tài khoản của bạn đã được xóa</h2>
            <p>Xin chào ${user.fullName},</p>
            <p>Tài khoản của bạn tại hệ thống đã được xóa thành công vào lúc ${new Date().toLocaleString(
              "vi-VN"
            )}.</p>
            <p>Nếu đây không phải là hành động của bạn, vui lòng liên hệ với quản trị viên ngay lập tức.</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ quản lý</p>
          `,
          attachments: [],
        });
      } catch (mailErr) {
        console.error("Gửi email thông báo thất bại:", mailErr);
      }
    }

    res.json({
      success: true,
      message: "Xóa tài khoản thành công!",
      data: {
        deletedUser: {
          userId: user._id,
          fullName: user.fullName,
        },
        relatedDataRemoved: relatedData,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("[DELETE ACCOUNT ERROR]", err);
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
  deleteSelfAccount,
};
