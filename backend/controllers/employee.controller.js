const mongoose = require("mongoose");
const db = require("../models");
const Employee = db.Employee;
const User = db.User;

// Tạo nhân viên mới
const createNew = async (req, res, next) => {
  try {
    const {
      userId,
      phoneNumber,
      birthday,
      facebookUrl,
      joinDate,
      department,
      bankAccount,
      note,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId!",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user!",
      });
    }

    // Kiểm tra employee đã tồn tại cho user này chưa
    const existingEmployee = await Employee.findOne({ user: userId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "User này đã có thông tin nhân viên!",
      });
    }

    // Tạo employee mới
    const newEmployee = await Employee.create({
      user: userId,
      phoneNumber: phoneNumber || "",
      birthday: birthday || null,
      facebookUrl: facebookUrl || "",
      joinDate: joinDate || new Date(),
      department: department || "OTHER",
      bankAccount: bankAccount || {
        accountNumber: "",
        bankName: "",
      },
      note: note || "",
    });

    const populatedEmployee = await Employee.findById(newEmployee._id)
      .populate("user", "fullName personalEmail role status")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo thông tin nhân viên thành công!",
      data: populatedEmployee,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy toàn bộ danh sách nhân viên
const getAll = async (req, res, next) => {
  try {
    const { department, status } = req.query;

    // Build filter
    const filter = {};

    const employees = await Employee.find(filter)
      .populate({
        path: "user",
        select: "fullName personalEmail role status team",
        populate: {
          path: "team",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter theo department nếu có
    let filteredEmployees = employees;
    if (department) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.department === department
      );
    }

    // Filter theo user status nếu có
    if (status) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.user && emp.user.status === status
      );
    }

    res.json({
      success: true,
      count: filteredEmployees.length,
      data: filteredEmployees,
    });
  } catch (err) {
    next(err);
  }
};

// Xem thông tin của 1 cá nhân
const getById = async (req, res, next) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId)
      .populate({
        path: "user",
        select: "fullName personalEmail role status team isFirstLogin",
        populate: {
          path: "team",
          select: "name leader members",
        },
      })
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhân viên!",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// Chỉnh sửa thông tin nhân viên
const updateEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const {
      phoneNumber,
      birthday,
      facebookUrl,
      joinDate,
      department,
      bankAccount,
      note,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhân viên!",
      });
    }

    // Cập nhật các field
    if (phoneNumber !== undefined) employee.phoneNumber = phoneNumber;
    if (birthday !== undefined) employee.birthday = birthday;
    if (facebookUrl !== undefined) employee.facebookUrl = facebookUrl;
    if (joinDate !== undefined) employee.joinDate = joinDate;
    if (department !== undefined) employee.department = department;
    if (bankAccount !== undefined) {
      employee.bankAccount = {
        accountNumber: bankAccount.accountNumber || "",
        bankName: bankAccount.bankName || "",
      };
    }
    if (note !== undefined) employee.note = note;

    await employee.save();

    const updatedEmployee = await Employee.findById(employeeId)
      .populate("user", "fullName personalEmail role status")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật thông tin nhân viên thành công!",
      data: updatedEmployee,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa nhân viên
const deleteEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhân viên!",
      });
    }

    await Employee.findByIdAndDelete(employeeId);

    res.json({
      success: true,
      message: "Xóa thông tin nhân viên thành công!",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getById,
  updateEmployee,
  deleteEmployee,
};
