// routes/bugReport.routes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadBugImage.middleware");
const sendEmail = require("../utils/mailer");

const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const bugTypeMap = {
  ui: "Lỗi hiển thị",
  data: "Lỗi dữ liệu",
  function: "Lỗi chức năng",
  other: "Khác",
};

router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["ADMIN", "EMPLOYEE", "ACCOUNTANT"]),
  upload.single("image"),
  async (req, res) => {
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
        subject: `🐞 BUG REPORT: ${bugType.toUpperCase()}`,
        html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; color: #333;">
      <div style="background-color: #d32f2f; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Bug Report</h1>
      </div>

      <div style="padding: 20px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #555;">Người dùng gửi một báo cáo lỗi mới với thông tin chi tiết bên dưới:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Trang xảy ra:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #1976d2;">    ${
              page
                ? `<a href="${page}" target="_blank">${page}</a>`
                : "Không xác định"
            }
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Loại lỗi:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <span style="color: #d32f2f; font-weight: bold;"> ${
                bugTypeMap[bugType] || "Không xác định"
              }</span>
            </td>
          </tr>
        </table>

        <div style="background-color: #fff9c4; padding: 15px; border-left: 4px solid #fbc02d; margin-top: 10px;">
          <h4 style="margin: 0 0 10px 0;">Mô tả chi tiết:</h4>
          <p style="white-space: pre-wrap; margin: 0; line-height: 1.6; color: #444;">${description}</p>
        </div>
      </div>
    </div>
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
  }
);

module.exports = router;
