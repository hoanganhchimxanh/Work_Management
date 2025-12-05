require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_User,
    pass: process.env.Email_Password,
  },
});

// Gửi email chứa file tài khoản công ty cho nhân viên
const newCompanyAccountsEmail = {
  from: process.env.Email_User,
  to: "",
  subject: "Cung cấp tài khoản mới cho nhân viên",
  text: "Xin chào ... Đây là tài khoản được cấp cho bạn để có thể làm việc tại công ty chúng tôi!",
};

// Gửi email chứa mật khẩu mới khi người dùng quên mật khẩu và cần cấp mới
const resetPasswordEmail = {
  from: process.env.Email_User,
  to: "",
  subject: "Yêu cầu cấp mật khẩu mới",
  text: "Xin chào ... Đây là mật khẩu được cấp cho bạn để có thể làm việc tại công ty chúng tôi! Hạn chế chia sẻ cho những người khác!",
};

transporter.sendMail(newCompanyAccountsEmail, resetPasswordEmail);
