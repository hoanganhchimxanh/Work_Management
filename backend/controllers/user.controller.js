const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Account = db.Account;
const Channel = db.Channel;
const Team = db.Team;
const bcrypt = require("bcrypt");
const generator = require("generate-password");

const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notification.service");

// Tạo người dùng mới (bởi Admin)
const createByAdmin = async (req, res, next) => {
  try {
    const {
      fullName,
      phoneNumber,
      facebookLink,
      bankInfo,
      role,
      team,
      joinDate,
      responsibilities,
      note,
      loginEmail,
    } = req.body;

    if (!fullName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại này đã được sử dụng!",
      });
    }

    // Kiểm tra email đăng nhập đã tồn tại chưa (nếu có gửi lên)
    if (loginEmail) {
      const existingAccount = await Account.findOne({ email: loginEmail });
      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: "Email đăng nhập đã được sử dụng!",
        });
      }
    }

    // Tạo user với status ACTIVE
    const newUser = await User.create({
      fullName,
      phoneNumber,
      facebookLink: facebookLink || null,
      bankInfo: bankInfo || { bankName: null, accountNumber: null },
      role: role || "EMPLOYEE",
      status: "ACTIVE",
      team: team || null,
      joinDate: joinDate || new Date(),
      responsibilities: responsibilities || null,
      note: note || null,
      isFirstLogin: true,
    });

    // Cập nhật members array trong Team (nếu có chọn team)
    if (team) {
      await Team.findByIdAndUpdate(team, { $addToSet: { members: newUser._id } });
    }

    // Tạo tài khoản đăng nhập tự động (nếu có loginEmail)
    let accountData = null;
    if (loginEmail) {

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
        email: loginEmail,
        password: hashedPassword,
        user: newUser._id,
        isActive: true,
      });

      accountData = {
        email: loginEmail,
        tempPassword: tempPassword,
      };

      // Gửi thông báo cho từng admin về tài khoản mới
      try {
        const admins = await User.find({ role: "ADMIN" }).lean();

        if (admins.length > 0) {
          // Gửi notification riêng lẻ cho từng admin
          const notificationPromises = admins.map((admin) =>
            sendNotification({
              userId: admin._id,
              title: "Tài khoản mới được tạo",
              message: `Nhân viên ${fullName} (${phoneNumber}) đã được tạo tài khoản đăng nhập.\nEmail: ${loginEmail}\nMật khẩu tạm: ${tempPassword}`,
              type: "SYSTEM",
              metadata: {
                userId: newUser._id,
                userName: fullName,
                phoneNumber: phoneNumber,
                loginEmail: loginEmail,
                tempPassword: tempPassword,
                action: "USER_CREATED",
              },
            }),
          );

          await Promise.all(notificationPromises);
        }
      } catch (notifyError) {
        console.error("Failed to send notification to admins:", notifyError);
        // Không throw error, vì tạo user đã thành công
      }
    }

    const populatedUser = await User.findById(newUser._id)
      .populate("team", "name")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo nhân viên thành công!",
      data: {
        user: populatedUser,
        account: accountData,
      },
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

    // Tối ưu hóa: Lấy tất cả account và channel của các user này trong 1 lượt query (tránh N+1)
    const userIds = users.map((u) => u._id);
    const [accounts, channels] = await Promise.all([
      Account.find({ user: { $in: userIds } }).lean(),
      Channel.find({ assignedUser: { $in: userIds } }).lean(),
    ]);

    // Tạo map để lookup nhanh
    const accountMap = accounts.reduce((map, acc) => {
      map[acc.user.toString()] = acc;
      return map;
    }, {});

    const channelMap = channels.reduce((map, ch) => {
      const uId = ch.assignedUser.toString();
      if (!map[uId]) map[uId] = [];
      map[uId].push(ch);
      return map;
    }, {});

    const usersWithDetails = users.map((user) => {
      const account = accountMap[user._id.toString()];
      const userChannels = channelMap[user._id.toString()] || [];

      return {
        userId: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        facebookLink: user.facebookLink,
        bankInfo: user.bankInfo,
        role: user.role,
        loginEmail: account ? account.email : null,
        hasAccount: !!account,
        accountIsActive: account ? account.isActive : false,
        status: user.status,
        team: user.team ? user.team.name : null,
        joinDate: user.joinDate,
        responsibilities: user.responsibilities,
        note: user.note,
        isFirstLogin: user.isFirstLogin,
        channelCount: userChannels.length,
        createdAt: user.createdAt,
      };
    });

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
        phoneNumber: user.phoneNumber,
        facebookLink: user.facebookLink,
        bankInfo: user.bankInfo,
        role: user.role,
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
        joinDate: user.joinDate,
        responsibilities: user.responsibilities,
        note: user.note,
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
        createdAt: user.createdAt,
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
    const {
      fullName,
      phoneNumber,
      facebookLink,
      bankInfo,
      role,
      status,
      team,
      joinDate,
      responsibilities,
      note,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    const oldTeam = user.team ? user.team.toString() : null;

    // Cập nhật các field nếu có
    if (fullName) user.fullName = fullName;
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại này đã được sử dụng!",
        });
      }
      user.phoneNumber = phoneNumber;
    }
    if (facebookLink !== undefined) user.facebookLink = facebookLink;
    if (bankInfo) user.bankInfo = bankInfo;
    if (role) user.role = role;
    if (status) user.status = status;
    if (team !== undefined) user.team = team || null;
    if (joinDate !== undefined) user.joinDate = joinDate;
    if (responsibilities !== undefined)
      user.responsibilities = responsibilities;
    if (note !== undefined) user.note = note;

    await user.save();

    // Đồng bộ lại mảng members/leader của Team nếu team bị thay đổi
    const newTeam = user.team ? user.team.toString() : null;
    if (newTeam !== oldTeam) {
      // 1. Xóa user khỏi team cũ
      if (oldTeam) {
        const oldTeamDoc = await Team.findById(oldTeam);
        if (oldTeamDoc) {
          if (oldTeamDoc.leader && oldTeamDoc.leader.toString() === userId) {
            oldTeamDoc.leader = null;
          }
          oldTeamDoc.members = oldTeamDoc.members.filter(
            (m) => m && m.toString() !== userId
          );
          await oldTeamDoc.save();
        }
      }

      // 2. Thêm user vào team mới
      if (newTeam) {
        await Team.findByIdAndUpdate(newTeam, {
          $addToSet: { members: userId },
        });
      }
    }

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

// Reset mật khẩu user (chỉ Admin)
const resetPasswordByAdmin = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // 1. Kiểm tra user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // 2. Kiểm tra account
    const account = await Account.findOne({ user: userId });
    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Người dùng chưa có tài khoản đăng nhập!",
      });
    }

    // 3. Tạo mật khẩu mới ngẫu nhiên
    const newPassword = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      strict: true,
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Cập nhật account
    account.password = hashedPassword;
    account.isActive = true;
    await account.save();

    // 5. Reset trạng thái user
    user.isFirstLogin = true;
    await user.save();

    // 6. (Optional) Gửi notification cho admin
    try {
      const admins = await User.find({ role: "ADMIN" }).lean();
      await Promise.all(
        admins.map((admin) =>
          sendNotification({
            userId: admin._id,
            title: "Reset mật khẩu người dùng",
            message: `Admin đã reset mật khẩu cho ${user.fullName}\nEmail: ${account.email}\nMật khẩu mới: ${newPassword}`,
            type: "SYSTEM",
            metadata: {
              userId: user._id,
              action: "RESET_PASSWORD",
            },
          }),
        ),
      );
    } catch (err) {
      console.error("Notification error:", err);
    }

    res.json({
      success: true,
      message: "Reset mật khẩu thành công!",
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: account.email,
        newPassword, // ⚠️ chỉ trả về cho ADMIN
      },
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
          account.password,
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
        session,
      ),
      networks: await db.Network.countDocuments({
        assignedUser: userId,
      }).session(session),
      resources: await db.Resource.countDocuments({
        assignedUser: userId,
      }).session(session),
      tasks: await db.Task.countDocuments({ assignedToUser: userId }).session(
        session,
      ),
      kpis: await db.KPI.countDocuments({ user: userId }).session(session),
    };

    console.log(
      `[DELETE ACCOUNT] User ${user.fullName} (${user.phoneNumber}):`,
      relatedData,
    );

    // 5. Xóa Account
    await Account.deleteMany({ user: userId }, { session });

    // 6. Xử lý Channel - Gỡ assignedUser (không xóa channel)
    await Channel.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" } },
      { session },
    );

    // 7. Xử lý Network - Gỡ assignedUser (không xóa network)
    await db.Network.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" } },
      { session },
    );

    // 8. Xử lý Resource - Gỡ assignedUser và chuyển về AVAILABLE
    await db.Resource.updateMany(
      { assignedUser: userId },
      { $unset: { assignedUser: "" }, status: "AVAILABLE" },
      { session },
    );

    // 9. Xử lý Team
    // Gỡ user khỏi members
    await Team.updateMany(
      { members: userId },
      { $pull: { members: userId } },
      { session },
    );

    // Gỡ user khỏi leader (set null)
    await Team.updateMany(
      { leader: userId },
      { $unset: { leader: "" } },
      { session },
    );

    // 10. Xử lý Task - Gỡ assignedToUser (không xóa task)
    await db.Task.updateMany(
      { assignedToUser: userId },
      { $unset: { assignedToUser: "" } },
      { session },
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

    res.json({
      success: true,
      message: "Xóa tài khoản thành công!",
      data: {
        deletedUser: {
          userId: user._id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
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
  createByAdmin,
  getAll,
  getPersonal,
  updateUser,
  resetPasswordByAdmin,
  deleteUser,
  deleteSelfAccount,
};
