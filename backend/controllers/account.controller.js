const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Account = db.Account;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const { sendBulkNotification } = require("../services/notification.service");

// Đăng nhập
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email hoặc password!",
      });
    }

    // Tìm account theo email
    const account = await Account.findOne({ email }).populate("user").lean();
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này!",
      });
    }

    // Kiểm tra liên kết User
    if (!account.user) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản không được liên kết với hồ sơ người dùng!",
      });
    }

    // Kiểm tra tài khoản có active không
    if (!account.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa!",
      });
    }

    // Kiểm tra trạng thái người dùng (Ví dụ: đã nghỉ việc)
    if (account.user.status === "QUIT") {
      return res.status(403).json({
        success: false,
        message: "Người dùng đã nghỉ việc, không thể đăng nhập!",
      });
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Sai mật khẩu!",
      });
    }

    const token = jwt.sign(
      {
        accountId: account._id,
        userId: account.user._id,
        role: account.user.role,
        isActive: account.isActive,
        isFirstLogin: account.user.isFirstLogin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Trả về token
    res.json({
      success: true,
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

// Đổi mật khẩu
const changePassword = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).populate("user");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản!",
      });
    }

    if (!account.user) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản không có thông tin user đi kèm!",
      });
    }

    const userIdParam = account.user._id.toString();
    const userIdFromToken = req.user.userId?.toString() || req.user.userId;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mật khẩu mới!",
      });
    }

    // Không cho đổi mật khẩu của người khác
    if (userIdFromToken !== userIdParam) {
      return res.status(403).json({
        success: false,
        message: "Bạn không thể đổi mật khẩu của người khác!",
      });
    }

    const { user } = account;

    // Mã hoá mật khẩu
    const hashedPw = await bcrypt.hash(newPassword, 10);

    account.password = hashedPw;
    await account.save();

    user.isFirstLogin = false;
    await user.save();

    // Tạo TOKEN MỚI với isFirstLogin = false
    const newToken = jwt.sign(
      {
        accountId: account._id,
        userId: user._id,
        role: user.role,
        isActive: account.isActive,
        isFirstLogin: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
      token: newToken,
    });
  } catch (err) {
    next(err);
  }
};

// Đăng ký tài khoản cho người dùng (tạo mới bởi Admin hoặc hệ thống)
const register = async (req, res, next) => {
  try {
    const { email, password, userId, isActive } = req.body;

    if (!email || !password || !userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu đầu vào!",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại!",
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create({
      email,
      password: hashedPassword,
      user: userId,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedAccount = await Account.findById(newAccount._id)
      .populate("user", "fullName phoneNumber role")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công!",
      data: populatedAccount,
    });
  } catch (err) {
    next(err);
  }
};

// Reset mật khẩu tự động, khi người dùng quên
const autoResetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email!",
      });
    }

    // Tìm account và populate user
    const account = await Account.findOne({ email }).populate("user");
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản!",
      });
    }

    if (!account.user) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản này chưa được liên kết với hồ sơ người dùng!",
      });
    }

    // Tạo mật khẩu mới tự động
    const newPassword = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      strict: true,
    });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật password của account
    account.password = hashedPassword;
    await account.save();

    // Tìm tất cả admin để gửi thông báo
    const admins = await User.find({ role: "ADMIN" }).lean();
    const adminIds = admins.map((admin) => admin._id);

    // Gửi thông báo cho tất cả admin
    if (adminIds.length > 0) {
      await sendBulkNotification({
        userIds: adminIds,
        title: "Yêu cầu reset mật khẩu",
        message: `Người dùng ${account.user.fullName} (${account.email}) đã reset mật khẩu. Mật khẩu mới: ${newPassword}`,
        type: "SYSTEM",
        metadata: {
          userId: account.user._id,
          email: account.email,
          userName: account.user.fullName,
          newPassword: newPassword,
          action: "PASSWORD_RESET",
        },
      });
    }

    // Trả về thông tin (không bao gồm mật khẩu mới vì lý do bảo mật)
    res.json({
      success: true,
      message:
        "Reset mật khẩu thành công! Admin sẽ liên hệ với bạn để cung cấp mật khẩu mới.",
      data: {
        email: account.email,
        userName: account.user.fullName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật trạng thái tài khoản (active/inactive)
const updateStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive phải là boolean!",
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản!",
      });
    }

    account.isActive = isActive;
    await account.save();

    const updatedAccount = await Account.findById(accountId)
      .populate("user", "fullName phoneNumber role")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      data: updatedAccount,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  changePassword,
  register,
  autoResetPassword,
  updateStatus,
};
