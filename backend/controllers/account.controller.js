const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Account = db.Account;

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
  createNew,
  applyAccountForUser,
};
