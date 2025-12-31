const db = require("../models");
const User = db.User;
const Account = db.Account;
const Channel = db.Channel;
const Team = db.Team;
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const sendEmail = require("../utils/mailer");
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

    // Tạo account - không cần lưu vào biến nếu không dùng
    await Account.create({
      email: loginEmail,
      password: hashedPassword,
      user: newUser._id,
      isActive: true, // ✅ Đã sửa thành true
    });

    // Gửi mail về cho người dùng
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

    // Tạo account - không cần lưu vào biến nếu không dùng
    await Account.create({
      email: loginEmail,
      password: hashedPassword,
      user: user._id,
      isActive: true, // ✅ Đã sửa thành true
    });

    // Gửi email cho user
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
        team: user.team
          ? {
              _id: user.team._id,
              name: user.team.name,
            }
          : null,
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
      networks: await Network.countDocuments({ assignedUser: userId }).session(
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

    console.log(
      `[DELETE ACCOUNT] User ${user.fullName} (${user.personalEmail}):`,
      relatedData
    );

    // 5. Xóa Account
    await Account.deleteMany({ user: userId }, { session });

    // 6. Xử lý Channel - Gỡ assignedUser (không xóa channel)
    await Channel.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" } },
      { session }
    );

    // 7. Xử lý Network - Gỡ assignedUser (không xóa network)
    await Network.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" } },
      { session }
    );

    // 8. Xử lý Resource - Gỡ assignedUser và chuyển về AVAILABLE
    await db.Resource.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" }, status: "AVAILABLE" },
      { session }
    );

    // 9. Xử lý Team
    // Gỡ user khỏi members
    await Team.updateMany(
      { members: userId },
      { $pull: { members: userId } },
      { session }
    );

    // Gỡ user khỏi leader (set null)
    await Team.updateMany(
      { leader: userId },
      { $unset: { leader: "" } },
      { session }
    );

    // 10. Xử lý Task - Gỡ assignedToUser (không xóa task)
    await db.Task.updateMany(
      { assignedToUser: userId },
      { $unset: { assignedToUser: "" } },
      { session }
    );

    // 11. Xóa KPI cá nhân (không xóa KPI của team)
    await db.KPI.deleteMany({ user: userId }, { session });

    // 12. Xóa YoutubeAuth
    await db.YoutubeAuth.deleteMany({ user: userId }, { session });

    // 13. Xóa Notification
    await db.Notification.deleteMany({ recipient: userId }, { session });

    // 14. Cuối cùng, xóa User
    await User.findByIdAndDelete(userId, { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 15. Gửi email thông báo (optional)
    try {
      await sendEmail({
        to: user.personalEmail,
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

    res.json({
      success: true,
      message: "Xóa tài khoản thành công!",
      data: {
        deletedUser: {
          userId: user._id,
          fullName: user.fullName,
          personalEmail: user.personalEmail,
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
