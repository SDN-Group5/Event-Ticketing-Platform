## 📋 MỤC LỤC
1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Phân Tích 8 Module Nghiệp Vụ](#2-phân-tích-8-module-nghiệp-vụ)
3. [Workflow Chi Tiết](#3-workflow-chi-tiết)
4. [Mapping Nghiệp Vụ → Database](#4-mapping-nghiệp-vụ--database)
5. [Use Case Diagram](#5-use-case-diagram)

---

## 1. Tổng Quan Hệ Thống

**Mục tiêu sản phẩm:**  
Nền tảng bán vé sự kiện (Event Ticketing Platform) cho phép **Organizer** tạo & quản lý sự kiện, **Customer** tìm kiếm & mua vé, **Staff** check-in khách tại cổng, và **Admin (Sàn)** vận hành, kiểm duyệt & đối soát tài chính.

**Đặc điểm chính:**
- **Kiến trúc microservice**: Auth, Event, Booking, Payment, Wallet, Notification, Check-in, v.v…
- **Đa loại người dùng (multi-actor)**:
  - Admin (Sàn)
  - Organizer (nhà tổ chức sự kiện)
  - Customer (khách mua vé)
  - Staff (nhân viên check-in, vận hành)
  - System (cron, job nền, AI gợi ý, auto email…)
- **Luồng nghiệp vụ chính:**
  1. Khách đăng ký tài khoản → xác thực email (OTP).
  2. Khách login → khám phá sự kiện → xem chi tiết → chọn ghế → thanh toán → nhận vé (QR).
  3. Trước ngày diễn ra: hệ thống gửi email nhắc, khách đến cổng → Staff scan QR → check-in.
  4. Sau sự kiện: xử lý đối soát, hoàn tiền theo chính sách, báo cáo doanh thu, analytics.

---

## 2. Phân Tích 8 Module Nghiệp Vụ

> 8 module chính gom từ danh sách Use Case ở trên.
>
> **Danh sách nhanh:**
> - **Module 1 – Auth & User Management**
> - **Module 2 – Admin (Sàn)**
> - **Module 3 – Discovery (Tìm kiếm & Khám phá sự kiện)**
> - **Module 4 – Booking (Đặt vé)**
> - **Module 5 – Payment & Ticket**
> - **Module 6 – Wallet & Customer Management**
> - **Module 7 – Organizer Portal**
> - **Module 8 – Check-in & System Automation**

### 2.1. Module 1 – Auth & User Management

**Use Case liên quan:**
- UC-01: Đăng ký tài khoản (Customer)
- UC-02: Đăng nhập / Logout (All Users)
- UC-03: Quên mật khẩu (All Users)
- UC-04: Cập nhật hồ sơ (All Users)
- UC-05: Đổi mật khẩu (All Users)
- UC-21: Đăng ký/Đăng nhập Organizer (Organizer)
- UC-31: Đăng nhập nhân viên (Staff)

**Mục tiêu:**
- Xác thực & phân quyền người dùng (Customer / Organizer / Staff / Admin).
- Quản lý thông tin cá nhân, bảo mật tài khoản.

**Yêu cầu nghiệp vụ chính:**
- Đăng ký: email unique, gửi OTP/email xác thực (UC-01).
- Đăng nhập: hỗ trợ Local (email/password), có thể mở rộng Google/Facebook (UC-02).
- Quên mật khẩu: gửi mã reset qua email, OTP có thời hạn (UC-03).
- Cập nhật hồ sơ: thay đổi avatar, thông tin cá nhân, số điện thoại… (UC-04).
- Đổi mật khẩu khi đang đăng nhập (UC-05).
- Phân loại tài khoản: Customer / Organizer / Staff / Admin (UC-21, UC-31).

---

### 2.2. Module 2 – Admin (Sàn)

**Use Case liên quan:**
- UC-37: Phê duyệt sự kiện
- UC-38: Quản lý người dùng
- UC-39: Đối soát tài chính
- UC-40: Quản lý khiếu nại
- UC-41: Quản lý Banner

**Mục tiêu:**
- Quản trị toàn bộ nền tảng: nội dung, người dùng, tài chính, hiển thị trang chủ.

**Yêu cầu nghiệp vụ chính:**
- **Phê duyệt sự kiện (UC-37):**
  - Organizer tạo sự kiện → trạng thái `Pending Approval`.
  - Admin xem nội dung, hình ảnh, chính sách → `Approve` → public / `Reject` → trả về Organizer chỉnh sửa.
- **Quản lý người dùng (UC-38):**
  - Xem danh sách Organizer & Customer.
  - Khóa/mở khóa tài khoản, nâng cấp hạ cấp role (ví dụ từ Customer → Organizer).
- **Đối soát tài chính (UC-39):**
  - Theo dõi doanh thu từng sự kiện.
  - Tính phí sàn (ví dụ 10%) từ tổng doanh thu vé.
  - Số tiền còn lại chuyển cho Organizer (theo chu kỳ, ví dụ sau khi sự kiện kết thúc & check-in xong).
- **Quản lý khiếu nại (UC-40):**
  - Nhận yêu cầu hoàn tiền từ Customer (liên quan UC-15).
  - Admin duyệt hoặc từ chối dựa vào policy (thời gian mua, thời điểm diễn ra, lý do).
- **Quản lý Banner (UC-41):**
  - Cấu hình banner trang chủ: sự kiện nổi bật, quảng cáo, category đặc biệt.

---

### 2.3. Module 3 – Discovery (Tìm kiếm & Khám phá sự kiện)

**Use Case liên quan:**
- UC-06: Tìm kiếm & Lọc
- UC-07: Xem chi tiết sự kiện
- UC-08: Gợi ý cá nhân hóa

**Mục tiêu:**
- Giúp khách tìm được sự kiện phù hợp nhanh, đúng nhu cầu.

**Yêu cầu nghiệp vụ chính:**
- **Tìm kiếm & lọc (UC-06):**
  - Tìm theo tên sự kiện, địa điểm, ngày, loại hình (concert, workshop, sport,…).
  - Hỗ trợ tìm không dấu (VD: gõ “nhac tre” vẫn tìm được “Nhạc Trẻ”).
  - Lọc theo giá, tình trạng vé, city, category.
- **Xem chi tiết sự kiện (UC-07):**
  - Thông tin mô tả, nghệ sĩ, thời gian, địa điểm.
  - Sơ đồ ghế, loại vé, giá, số lượng còn lại.
- **Gợi ý cá nhân hóa (UC-08):**
  - Hiển thị “Có thể bạn thích”: dựa vào lịch sử mua vé, thể loại quan tâm, vị trí địa lý.

---

### 2.4. Module 4 – Booking (Đặt vé)

**Use Case liên quan:**
- UC-09: Chọn & Giữ ghế
- UC-11: Áp dụng mã giảm giá
- UC-12: Thêm vào yêu thích
- UC-15: Hủy vé & Hoàn tiền
- UC-16: Đăng ký danh sách chờ (Waitlist)

**Mục tiêu:**
- Đảm bảo việc đặt vé chính xác, tránh trùng ghế, hỗ trợ voucher & chính sách hủy.

**Yêu cầu nghiệp vụ chính:**
- **Chọn & giữ ghế (UC-09):**
  - Khi khách chọn ghế → hệ thống phải “khóa tạm thời” ghế 5–10 phút.
  - Nếu khách **thanh toán thành công** → ghế chuyển trạng thái `Booked/Paid`.
  - Nếu khách **hủy / timeout / không thanh toán** → ghế tự động `Release` để người khác mua.
- **Áp dụng mã giảm giá (UC-11):**
  - Kiểm tra mã có tồn tại, còn hạn, số lần sử dụng, điều kiện (min order, category…).
  - Tính lại số tiền: phần giảm có thể là % hoặc số tiền cố định.
- **Thêm vào yêu thích (UC-12):**
  - Customer có thể lưu sự kiện vào wishlist để xem/mua sau.
- **Hủy vé & Hoàn tiền (UC-15):**
  - Khách gửi yêu cầu hoàn tiền, theo chính sách (ví dụ: 10k → hoàn 6k trong vòng 36h sau khi mua).
  - Tạo record khiếu nại / refund request, chuyển cho Admin hoặc hệ thống xử lý.
- **Waitlist (UC-16):**
  - Khi sự kiện hết vé → khách đăng ký vào danh sách chờ.
  - Khi có vé trả về hoặc organizer mở thêm slot → hệ thống gửi thông báo cho danh sách chờ để vào mua.

---

### 2.5. Module 5 – Payment & Ticket

**Use Case liên quan:**
- UC-17: Thanh toán trực tuyến
- UC-18: Xuất vé & Gửi QR (ticket)
- UC-36: Thanh toán ký quỹ (liên quan System/Wallet)

**Mục tiêu:**
- Xử lý thanh toán an toàn, sinh vé (QR), kết nối với các bên thứ 3.

**Yêu cầu nghiệp vụ chính:**
- **Thanh toán trực tuyến (UC-17):**
  - Tích hợp cổng PayOS (chuyển khoản/QR).
  - Tạo “Payment Session” với trạng thái: `Pending` → `Paid` / `Failed` / `Expired`.
- **Xuất vé & Gửi QR (UC-18):**
  - Sau khi thanh toán thành công:
    - Sinh mã vé (QR code) duy nhất.
    - Gửi email kèm QR hoặc link tải vé.
- **Thanh toán ký quỹ (UC-43 – System):**
  - Khi khách mua vé resell hoặc các tình huống cần ký quỹ:
    - Giữ tiền tạm (escrow).
    - Chỉ giải ngân cho Organizer sau khi khách check-in thành công, hoặc sau thời gian T nào đó.

#### 2.5.a. Mô hình Marketplace với PayOS (Thu hộ → Chi hộ)

> Phần này triển khai riêng cho bài toán **1 sàn – nhiều Organizer**, nền tảng đứng giữa **thu tiền về trước**, sau đó **chi lại cho Organizer sau khi trừ hoa hồng (commission)**.

- **Money-in (Thu tiền từ khách):**
  - Tất cả QR/checkout PayOS dùng **kênh thanh toán đứng tên Sàn/Admin**.
  - Khi khách thanh toán:
    - Tiền chuyển thẳng vào **tài khoản ngân hàng của Sàn** (đã liên kết với PayOS).
    - PayOS gửi **Webhook** về hệ thống:
      - Hệ thống ghi nhận: đơn hàng nào, thuộc Organizer nào, tổng tiền bao nhiêu.
      - Tính toán: `grossAmount` (tổng tiền khách trả), `commissionPercent`, `commissionAmount`, `netAmountForOrganizer`.

- **Hạch toán nội bộ:**
  - Với mỗi `Order` thành công:
    - `amountGross` = tổng tiền vé.
    - `commissionAmount` = `amountGross * commissionPercent`.
    - `amountNetForOrganizer` = `amountGross - commissionAmount - phí giao dịch (nếu có)`.
  - Hệ thống lưu lại các giá trị này để phục vụ đối soát & chi tiền.

- **Money-out (Chi tiền cho Organizer qua API Chi hộ):**
  - Định kỳ (cuối ngày/tuần/tháng) hoặc sau khi sự kiện kết thúc:
    - Gom tất cả order `PAID` của từng Organizer, tính **tổng `amountNetForOrganizer`**.
    - Tạo một bản ghi `Payout` (đối soát/chi tiền) cho mỗi Organizer.
  - Gọi **API Chi hộ (Payout) của PayOS**:
    - Nguồn tiền: tài khoản ngân hàng của Sàn.
    - Đích: tài khoản ngân hàng của từng Organizer.
    - Số tiền: `totalNetAmount` đã tính sau khi trừ commission.
  - Nhận kết quả từ PayOS:
    - Nếu thành công → cập nhật `Payout.status = SUCCESS`, đánh dấu các order đã được “settled”.
    - Nếu thất bại → `Payout.status = FAILED`, để retry hoặc xử lý thủ công.

- **Ý nghĩa nghiệp vụ:**
  - Sàn **kiểm soát hoàn toàn dòng tiền**, chủ động thu **hoa hồng**.
  - Organizer vẫn nhận được báo cáo và tiền rõ ràng, minh bạch theo từng kỳ.
  - Mô hình phù hợp với các **Marketplace nhiều nhà bán**, không cần tính năng “split payment realtime”, tận dụng được **Thu hộ – Chi hộ** của PayOS.

---

### 2.6. Module 6 – Wallet & Customer Management

**Use Case liên quan:**
- UC-19: Lịch sử mua vé
- UC-44: Quản lý ví số dư

**Mục tiêu:**
- Cung cấp cái nhìn tài chính cá nhân cho Customer/Organizer.

**Yêu cầu nghiệp vụ chính:**
- **Lịch sử mua vé (UC-19):**
  - Danh sách đơn hàng đã mua, trạng thái vé (chưa dùng/đã check-in/đã hủy).
  - Filter theo thời gian, sự kiện, trạng thái.
- **Ví số dư (UC-44):**
  - Theo dõi số dư hiện có, các giao dịch vào/ra.
  - Cho phép rút tiền (đối với Organizer), hoàn tiền (đối với Customer).

---

### 2.7. Module 7 – Organizer Portal

**Use Case liên quan:**
- UC-22: Tạo mới sự kiện
- UC-23: Thiết lập sơ đồ ghế
- UC-24: Quản lý Voucher
- UC-25: CRUD nhân viên
- UC-26: Gửi thông báo (Global)
- UC-27: Quản lý đơn hàng
- UC-28: Xuất danh sách khách
- UC-29: Báo cáo & Analytics
- UC-30: Gợi ý giá vé (AI)

**Mục tiêu:**
- Cung cấp “bảng điều khiển” cho Organizer thiết kế, vận hành & tối ưu sự kiện.

**Yêu cầu nghiệp vụ chính:**
- **Tạo mới sự kiện (UC-22):**
  - Nhập thông tin, upload ảnh, chọn thời gian, địa điểm, chính sách.
  - Sau khi tạo → trạng thái `Draft` hoặc `Pending Approval`.
- **Thiết lập sơ đồ ghế (UC-23):**
  - Vẽ layout ghế, chia khu vực, loại vé, giá tiền, số lượng.
- **Quản lý Voucher (UC-24):**
  - Tạo mã giảm giá cố định hoặc theo %.
  - Giới hạn số lượng, thời gian hiệu lực, đối tượng áp dụng.
- **CRUD nhân viên (UC-25):**
  - Organizer tạo tài khoản Staff cho check-in, support.
- **Gửi thông báo (Global) (UC-26):**
  - Gửi email / in-app notification cho Customer hoặc Staff (ví dụ: thay đổi giờ diễn, nhắc sự kiện…).
- **Quản lý đơn hàng (UC-27):**
  - Xem danh sách khách mua vé, số lượng, doanh thu, trạng thái thanh toán.
- **Xuất danh sách khách (UC-28):**
  - Export Excel danh sách người tham dự để dùng offline.
- **Báo cáo & Analytics (UC-29):**
  - Biểu đồ doanh thu theo thời gian, loại vé, khu vực.
  - Tỷ lệ lấp đầy ghế, no-show rate, hiệu quả voucher.
- **Gợi ý giá vé (AI) (UC-30):**
  - Dùng dữ liệu lịch sử (giá vé, tốc độ bán, loại sự kiện, thời gian còn lại…) để đề xuất giá vé tối ưu hoặc dynamic pricing.

---

### 2.8. Module 8 – Check-in & System Automation

**Use Case liên quan:**
- UC-31: Đăng nhập nhân viên
- UC-32: Quét mã QR (Scan)
- UC-33: Xác thực & Check-in
- UC-34: Đăng ký khuôn mặt
- UC-35: (Implicit) Quản lý trạng thái vé
- UC-42: Gửi thông báo tự động
- UC-43: Thanh toán ký quỹ

**Mục tiêu:**
- Hỗ trợ vận hành ngày diễn ra sự kiện & các automation nền.

**Yêu cầu nghiệp vụ chính:**
- **Check-in bằng QR (UC-32, UC-33):**
  - Staff dùng app để scan QR.
  - Hệ thống kiểm tra:
    - Vé có tồn tại không?
    - Đã check-in chưa?
    - Có bị hủy/refund không?
  - Nếu hợp lệ → update trạng thái vé sang `Checked-in`.
- **Đăng ký khuôn mặt (UC-34):**
  - Khách upload ảnh, lưu embedding (FaceID) để sau này check-in nhanh (scan khuôn mặt).
- **Thông báo tự động (UC-42):**
  - Cronjob gửi mail nhắc sự kiện trước 1 ngày/x giờ.
  - Có thể gửi thêm các thông báo hệ thống khác (refund result, waitlist, v.v.).
- **Thanh toán ký quỹ (UC-43):**
  - Như phần Payment đã mô tả: dòng tiền escrow, giải ngân sau check-in thành công.

---

## 3. Workflow Chi Tiết

### 3.1. Luồng Customer mua vé

1. Đăng ký / đăng nhập (UC-01, UC-02, UC-03, UC-05).
2. Tìm kiếm & lọc sự kiện (UC-06).
3. Xem chi tiết sự kiện & sơ đồ ghế (UC-07).
4. Chọn & giữ ghế (UC-09), optional:
   - Thêm sự kiện vào yêu thích (UC-12).
   - Áp dụng mã giảm giá (UC-11).
5. Thanh toán online qua PayOS (UC-17).
6. Hệ thống xuất vé & gửi QR (UC-18).
7. Trước sự kiện 1 ngày, system gửi email nhắc (UC-42).
8. Tại cổng: Staff scan QR, check-in (UC-32, UC-33).
9. Nếu cần hủy vé & hoàn tiền → gửi yêu cầu (UC-15), Admin/ System xử lý (UC-40, UC-39, UC-43).

### 3.2. Luồng Organizer tạo & vận hành sự kiện

1. Đăng ký/Đăng nhập Organizer (UC-21).
2. Tạo mới sự kiện, thiết lập thông tin, sơ đồ ghế (UC-22, UC-23).
3. Gửi sự kiện lên sàn → trạng thái `Pending Approval`.
4. Admin phê duyệt sự kiện (UC-37) → public.
5. Tạo voucher, cấu hình khuyến mãi (UC-24).
6. Theo dõi đơn hàng & khách mua vé (UC-27).
7. Quản lý nhân viên check-in (UC-25).
8. Ngày diễn ra sự kiện: phối hợp với Staff check-in, xử lý sự cố.
9. Sau sự kiện:
   - Xem báo cáo, analytics (UC-29).
   - Nhận tiền đối soát từ sàn (UC-39, UC-44, UC-43).

### 3.3. Luồng Admin vận hành sàn

1. Quản lý user (UC-38): lock/unlock, phân quyền.
2. Duyệt sự kiện mới (UC-37).
3. Xử lý khiếu nại & yêu cầu hoàn tiền (UC-40, UC-15).
4. Quản lý banner, highlight sự kiện (UC-41).
5. Theo dõi đối soát tài chính & rút tiền cho Organizer (UC-39, UC-44).

---

## 4. Mapping Nghiệp Vụ → Database

> Phần này ở mức **logical** (không đi sâu đến từng field kỹ thuật), để sau này dev thiết kế schema / microservice.

### 4.1. Các entity chính

- `User`
  - Thuộc tính: id, name, email, password, role (customer/organizer/staff/admin), avatar, phone, isActive, emailVerified…
  - Liên quan UC-01 → UC-05, UC-21, UC-31, UC-38.

- `Event`
  - Thuộc tính: id, organizerId, title, description, category, location, startTime, endTime, status (draft/pending/approved/published/cancelled), banners, policies…
  - Liên quan UC-22, UC-23, UC-37, UC-41, UC-29.

- `SeatMap` / `TicketType` / `Seat`
  - `SeatMap`: layout ghế theo khu vực.
  - `TicketType`: loại vé, giá, điều kiện.
  - `Seat`: ghế cụ thể (row, col, status: available/held/booked/checked-in).
  - Liên quan UC-07, UC-09, UC-23, UC-29.

- `Order` / `OrderItem`
  - Thông tin order: customerId, eventId, tổng tiền, trạng thái (pending/paid/cancelled/refunded).
  - `OrderItem`: từng ghế / loại vé trong đơn.
  - Liên quan UC-09, UC-11, UC-15, UC-17, UC-19, UC-27.

- `PaymentTransaction`
  - Giao dịch thanh toán với PayOS: amount, method, status, referenceCode, gatewayResponse.
  - Liên quan UC-17, UC-18, UC-39, UC-43.

- `Ticket`
  - Mã vé, QR code, trạng thái (issued/checked-in/cancelled/refunded).
  - Liên quan UC-18, UC-19, UC-32, UC-33.

- `Wallet` / `WalletTransaction`
  - Số dư ví của Organizer/Customer.
  - Giao dịch nạp, rút, hoàn, ký quỹ, giải ngân.
  - Liên quan UC-39, UC-43, UC-44.

- `Complaint` / `RefundRequest`
  - Lưu các yêu cầu hoàn tiền, khiếu nại.
  - Liên quan UC-15, UC-40.

- `Notification`
  - Lưu lịch sử gửi email/thông báo: type, target (user/event), status.
  - Liên quan UC-26, UC-35, UC-42.

- `Waitlist`
  - Danh sách chờ cho từng event (customerId, eventId, priority, createdAt).
  - Liên quan UC-16.

- `FaceEnrollment`
  - Lưu đăng ký khuôn mặt: userId, faceEmbedding (đã mã hóa), status.
  - Liên quan UC-34, UC-33.

### 4.2. Mapping nhanh Use Case → Entity chính

- **UC-01, 02, 03, 04, 05, 21, 31** → `User`
- **UC-06, 07, 08, 22, 23, 37, 41, 29, 30** → `Event`, `SeatMap`, `TicketType`, `Seat`
- **UC-09, 11, 12, 15, 16, 19, 27, 28** → `Order`, `OrderItem`, `Ticket`, `Waitlist`
- **UC-17, 18, 39, 43, 44** → `PaymentTransaction`, `Wallet`, `WalletTransaction`
- **UC-40, 15** → `Complaint` / `RefundRequest`
- **UC-26, 35, 42** → `Notification`
- **UC-32, 33, 34** → `Ticket`, `FaceEnrollment`

---

## 5. Use Case Diagram

> Phần này mô tả text, sau này có thể vẽ lại bằng draw.io / mermaid.

### 5.1. Actor chính

- `Customer`
- `Organizer`
- `Admin`
- `Staff`
- `System` (cronjob, AI engine, email service…)

### 5.2. Nhóm Use Case theo Actor

- **Customer:**
  - UC-01, UC-02, UC-03, UC-04, UC-05
  - UC-06, UC-07, UC-08
  - UC-09, UC-11, UC-12, UC-15, UC-16
  - UC-17, UC-18
  - UC-19, UC-34, UC-38 (một phần, xem profile), UC-44

- **Organizer:**
  - UC-21, UC-22, UC-23, UC-24, UC-25
  - UC-26, UC-27, UC-28, UC-29, UC-30
  - UC-44 (quản lý ví & rút tiền)

- **Admin (Sàn):**
  - UC-37, UC-38, UC-39, UC-40, UC-41

- **Staff (Check-in App):**
  - UC-31, UC-32, UC-33

- **System:**
  - UC-18 (gửi QR tự động)
  - UC-35/42 (gửi thông báo tự động, nhắc sự kiện)
  - UC-43 (xử lý ký quỹ & giải ngân)
  - UC-30 (gợi ý giá vé AI – engine phía sau)

### 5.3. Gợi ý biểu diễn (để em vẽ sau)

- Vẽ 3–4 nhóm:
  - Bên trái: `Customer`, `Organizer`, `Staff`.
  - Ở giữa: “Event Ticketing Platform” (nhiều use case bubble).
  - Bên phải: `Admin`, `System`.
- Kết nối các use case đã liệt kê theo nhóm ở trên.

---

**Ghi chú cho Dev/BA sau này:**
- Tài liệu này là **mức BA/business**, không khóa chặt giải pháp kỹ thuật cụ thể, nhưng đủ để dev:
  - Tách microservice.
  - Thiết kế database logical.
  - Viết API theo từng module (Auth, Event, Booking, Payment, Wallet, Check-in, Notification…).
- Khi code, mỗi Use Case nên map ra:
  - 1–n endpoint REST (hoặc message trong queue).
  - Flow service tương ứng (Auth Service, Event Service, Booking Service, Payment Service, v.v.).

