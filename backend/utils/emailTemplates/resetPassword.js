// utils/emailTemplates/resetPassword.js
module.exports = (fullName, newPassword) => {
  return `
    <h3>Xin chào ${fullName},</h3>
    <p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p>
    <p>Hãy đổi lại mật khẩu sau khi đăng nhập.</p>
  `;
};
