const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const db = require("../models");
const User = db.User;
const Account = db.Account;

/**
 * Seed admin account for initial setup
 * Safe to run multiple times - will skip if admin already exists
 */
async function seedAdmin() {
  try {
    console.log("🌱 Starting admin seeding process...");

    // Kiểm tra kết nối database
    if (mongoose.connection.readyState !== 1) {
      console.log("⏳ Waiting for database connection...");
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }

    // Kiểm tra đã có account admin chưa
    const existingAdmin = await Account.findOne({
      email: "admin@company.com",
    });

    if (existingAdmin) {
      console.log("✅ Admin account already exists. Skip seeding.");
      return {
        success: true,
        message: "Admin already exists",
        skipped: true,
      };
    }

    // Kiểm tra xem có user admin với phone này chưa
    const existingUser = await User.findOne({
      phoneNumber: "0000000001",
    });

    let adminUser;

    if (existingUser) {
      console.log("ℹ️  Admin user exists, creating account only...");
      adminUser = existingUser;
    } else {
      // 1️⃣ Tạo User
      console.log("👤 Creating admin user...");
      adminUser = await User.create({
        fullName: "System Administrator",
        phoneNumber: "0000000001",
        facebookLink: null,
        bankInfo: {
          bankName: null,
          accountNumber: null,
        },
        role: "ADMIN",
        status: "ACTIVE",
        isFirstLogin: false, // Không cần đổi mật khẩu lần đầu
        team: null,
        joinDate: new Date(),
        responsibilities: "Quản trị hệ thống",
        note: "Tài khoản admin mặc định",
      });
      console.log(`✓ Admin user created with ID: ${adminUser._id}`);
    }

    // 2️⃣ Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash("admin1234", 10);

    // 3️⃣ Tạo Account
    console.log("🔑 Creating admin account...");
    const adminAccount = await Account.create({
      email: "admin@company.com",
      password: hashedPassword,
      user: adminUser._id,
      isActive: true,
    });

    console.log("🎉 Admin account created successfully!");
    console.log("📧 Email: admin@company.com");
    console.log("🔑 Password: admin1234");

    return {
      success: true,
      message: "Admin account created",
      data: {
        userId: adminUser._id,
        accountId: adminAccount._id,
        email: adminAccount.email,
      },
    };
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);

    // Rollback nếu có lỗi
    try {
      await Account.deleteOne({ email: "admin@company.com" });
      await User.deleteOne({ phoneNumber: "0000000001", role: "ADMIN" });
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
      await seedAdmin();
      await mongoose.connection.close();
      console.log("👋 Database connection closed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedAdmin;
