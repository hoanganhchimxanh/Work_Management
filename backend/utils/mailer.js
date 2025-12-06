const nodemailer = require("nodemailer");
require("dotenv").config();

// Tạo transporter dùng Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_User,
    pass: process.env.Email_Password,
  },
});

// Hàm gửi email, nhận một đối tượng chứa tất cả các tùy chọn
const sendEmail = async ({
  to,
  subject,
  text = "",
  html = "",
  attachments = [],
}) => {
  try {
    const mailOptions = {
      from: process.env.Email_User,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!", info.response);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

module.exports = sendEmail;
