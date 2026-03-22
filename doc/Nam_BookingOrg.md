# Tài liệu Mô tả Chức năng - Nhóm Core Booking, Organizer Setup & System
**Người thực hiện:** Nam
**Phạm vi:** 10 Use Cases (UCs) tập trung vào logic giữ ghế, thiết lập tổ chức và các tiến trình hệ thống.

---

## 1. UC-09: Chọn & Giữ ghế (Select & Hold Seat)
- **Mô tả:** Cho phép khách hàng chọn ghế cụ thể từ sơ đồ và "khóa" ghế đó trong một khoảng thời gian ngắn để tiến hành thanh toán, tránh việc nhiều người mua cùng một ghế.
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `layout-service`
  - **Logic:** Khi khách hàng chọn ghế, hệ thống gọi API `POST /api/v1/events/:eventId/seats/reserve`.
  - **Trạng thái ghế:** Chuyển từ `available` sang `reserved`.
  - **Thời gian giữ:** Mặc định là **15 phút** (cấu hình qua `reservationExpiry`).
  - **Đồng bộ thời gian thực:** Sử dụng **Socket.io** (`broadcastSeatUpdate`) để thông báo cho các khách hàng khác biết ghế đã bị giữ ngay lập tức.
  - **Tự động giải phóng:** Một Cron Job (`releaseExpiredReservations`) chạy định kỳ để chuyển các ghế hết hạn giữ (`reservationExpiry < now`) quay lại trạng thái `available`.
  - **Metadata:** Cập nhật cache `seatMetadata` trong `EventLayout` để tối ưu hóa việc hiển thị số lượng ghế còn trống.

## 2. UC-16: Đăng ký danh sách chờ (Waitlist Registration)
- **Mô tả:** Khi một sự kiện hoặc khu vực ghế đã hết chỗ, khách hàng có thể đăng ký vào danh sách chờ để nhận thông báo nếu có vé được giải phóng hoặc ban tổ chức mở thêm slot.
- **Chi tiết kỹ thuật (Thiết kế):**
  - **Luồng hoạt động:** Lưu bản ghi vào collection `Waitlist` gồm `{userId, eventId, joinedAt, status}`.
  - **Trạng thái:** `waiting` -> `notified` (khi có vé) -> `purchased` (nếu mua thành công) hoặc `expired` (nếu không mua trong hạn định).
  - **Tích hợp:** Kết nối với logic hủy vé của `payment-service` để tự động kích hoạt thông báo cho người đầu tiên trong danh sách.

## 3. UC-21: Đăng ký/Đăng nhập Organizer (Org Register/Login)
- **Mô tả:** Cung cấp luồng đăng ký và đăng nhập riêng biệt cho Nhà tổ chức sự kiện (Organizer).
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `auth-service`
  - **Phân quyền (RBAC):** Sử dụng trường `role: 'organizer'` trong User model.
  - **Quy trình:** 
    - Đăng ký qua `POST /api/auth/register` với thông tin doanh nghiệp/tổ chức.
    - Sau khi đăng nhập, Organizer được cấp JWT chứa role tương ứng để truy cập vào các API dành riêng cho quản lý sự kiện.

## 4. UC-22: Tạo mới sự kiện (Create New Event)
- **Mô tả:** Cho phép Organizer thiết lập thông tin cơ bản cho sự kiện mới, bao gồm tên, thời gian, địa điểm, mô tả và hình ảnh banner.
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `layout-service`
  - **Logic:** Lưu trữ thông tin qua model `EventLayout`.
  - **Thông tin hỗ trợ:**
    - Tích hợp **Cloudinary** để upload banner sự kiện.
    - Cấu hình vị trí (Location), thời gian (`startTime`, `endTime`).
    - Sau khi tạo, sự kiện ở trạng thái `draft` hoặc `pending` chờ Admin phê duyệt.

## 5. UC-24: Quản lý Voucher (Voucher Management)
- **Mô tả:** Organizer tạo và quản lý các mã giảm giá để khuyến khích khách hàng mua vé.
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `payment-service` (Controller: `voucher.controller.ts`)
  - **Chức năng:** 
    - **Tạo Voucher:** Cấu hình loại giảm giá (`percentage` hoặc `fixed`), giá trị, số lần sử dụng tối đa (`maxUses`), ngày bắt đầu/kết thúc.
    - **Điều kiện:** Có thể yêu cầu giá trị đơn hàng tối thiểu (`minimumPrice`) hoặc chỉ áp dụng cho một `eventId` cụ thể.
    - **Kiểm tra:** API `previewVoucher` cho phép kiểm tra tính hợp lệ và tính toán số tiền giảm trước khi đặt hàng.

## 6. UC-25: CRUD nhân viên (Staff Management)
- **Mô tả:** Organizer tạo và quản lý tài khoản cho nhân viên (Staff) để thực hiện các nhiệm vụ như check-in khách tại cổng.
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `auth-service` (Routes: `/api/users/staff`)
  - **Logic:** 
    - Organizer tạo tài khoản nhân viên với email và mật khẩu tạm thời.
    - Các tài khoản này tự động được gán `role: 'staff'`.
    - Quản lý danh sách nhân viên thuộc quyền sở hữu của Organizer thông qua middleware kiểm tra quyền.

## 7. UC-26: Gửi thông báo (Global Notification)
- **Mô tả:** Gửi thông báo hàng loạt đến tất cả khách hàng hoặc nhóm khách hàng mua vé của một sự kiện cụ thể (ví dụ: thông báo dời lịch, thay đổi địa điểm).
- **Chi tiết kỹ thuật (Thiết kế):**
  - **Hệ thống tin nhắn:** Sử dụng **RabbitMQ** để xử lý hàng đợi gửi tin nhắn lớn, tránh nghẽn server.
  - **Kênh gửi:** Hỗ trợ Email (qua `Nodemailer`) và In-app notification.
  - **Luồng:** Admin/Org soạn nội dung -> Filter danh sách User -> Đẩy vào Queue -> Workers xử lý gửi đi.

## 8. UC-18: Xuất vé & Gửi QR (Ticket Issuance & QR Delivery)
- **Mô tả:** Sau khi thanh toán thành công, hệ thống tự động sinh mã vé duy nhất và gửi QR code cho khách hàng qua email.
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `payment-service`
  - **Logic:** Khi nhận Webhook `PAID` từ PayOS -> Chạy `PaymentCompleteSaga`.
  - **Sinh mã:** Tạo bản ghi `Ticket` gắn với `orderId`.
  - **Gửi Mail:** Gọi `email.service.ts` -> `sendTicketQREmail`. QR code được đính kèm dưới dạng hình ảnh để khách hàng lưu trữ và sử dụng khi check-in.

## 9. UC-42: Gửi thông báo tự động (Automated Notification)
- **Mô tả:** Tự động gửi các email xác nhận hoặc nhắc nhở dựa trên các sự kiện trong hệ thống.
- **Chi tiết kỹ thuật (Backend):**
  - **Các loại thông báo:**
    - Xác thực email/OTP khi đăng ký.
    - Xác nhận đặt hàng thành công.
    - Thông báo hoàn tiền (`sendRefundEmail`).
    - Nhắc nhở sự kiện sắp diễn ra (Scheduled tasks).

## 10. UC-43: Thanh toán ký quỹ (Escrow Payment & Platform Fees)
- **Mô tả:** Hệ thống đóng vai trò trung gian giữ tiền thanh toán của khách hàng, khấu trừ phí sàn và giải ngân cho Organizer.
- **Chi tiết kỹ thuật (Backend):**
  - **Dịch vụ:** `payment-service`
  - **Cơ chế:** 
    - Tiền thanh toán tập trung vào tài khoản sàn thông qua cổng **PayOS**.
    - **Phí sàn:** Cấu hình `COMMISSION_RATE` (ví dụ: 5%).
    - **Tính toán:** Mỗi đơn hàng tự động tính `commissionAmount` và `organizerAmount` (số tiền thực nhận của Org).
    - **Saga Pattern:** Đảm bảo tính toàn vẹn dữ liệu khi cập nhật trạng thái đơn hàng, giải phóng ghế hoặc hoàn phí.
    - **Đối soát:** Trạng thái `payoutStatus` theo dõi quá trình giải ngân tiền cho Organizer sau sự kiện.
