# Software Design Document (SWD) - Event Ticketing Microservices

Tài liệu này cung cấp cái nhìn chi tiết về kiến trúc, luồng dữ liệu và logic kỹ thuật của hệ thống Event Ticketing Platform, hỗ trợ việc xây dựng các biểu đồ UML và thiết kế chi tiết.

---

## 1. Kiến Trúc Tổng Quan (Architecture Overview)

Hệ thống được xây dựng theo kiến trúc **Microservices** thông qua Docker, kết nối bằng **RabbitMQ** (Message Broker) và **REST API** (Gateway).

- **API Gateway (Port 4000):** Cửa ngõ duy nhất, điều phối request và quản lý Proxy.
- **Auth Service (Port 4001):** Quản lý định danh (JWT), phân quyền (RBAC) và thông tin người dùng.
- **Layout Service (Port 4002):** Quản lý sơ đồ ghế, trạng thái ghế realtime (Socket.io) và thông tin sự kiện.
- **Payment Service (Port 4004):** Xử lý đơn hàng, thanh toán (PayOS), Sagas, Vouchers và Tickets.
- **Message Broker (RabbitMQ):** Điều phối các sự kiện bất đồng bộ giữa các service (Vd: Thanh toán xong -> Giải phóng/Đánh dấu ghế).

---

## 2. Mô Hình Dữ Liệu Chi Tiết (Data Models)

### 2.1. User & Auth
- **User:** `email`, `password` (hashed), `role` (Customer/Organizer/Staff/Admin), `firstName`, `lastName`, `phone`, `isActive`.

### 2.2. Event & Layout
- **EventLayout:** `eventId`, `zones` (Array of objects), `canvasWidth`, `canvasHeight`, `status`.
- **Seat:** `seatId` (ObjectId hoặc Composite Key), `eventId`, `zoneId`, `row`, `seatNumber`, `status` (available, reserved, sold).

### 2.3. Booking & Payment
- **Order:** `orderCode` (PayOS compatible), `userId`, `eventId`, `status` (pending, processing, paid, refunded), `totalAmount`, `payosCheckoutUrl`.
- **Voucher:** `code`, `discountType` (percentage/fixed), `discountValue`, `maxUses`, `usedCount`, `userId` (exclusive vouchers).
- **Ticket:** `ticketCode` (QR), `orderId`, `userId`, `eventId`, `status` (issued, checked-in, cancelled).

---

## 3. Các Luồng Nghiệp Vụ Chuyên Sâu (Technical Flows)

### 3.1. Luồng Đặt Vé & Thanh Toán (Booking Saga)
Đây là luồng phức tạp nhất, sử dụng **Saga Pattern** để đảm bảo tính nhất quán dữ liệu.

| Bước | Thực thi (Execute) | Bù đắp (Compensate/Rollback) |
| :--- | :--- | :--- |
| **1. Cleanup** | Xóa các Order cũ chưa thanh toán của User và giải phóng ghế liên quan. | Không cần. |
| **2. Validate Voucher** | Kiểm tra tính hợp lệ, hạn sử dụng, điều kiện giá tối thiểu. Cập nhật `usedCount`. | Giảm `usedCount` của Voucher. |
| **3. Create Order** | Tính toán Commission sàn, Organizer amount. Lưu Order trạng thái `pending`. | Xóa Order trong DB. |
| **4. PayOS Link** | Gọi PayOS API lấy Link thanh toán. Cập nhật Order trạng thái `processing`. | Gọi PayOS API để Hủy Link thanh toán. |

### 3.2. Luồng Hoàn Tất Thanh Toán (Payment Complete Saga)
Kích hoạt bởi **PayOS Webhook** sau khi User chuyển khoản thành công.

1. **Mark Paid:** Cập nhật Order sang `paid`, lưu `paidAt`.
2. **Sync Seats (RabbitMQ):** Gửi message `seats.bulk_sold` tới Layout Service.
    - *Layout Service nhận*: Cập nhật DB trạng thái ghế sang `sold`, phát tín hiệu **Socket.io** tới toàn bộ client đang xem sơ đồ ghế.
3. **Auto Payout:** Gọi Bank API chuyển khoản phần tiền của Organizer vào tài khoản ngân hàng của họ (Nếu có cấu hình).
4. **Create Tickets:** Sinh mã QR cho từng vé trong đơn hàng.
5. **Send Email:** Gửi email xác nhận thanh toán và email chứa mã QR vé cho Customer.

### 3.3. Luồng Hủy Vé & Refund Voucher (50% Refund Policy)
Áp dụng khi Customer muốn hủy vé đã thanh toán.

1. **Create Voucher:** Sinh mã `CANCEL-ORDERCODE` với giá trị = 50% tổng đơn, hiệu lực 30 ngày.
2. **Update Order:** Chuyển trạng thái Order sang `refunded`, gắn ID Voucher vừa tạo vào Order.
3. **Release Seats (RabbitMQ):** Gửi message `seats.release` tới Layout Service để mở lại ghế cho người khác mua.

### 3.4. Luồng AI Assistant (Chatbot & Search)
1. **Fetch & Cache:** Mobile tải danh sách sự kiện khi User vào màn AI.
2. **NLP Logic:** AI nhận diện từ khóa (VD: "nhạc", "đá bóng", "MU", "MC") và địa điểm.
3. **Recommendation:** Nếu tìm thấy, Bot trả về lời chào kèm Card sự kiện. Nút "Đặt ngay" sẽ điều hướng thẳng tới `TicketSelection` với `eventId` đã chọn.

---

## 4. Tương Tác Giữa Các Service (Integration)

### 4.1. RabbitMQ Topics (Exchange: `ticketing.events`)
- `seats.mark_sold`: Đánh dấu 1 hoặc nhiều ghế đã bán.
- `seats.release`: Giải phóng ghế về trạng thái trống.
- `event.created`: Khi Organizer tạo event, Layout Service tự động sinh SeatMap trống.

### 4.2. Socket.io Events
- `join-event`: Client tham gia phòng theo `eventId`.
- `seat-update`: Layout Service gửi cập nhật trạng thái ghế (ví dụ có người vừa mua xong) tới tất cả client trong phòng.

---

## 5. Gợi Ý Sơ Đồ UML Chi Tiết

### A. Sequence Diagram: Luồng Thanh toán thành công
`PayOS -> Payment Service (Webhook) -> Order DB (Update) -> RabbitMQ (Publish) -> Layout Service (Update DB & Socket.io) -> Email Service (Send QR)`.

### B. State Machine Diagram: Trạng thái Đơn hàng (Order State)
`Pending -> Processing -> Paid -> Refunded` (hoặc `Expired/Cancelled`).

### C. State Machine Diagram: Trạng thái Ghế (Seat State)
`Available -> Reserved (Held) -> Sold -> Available` (Nếu hủy/refund).

### D. Integrated Communication Diagram
Mô tả cách **API Gateway** phân phối header `Authorization` tới các service con và cách các service gọi nhau qua **RabbitMQ**.

---
**Lưu ý:** Tài liệu này được trích xuất từ mã nguồn thực tế của dự án nhằm đảm bảo độ chính xác cao nhất cho việc thiết kế kiến trúc phần mềm (SWD).
