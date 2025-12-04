const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Account = db.Account;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

    user.password = hashedPw;
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

    const newAccount = await Account.create({
      companyEmail,
      password,
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
        message: "Thiếu dữ liệu đầu vào!",
      });
    }

    const user = await User.findById(userId);
    const account = await Account.findById(accountId);

    if (!user || !account) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng hoặc tài khoản!",
      });
    }

    account.owner = userId;

    await account.save();

    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  changePassword,
  createNew,
  applyAccountForUser,
};
