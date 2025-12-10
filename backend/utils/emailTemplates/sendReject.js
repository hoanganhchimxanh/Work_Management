module.exports = (fullName, reason) => {
  return `
    <h3>Xin chào ${fullName},</h3>
    <p>Rất tiếc, đơn đăng ký của bạn đã không được phê duyệt.</p>
    <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận quản trị để được hỗ trợ.</p>
    <p>Trân trọng,<br/>Đội ngũ quản trị hệ thống</p>
  `;
};
