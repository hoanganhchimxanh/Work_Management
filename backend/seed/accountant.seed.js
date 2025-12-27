const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const db = require("../models");
const User = db.User;
const Account = db.Account;

/**
 * Seed accountant account for initial setup
 * Safe to run multiple times - will skip if accountant already exists
 */
async function seedAccountant() {
  try {
    console.log("🌱 Starting accountant seeding process...");

    // Kiểm tra kết nối database
    if (mongoose.connection.readyState !== 1) {
      console.log("⏳ Waiting for database connection...");
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }

    // Kiểm tra đã có account accountant chưa
    const existingAccountant = await Account.findOne({
      email: "accountant@company.com",
    });

    if (existingAccountant) {
      console.log("✅ Accountant account already exists. Skip seeding.");
      return {
        success: true,
        message: "Accountant already exists",
        skipped: true,
      };
    }

    // Kiểm tra xem có user accountant với email này chưa
    const existingUser = await User.findOne({
      personalEmail: "accountant@gmail.com",
    });

    let accountantUser;

    if (existingUser) {
      console.log("ℹ️  Accountant user exists, creating account only...");
      accountantUser = existingUser;
    } else {
      // 1️⃣ Tạo User
      console.log("👤 Creating accountant user...");
      accountantUser = await User.create({
        fullName: "System Accountant",
        personalEmail: "accountant@gmail.com",
        role: "ACCOUNTANT",
        status: "ACTIVE",
        isFirstLogin: false, // Không cần đổi mật khẩu lần đầu
        team: null,
      });
      console.log(`✓ Accountant user created with ID: ${accountantUser._id}`);
    }

    // 2️⃣ Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash("accountant1234", 10);

    // 3️⃣ Tạo Account
    console.log("🔑 Creating accountant account...");
    const accountantAccount = await Account.create({
      email: "accountant@company.com",
      password: hashedPassword,
      user: accountantUser._id,
      isActive: true,
    });

    console.log("🎉 Accountant account created successfully!");
    console.log("📧 Email: accountant@company.com");
    console.log("🔒 Password: accountant1234");
    console.log("⚠️  Please change the password after first login!");

    return {
      success: true,
      message: "Accountant account created",
      data: {
        userId: accountantUser._id,
        accountId: accountantAccount._id,
        email: accountantAccount.email,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding accountant:", error.message);

    // Rollback nếu có lỗi
    try {
      await Account.deleteOne({ email: "accountant@company.com" });
      await User.deleteOne({
        personalEmail: "accountant@gmail.com",
        role: "ACCOUNTANT",
      });
      console.log("🔄 Rollback completed");
    } catch (rollbackError) {
      console.error("⚠️  Rollback failed:", rollbackError.message);
    }

    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
}

// Cho phép chạy trực tiếp từ command line
if (require.main === module) {
  require("dotenv").config();

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log("✅ Connected to MongoDB");
      await seedAccountant();
      await mongoose.connection.close();
      console.log("👋 Database connection closed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedAccountant;
