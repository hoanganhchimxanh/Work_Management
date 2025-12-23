// routes/bugReport.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadBugImage.middleware");
const sendEmail = require("../utils/mailer");
const { protect } = require("../middlewares/auth.middleware");

router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { bugType, description, page } = req.body;
    const user = req.user;

    if (!bugType || !description) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const attachments = req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
          },
        ]
      : [];

    const emailSent = await sendEmail({
      to: process.env.Email_User,
      subject: `🐞 Bug Report - ${bugType.toUpperCase()}`,
      html: `
          <h2>Báo cáo lỗi mới</h2>
          <p><b>Người gửi:</b> ${user.email}</p>
          <p><b>Role:</b> ${user.role}</p>
          <p><b>Trang xảy ra lỗi:</b> ${page || "Không xác định"}</p>
          <p><b>Loại lỗi:</b> ${bugType}</p>
          <hr />
          <pre style="white-space: pre-wrap;">${description}</pre>
        `,
      attachments,
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Gửi email thất bại",
      });
    }

    res.json({
      success: true,
      message: "Đã gửi báo cáo lỗi thành công",
    });
  } catch (error) {
    console.error("Bug report error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
});

module.exports = router;
