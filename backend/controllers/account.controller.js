const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Account = db.Account;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generator = require("generate-password");

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

    // Kiểm tra tài khoản có active không
    if (!account.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa!",
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
        email: account.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Trả về thông tin account + user
    res.json({
      success: true,
      token: token,
      data: {
        accountId: account._id,
        email: account.email,
        isActive: account.isActive,
        user: account.user
          ? {
              userId: account.user._id,
              fullName: account.user.fullName,
              role: account.user.role,
              personalEmail: account.user.personalEmail,
              isFirstLogin: account.user.isFirstLogin,
              status: account.user.status,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).populate("user");

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    const userIdParam = account.user._id.toString();
    const userIdFromToken = req.user.userId;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Thiếu mật khẩu mới!" });
    }

    // Không cho đổi mật khẩu của người khác
    if (userIdFromToken !== userIdParam) {
      return res.status(403).json({
        message: "Bạn không thể đổi mật khẩu của người khác!",
      });
    }

    // Lấy user
    const user = await User.findById(userIdParam);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại!" });
    }

    // Mã hoá mật khẩu
    const hashedPw = await bcrypt.hash(newPassword, 10);

    account.password = hashedPw;
    await account.save();
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Thêm tài khoản mới
const createNew = async (req, res, next) => {
  try {
    const { email, password, userId, isActive } = req.body;

    if (!email || !password || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu đầu vào!" });
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = await Account.create({
      email,
      password: hashedPassword,
      user: userId,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedAccount = await Account.findById(newAccount._id)
      .populate("user", "fullName personalEmail role")
      .lean();

    res.status(201).json({ success: true, data: populatedAccount });
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

    // TODO: Gửi password mới cho nhân viên qua email
    // Ví dụ: sendEmail(account.user.personalEmail, newPassword)

    res.json({
      success: true,
      message: "Reset mật khẩu thành công!",
      newPassword, // Chỉ nên gửi ra API nếu dùng cho testing. Thực tế nên gửi qua email.
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
      .populate("user", "fullName personalEmail role")
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
  createNew,
  autoResetPassword,
  updateStatus,
};
