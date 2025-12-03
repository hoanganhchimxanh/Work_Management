const db = require("../models");
const User = db.User;
const Account = db.Account;

// Tạo người dùng mới
const createNew = async (req, res, next) => {
  try {
    const { fullName, personalEmail, role, status } = req.body;

    const newUser = await User.create({
      fullName,
      personalEmail,
      role,
      status,
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
    const users = await User.find().lean();

    const usersWithAccounts = await Promise.all(
      users.map(async (user) => {
        // Lấy tất cả account của user
        const accounts = await Account.find({ owner: user._id }).lean();

        // Lấy danh sách companyEmail
        const companyEmails = accounts.map((acc) => acc.companyEmail);

        // Tính số channel (giả sử mỗi account quản lý 1 channel)
        const channelCount = accounts.reduce(
          (count, acc) => (acc.channel ? count + 1 : count),
          0
        );

        return {
          fullName: user.fullName,
          role: user.role,
          personalEmail: user.personalEmail,
          companyEmails, // trả về mảng
          status: user.status,
          channelCount,
          joinedAt: user.createdAt,
        };
      })
    );

    res.json({ success: true, data: usersWithAccounts });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin của 1 người dùng theo ID
const getPersonal = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng!" });

    const accounts = await Account.find({ owner: user._id }).lean();
    const companyEmails = accounts.map((acc) => acc.companyEmail);
    const channelCount = accounts.reduce(
      (count, acc) => (acc.channel ? count + 1 : count),
      0
    );

    res.json({
      success: true,
      data: {
        fullName: user.fullName,
        role: user.role,
        personalEmail: user.personalEmail,
        companyEmails,
        status: user.status,
        channelCount,
        joinedAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getPersonal,
};
