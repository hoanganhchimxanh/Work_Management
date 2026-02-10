import React from "react";

const TermsOfService = () => {
  return (
    <div className="container py-4">
      <h1>Điều khoản sử dụng</h1>

      <p>
        Khi truy cập và sử dụng hệ thống Work Management, bạn đồng ý tuân thủ
        các điều khoản và điều kiện được nêu dưới đây.
      </p>

      <h3>1. Mục đích sử dụng</h3>
      <p>
        Work Management là hệ thống nội bộ được phát triển để quản lý nhân viên
        và các hoạt động liên quan trong công ty truyền thông. Hệ thống không
        phục vụ mục đích công cộng hoặc thương mại bên ngoài.
      </p>

      <h3>2. Tài khoản người dùng</h3>
      <ul>
        <li>
          Tài khoản đăng nhập được tạo tự động bởi hệ thống và chỉ dùng cho mục
          đích nội bộ.
        </li>
        <li>
          Hệ thống không sử dụng đăng nhập Google và không liên kết với bất kỳ
          dịch vụ bên thứ ba nào.
        </li>
        <li>Người dùng có trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
      </ul>

      <h3>3. Quyền và nghĩa vụ của người dùng</h3>
      <ul>
        <li>Sử dụng hệ thống đúng mục đích được cho phép.</li>
        <li>
          Không can thiệp, phá hoại hoặc sử dụng hệ thống cho các hành vi trái
          pháp.
        </li>
        <li>Không tự ý trích xuất hoặc chia sẻ dữ liệu nội bộ ra bên ngoài.</li>
      </ul>

      <h3>4. Dữ liệu và quyền sở hữu</h3>
      <p>
        Toàn bộ dữ liệu trong hệ thống thuộc quyền quản lý của công ty. Người
        dùng không có quyền sở hữu hay khai thác dữ liệu ngoài phạm vi công việc
        được giao.
      </p>

      <h3>5. Giới hạn trách nhiệm</h3>
      <p>
        Work Management được cung cấp “nguyên trạng” cho mục đích nội bộ. Công
        ty không chịu trách nhiệm cho các thiệt hại phát sinh do việc sử dụng
        sai mục đích hoặc vi phạm điều khoản.
      </p>

      <h3>6. Thay đổi điều khoản</h3>
      <p>
        Điều khoản sử dụng có thể được điều chỉnh theo nhu cầu vận hành. Việc
        tiếp tục sử dụng hệ thống đồng nghĩa với việc chấp nhận các thay đổi đó.
      </p>

      <p className="mt-4">
        Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng
        hệ thống và liên hệ quản trị viên.
      </p>
    </div>
  );
};

export default TermsOfService;
