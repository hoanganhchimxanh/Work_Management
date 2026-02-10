import React from "react";

const Policy = () => {
  return (
    <div className="container py-4">
      <h1>Chính sách bảo mật</h1>

      <p>
        Work Management cam kết bảo vệ quyền riêng tư và dữ liệu của người dùng.
        Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông
        tin trong quá trình vận hành hệ thống.
      </p>

      <h3>1. Phạm vi áp dụng</h3>
      <p>
        Chính sách này áp dụng cho toàn bộ người dùng nội bộ của hệ thống Work
        Management, được sử dụng trong công ty truyền thông nhằm quản lý nhân
        viên và hoạt động liên quan.
      </p>

      <h3>2. Dữ liệu được thu thập</h3>
      <ul>
        <li>
          Thông tin kênh YouTube của nhân viên (ví dụ: tên kênh, doanh thu, số
          liệu hoạt động liên quan).
        </li>
        <li>
          Thông tin tài khoản đăng nhập nội bộ do hệ thống tự động tạo (không
          liên kết, không xác thực và không chia sẻ với Google hoặc bên thứ ba).
        </li>
      </ul>

      <h3>3. Mục đích sử dụng dữ liệu</h3>
      <ul>
        <li>Quản lý hiệu suất và hoạt động của nhân viên trong công ty.</li>
        <li>Báo cáo nội bộ, phân tích và tối ưu vận hành.</li>
        <li>Không sử dụng dữ liệu cho mục đích thương mại bên ngoài.</li>
      </ul>

      <h3>4. Chia sẻ dữ liệu</h3>
      <p>
        Dữ liệu chỉ được sử dụng trong nội bộ công ty. Chúng tôi không chia sẻ,
        bán hoặc cung cấp dữ liệu cho bên thứ ba dưới bất kỳ hình thức nào.
      </p>

      <h3>5. Bảo mật dữ liệu</h3>
      <p>
        Hệ thống áp dụng các biện pháp kỹ thuật và quản lý phù hợp để bảo vệ dữ
        liệu khỏi truy cập trái phép, mất mát hoặc rò rỉ.
      </p>

      <h3>6. Thay đổi chính sách</h3>
      <p>
        Chính sách bảo mật có thể được cập nhật khi cần thiết. Mọi thay đổi sẽ
        được thông báo trong hệ thống.
      </p>

      <p className="mt-4">
        Nếu bạn có thắc mắc về chính sách bảo mật, vui lòng liên hệ quản trị
        viên hệ thống.
      </p>
    </div>
  );
};

export default Policy;
