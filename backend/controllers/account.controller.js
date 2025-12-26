const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Account = db.Account;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const sendEmail = require("../utils/mailer");
const sendResetPassword = require("../utils/emailTemplates/resetPassword");

// Tạo tài khoản mới thủ công
const createNewAccount = async (req, res, next) => {
  try {
    const { email, password, userId } = req.body;

    // Validate tối thiểu
    if (!email || !password || !userId) {
      return res.status(400).json({
        success: false,
        message: "email, password và userId là bắt buộc",
      });
    }

    // Check user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
      });
    }

    // Check trùng email
    const existed = await Account.findOne({ email });
    if (existed) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account
    const account = await Account.create({
      email,
      password: hashedPassword,
      user: userId,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (err) {
    next(err);
  }
};

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
        isActive: account.isActive,
        isFirstLogin: account.user.isFirstLogin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
// Đổi mật khẩu
const changePassword = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).populate("user");

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    const userIdParam = account.user._id.toString();
    const userIdFromToken = req.user.userId?.toString() || req.user.userId;
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

    // ✅ TẠO TOKEN MỚI với isFirstLogin = false
    const newToken = jwt.sign(
      {
        accountId: account._id,
        userId: user._id,
        role: user.role,
        isActive: account.isActive,
        isFirstLogin: false, // Đã đổi mật khẩu
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đổi mật khẩu thành công!",
      token: newToken, // Trả token mới về frontend
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Đăng ký tài khoản cho người dùng (tạo mới bởi Admin hoặc hệ thống)
const register = async (req, res, next) => {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create({
      email,
      password: hashedPassword,
      user: userId,
      isActive: isActive !== undefined ? isActive : true, // Mặc định INACTIVE
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

    // Gửi password mới cho nhân viên qua email
    try {
      await sendEmail({
        to: account.user.personalEmail,
        subject: "Đặt lại mật khẩu - Hệ thống quản lý công việc",
        text: "",
        html: sendResetPassword(account.user.personalEmail, newPassword),
        attachments: [],
      });
      console.log("Mật khẩu mới đã được gửi!");
    } catch (mailErr) {
      console.error("Gửi email thất bại:", mailErr);
    }

    res.json({
      success: true,
      message: "Reset mật khẩu thành công!",
      newPassword,
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
  createNewAccount,
  login,
  changePassword,
  register,
  autoResetPassword,
  updateStatus,
};
