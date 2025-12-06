module.exports = (fullName, email, password) => {
  return `
    <h3>Xin chào ${fullName},</h3>
    <p>Phía hệ thống xin phép được cung cấp tài khoản đăng nhập cho bạn!</p>
    <p>Tài khoản đăng nhập mới của bạn là: <b>${email}</b></p>
    <p>Mật khẩu mới của bạn là: <b>${password}</b></p>
    <p>Hãy đổi lại mật khẩu sau khi đăng nhập.</p>
  `;
};
