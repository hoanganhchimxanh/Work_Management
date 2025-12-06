const db = require("../models");
const User = db.User;
const Account = db.Account;
const Channel = db.Channel;

// Tạo người dùng mới
const createNew = async (req, res, next) => {
  try {
    const { fullName, personalEmail, role, status, team } = req.body;

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

    const newUser = await User.create({
      fullName,
      personalEmail,
      role: role || "EMPLOYEE",
      status: status || "ACTIVE",
      team: team || null,
    });

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin toàn bộ người dùng
const getAll = async (req, res, next) => {
  try {
    const users = await User.find().populate("team", "name").lean();

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        // Lấy tài khoản đăng nhập của user
        const account = await Account.findOne({ user: user._id }).lean();

        // Lấy các kênh mà user đang quản lý
        const channels = await Channel.find({ owner: user._id }).lean();

        return {
          userId: user._id,
          fullName: user.fullName,
          role: user.role,
          personalEmail: user.personalEmail,
          loginEmail: account ? account.email : null,
          hasAccount: !!account,
          status: user.status,
          team: user.team ? user.team.name : null,
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
    const channels = await Channel.find({ owner: user._id })
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

module.exports = {
  createNew,
  getAll,
  getPersonal,
  updateUser,
  deleteUser,
};
