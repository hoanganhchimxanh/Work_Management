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
    const { companyEmail, password } = req.body;

    if (!companyEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu companyEmail hoặc password!",
      });
    }

    // Tìm account theo companyEmail
    const account = await Account.findOne({ companyEmail })
      .populate("owner")
      .lean();
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy account với email này!",
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
        userId: account.owner._id,
        role: account.owner.role,
        companyEmail: account.companyEmail,
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
        companyEmail: account.companyEmail,
        isActive: account.isActive,
        user: account.owner
          ? {
              userId: account.owner._id,
              fullName: account.owner.fullName,
              role: account.owner.role,
              personalEmail: account.owner.personalEmail,
              isFirstLogin: account.owner.isFirstLogin,
              status: account.owner.status,
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
    const account = await Account.findById(req.params.id).populate("owner");
    const userIdParam = account.owner._id.toString();
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
    const { companyEmail, password, owner, channel, isActive } = req.body;

    if (!companyEmail || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu đầu vào!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = await Account.create({
      companyEmail,
      password: hashedPassword,
      owner,
      channel,
      isActive,
    });

    res.status(201).json({ success: true, data: newAccount });
  } catch (err) {
    next(err);
  }
};

// Gắn email (account) cho nhân viên hiện có
const applyAccountForUser = async (req, res, next) => {
  try {
    const { userId, accountId } = req.body;

    if (!userId || !accountId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc accountId!",
      });
    }

    const [user, account] = await Promise.all([
      User.findById(userId),
      Account.findById(accountId),
    ]);

    if (!user || !account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user hoặc account!",
      });
    }

    if (account.owner) {
      return res.status(400).json({
        success: false,
        message: "Account này đã được gán cho nhân viên khác!",
      });
    }

    account.owner = userId;
    await account.save();

    // Optional: populate để trả về thông tin đầy đủ
    const updatedAccount = await Account.findById(accountId)
      .populate("owner", "fullName personalEmail role")
      .lean();

    return res.json({
      success: true,
      message: "Gắn tài khoản thành công!",
      data: updatedAccount,
    });
  } catch (err) {
    next(err);
  }
};

// Reset mật khẩu tự động, khi người dùng quên
const autoResetPassword = async (req, res, next) => {
  try {
    const { companyEmail } = req.body;

    if (!companyEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email công ty!",
      });
    }

    // Tìm account và populate owner
    const account = await Account.findOne(companyEmail).populate("owner");
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy account!",
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

    // Cập nhật password của account (hoặc user nếu bạn lưu ở user)
    account.password = hashedPassword;
    await account.save();

    // TODO: Gửi password mới cho nhân viên qua email
    // Ví dụ: sendEmail(account.owner.personalEmail, newPassword)

    res.json({
      success: true,
      message: "Reset mật khẩu thành công!",
      newPassword, // Chỉ nên gửi ra API nếu dùng cho testing. Thực tế nên gửi qua email.
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  changePassword,
  createNew,
  applyAccountForUser,
  autoResetPassword,
};
