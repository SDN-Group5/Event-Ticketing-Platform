# Thiết kế cơ sở dữ liệu - Event Ticketing Platform

## Có thể tái sử dụng được không?

**Có.** Thiết kế này dùng lại được cho:

| Phần | Tái sử dụng | Ghi chú |
|------|-------------|--------|
| **users** | ✅ Nguyên bản | Dùng cho mọi app có đăng nhập, role (customer/organizer/admin). Có thể bỏ `pref_*` nếu không cần. |
| **events** | ✅ Nguyên bản | Chuẩn cho sự kiện: tên, ngày, địa điểm, min_price, created_by. |
| **event_layouts** | ✅ Nguyên bản | Một event – nhiều layout (canvas), phù hợp vẽ sơ đồ chỗ ngồi. |
| **layout_zones** | ✅ Nguyên bản | Zone theo loại: seats / standing / stage. Dùng cho bất kỳ venue nào có khu vực. |
| **seats** | ✅ Nguyên bản | Ghế theo zone, trạng thái (available/reserved/sold), giá, hỗ trợ accessible. |
| **orders** | ⚠️ Chỉnh chút | Cấu trúc đơn hàng + tiền dùng được. Nếu đổi cổng thanh toán (không dùng PayOS) thì đổi/đổi tên: `payos_*`, `order_code` (theo API cổng mới). |
| **order_items** | ✅ Nguyên bản | Dòng đơn: zone, seat (nullable), price, quantity — dùng chung được. |

**Khi đem sang dự án khác:**

1. **Copy file DBML** (đoạn từ `Table users` đến hết `order_items`) → dán vào [dbdiagram.io](https://dbdiagram.io) để xem sơ đồ.
2. **MongoDB:** Mỗi `Table` = một **collection**. Tên collection có thể đặt trùng tên bảng viết thường (vd: `users`, `events`, `event_layouts`, `layout_zones`, `seats`, `orders`, `order_items`).
3. **Đổi cổng thanh toán:** Giữ nguyên `orders` / `order_items`, chỉ sửa hoặc thêm cột trong `orders` (vd: `stripe_payment_id`, `vnpay_txn_ref`...) thay cho `payos_*` nếu cần.
4. **Bỏ bớt field:** Có thể xóa `pref_*`, `company_id`, `org_bank_*`... nếu dự án mới không dùng.

---

## DBML (dbdiagram.io)

///////////////////////////////////////////////////////
// USERS & AUTH SERVICE - BẢNG NGƯỜI DÙNG
///////////////////////////////////////////////////////

Table users {
  id              string [pk, note: 'Mongo ObjectId']
  company_id      string                // id công ty (nếu có, dùng cho organizer/staff)
  email           varchar [unique, not null]  // email đăng nhập
  password        varchar [not null]          // mật khẩu hash
  first_name      varchar [not null]          // họ
  last_name       varchar [not null]          // tên
  phone           varchar                     // số điện thoại
  avatar          varchar                     // url ảnh đại diện
  role            varchar [not null, note: 'customer|organizer|staff|admin'] // vai trò user

  // Địa chỉ
  address_street   varchar
  address_city     varchar
  address_state    varchar
  address_country  varchar
  address_zip_code varchar

  // Sở thích / cấu hình thêm (tuỳ app)
  pref_destinations    text   // danh sách điểm đến ưa thích (JSON/string)
  pref_hotel_types     text   // loại chỗ ở ưa thích
  pref_budget_min      int    // ngân sách tối thiểu
  pref_budget_max      int    // ngân sách tối đa

  // Thống kê
  total_bookings   int        // tổng số booking
  total_spent      bigint     // tổng số tiền đã chi
  last_login       datetime   // lần đăng nhập gần nhất
  is_active        bool       // tài khoản còn hoạt động không

  // Xác thực email / reset mật khẩu
  email_verified       bool
  email_verif_code     varchar
  email_verif_expires  datetime
  password_reset_code  varchar
  password_reset_expires datetime

  created_at datetime   // ngày tạo user
  updated_at datetime   // ngày cập nhật cuối

  Note: 'Auth service - collection users'
}

///////////////////////////////////////////////////////
// EVENTS & LAYOUT SERVICE - SỰ KIỆN & SƠ ĐỒ CHỖ NGỒI
///////////////////////////////////////////////////////

Table events {
  id              string [pk, note: 'Mongo ObjectId (eventId)'] // id sự kiện
  name            varchar          // tên sự kiện
  date            datetime         // ngày giờ diễn ra
  image_url       varchar          // ảnh cover
  location        varchar          // địa điểm
  description     text             // mô tả
  min_price       int              // giá thấp nhất (hiển thị ngoài trang list)
  created_by      string           // id organizer (user tạo sự kiện)
  version         int              // version layout/data
  created_at      datetime
  updated_at      datetime
}

Table event_layouts {
  id             string [pk, note: 'Mongo ObjectId (layoutId)'] // id layout
  event_id       string [not null, ref: > events.id]            // tham chiếu sự kiện
  canvas_width   int         // kích thước canvas vẽ sơ đồ (px)
  canvas_height  int
  canvas_color   varchar     // màu nền
  version        int
  created_by     string      // userId tạo layout
  created_at     datetime
  updated_at     datetime
}

Table layout_zones {
  id            string [pk, note: 'zoneId (string trong layout.zones.id)'] // id zone (khu vực)
  layout_id     string [not null, ref: > event_layouts.id]                // layout chứa zone
  event_id      string [not null, ref: > events.id]                       // sự kiện tương ứng

  name          varchar      // tên zone (VIP, New Seats, Standing,...)
  type          varchar [note: 'seats|standing|stage|barrier']  // loại khu: ghế / đứng / sân khấu / rào
  price         int     [note: 'Giá 1 vé trong zone này']       // giá vé theo khu
  color         varchar      // màu hiển thị trên sơ đồ

  rows          int          // số hàng ghế (nếu type = seats)
  seats_per_row int          // số ghế mỗi hàng

  // Vị trí & kích thước vẽ trên canvas
  pos_x         int
  pos_y         int
  size_width    int
  size_height   int

  created_at    datetime
  updated_at    datetime
}

Table seats {
  id           string [pk, note: 'Mongo ObjectId']          // id ghế
  event_id     string [not null, ref: > events.id]          // sự kiện
  layout_id    string [not null, ref: > event_layouts.id]   // layout
  zone_id      string [not null, ref: > layout_zones.id]    // khu vực

  row          int         // số hàng (1,2,3,...)
  seat_number  int         // số ghế trong hàng (1,2,3,...)
  seat_label   varchar     // nhãn ghế hiển thị (A1, B2,...)

  status       varchar [note: 'available|reserved|sold|blocked'] // trạng thái ghế
  reserved_by  string      // user giữ ghế
  reserved_at  datetime
  reservation_expiry datetime
  sold_by      string      // user xử lý bán
  sold_at      datetime
  booking_id   string      // id booking tương ứng (nếu có)

  price        int         // giá ghế (có thể trùng hoặc khác zone.price)
  discount     int         // giảm giá (nếu có)
  is_accessible bool       // ghế hỗ trợ người khuyết tật
  notes        text        // ghi chú thêm

  version      int
  created_at   datetime
  updated_at   datetime
}

///////////////////////////////////////////////////////
// PAYMENT SERVICE (ORDERS) - ĐƠN HÀNG / THANH TOÁN
///////////////////////////////////////////////////////

Table orders {
  id                string [pk, note: 'Mongo ObjectId'] // id đơn hàng
  order_code        bigint [unique, not null]           // mã orderCode PayOS (số nguyên)
  user_id           string [not null, ref: > users.id]  // người mua (customer)
  event_id          string [not null, ref: > events.id] // sự kiện
  event_name        varchar [not null]                  // tên sự kiện (snapshot)
  organizer_id      string [not null, ref: > users.id]  // organizer nhận tiền

  // Thông tin tài khoản ngân hàng của organizer (để payout)
  org_bank_acct_name   varchar
  org_bank_acct_number varchar
  org_bank_name        varchar
  org_bank_code        varchar

  // Tiền
  subtotal         int   [not null]           // tổng tiền trước phí
  commission_rate  float [not null, default: 0.05] // % hoa hồng app
  commission_amt   int   [not null]           // tiền hoa hồng
  organizer_amt    int   [not null]           // tiền organizer nhận
  total_amount     int   [not null]           // tổng khách trả

  // Kênh & payout
  channel          varchar [note: 'jsp|mobile'] // loại cổng PayOS
  payout_status    varchar [note: 'pending|success|failed|skipped']
  payout_txn_id    varchar
  payout_error     varchar
  payout_at        datetime

  // Trạng thái thanh toán
  status           varchar [note: 'pending|processing|paid|cancelled|expired|refunded']
  payos_link_id    varchar          // id payment link trên PayOS
  payos_checkout_url varchar        // url trang thanh toán PayOS
  qr_code          text             // qrCode trả về từ PayOS (base64/url)

  paid_at          datetime         // thời điểm thanh toán thành công
  cancelled_at     datetime         // thời điểm hủy

  created_at       datetime
  updated_at       datetime
}

Table order_items {
  id          string [pk]                                 // id dòng item
  order_id    string [not null, ref: > orders.id]         // đơn hàng gốc
  zone_name   varchar [not null]                          // tên khu (VIP, New Seats,...)
  seat_id     string [ref: > seats.id]                    // id ghế (null nếu vé đứng/general)
  price       int    [not null]                           // giá 1 vé của item
  quantity    int    [not null, default: 1]               // số lượng vé cho item
}