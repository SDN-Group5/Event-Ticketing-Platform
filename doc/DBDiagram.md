# Thiết kế cơ sở dữ liệu - Event Ticketing Platform

## Có thể tái sử dụng được không?

**Có.** Thiết kế này dùng lại được cho:

| Phần | Tái sử dụng | Ghi chú |
|------|-------------|--------|
| **users** | ✅ Nguyên bản | Dùng cho mọi app có đăng nhập, role (customer/organizer/staff/admin). |
| **event_layouts** | ✅ Nguyên bản | Đã gộp thông tin của Event (name, date, location) trực tiếp vào Layout để dễ truy vấn. |
| **layout_zones** | ✅ Document nhúng | Nằm trong mảng `zones` của `event_layouts`. |
| **seats** | ✅ Nguyên bản | Ghế theo zone, trạng thái (available/reserved/sold), lưu độc lập. |
| **orders** | ⚠️ Chỉnh chút | Đóng vai trò vừa là hoá đơn (payment) vừa là booking. |
| **order_items** | ✅ Document nhúng | Dòng đơn: zone, seat (nullable), price, qty được nhúng trong Order. |

**Khi đem sang dự án khác:**

1. **Copy file DBML** (đoạn từ `Table users` đến hết) → dán vào [dbdiagram.io](https://dbdiagram.io) để xem sơ đồ.
2. **MongoDB:** Các Table được đánh dấu nhúng (embedded) như `layout_zones` và `order_items` không nằm ở collection riêng mà trong collection cha của chúng.
3. **Đổi cổng thanh toán:** Giữ nguyên `orders`, chỉ sửa hoặc thêm cột (vd: `stripe_payment_id`).

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

Table event_layouts {
  id               string [pk, note: 'Mongo ObjectId'] 
  event_id         string [note: 'ObjectId (tham chiếu logic nếu cần, DB hiện tại đang merge vào Layout)']
  
  // Event Info (Merged into Layout in current code)
  event_name       varchar [not null]
  event_date       datetime [not null]
  event_image      varchar
  event_location   varchar
  event_description text
  min_price        int
  
  // Canvas Info
  canvas_width     int         // kích thước canvas vẽ sơ đồ (px)
  canvas_height    int
  canvas_color     varchar     // màu nền
  version          int
  
  // Payout Information
  payout_status    varchar [note: 'unpaid|processing|paid', default: 'unpaid']
  payout_receipt_url varchar
  payout_at        datetime
  
  created_by       string [ref: > users.id] // userId tạo layout
  created_at       datetime
  updated_at       datetime
  
  Note: 'Layout collection (Gộp cả metadata sự kiện)'
}

Table layout_zones {
  id               string [pk, note: 'zoneId (dùng mã string thay vì ObjectId)'] 
  layout_id        string [not null, ref: > event_layouts.id]
  
  name             varchar      // tên zone (VIP, New Seats, Standing,...)
  type             varchar [note: 'seats|standing|stage|exit|barrier']
  
  // Layout parameters
  pos_x            int
  pos_y            int
  size_width       int
  size_height      int
  color            varchar      // màu hex
  rotation         int
  elevation        int
  display_order    int
  
  // Seat Rules
  rows             int
  seats_per_row    int
  price            int
  
  // Cache / Metadata
  total_seats      int
  available_seats  int
  reserved_seats   int
  sold_seats       int
  
  Note: 'Khu vực chỗ ngồi (EMBEDDED TRONG mảng event_layouts.zones)'
}

Table seats {
  id           string [pk, note: 'Mongo ObjectId']
  layout_id    string [not null, ref: > event_layouts.id]
  event_id     string [not null, note: 'Reference to logic Event ID']
  zone_id      string [not null, ref: > layout_zones.id]

  row          int         // số hàng (1,2,3,...)
  seat_number  int         // số ghế trong hàng (1,2,3,...)
  seat_label   varchar     // nhãn ghế hiển thị (A1, B2,...)

  status       varchar [note: 'available|reserved|sold|blocked'] // trạng thái ghế
  reserved_by  string      // user giữ ghế
  reserved_at  datetime
  reservation_expiry datetime
  sold_by      string [ref: > users.id]
  sold_at      datetime
  booking_id   string [ref: > orders.id, note: 'Reference to Order ID (booking = order)']

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
  id                string [pk, note: 'Mongo ObjectId (bản chất là Booking)']
  order_code        bigint [unique, not null]           
  user_id           string [not null, ref: > users.id]  
  event_id          string [not null, note: 'Event ID referenced from Layout']
  event_name        varchar [not null]                  // tên sự kiện (snapshot)
  organizer_id      string [not null, ref: > users.id]

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
  order_id    string [not null, ref: > orders.id]         
  zone_name   varchar [not null]                          
  seat_id     string [ref: > seats.id]                    // null nếu vé đứng
  price       int    [not null]                           
  quantity    int    [not null, default: 1]               
  
  Note: 'Dòng sản phẩm (EMBEDDED TRONG mảng orders.items)'
}

///////////////////////////////////////////////////////
// VOUCHERS / DISCOUNT SERVICE - MÃ GIẢM GIÁ & VOUCHER
///////////////////////////////////////////////////////

Table vouchers {
  id             string [pk, note: 'Mongo ObjectId']           // id voucher

  code           varchar [unique, not null]                    // mã voucher (SUMMER50, CANCEL50-1234,...)
  description    varchar                                       // mô tả ngắn

  discount_type  varchar [not null, note: 'percentage|fixed']  // kiểu giảm giá
  discount_value int    [not null]                             // % hoặc số tiền giảm

  max_uses       int    [not null, default: 1]                 // số lần dùng tối đa
  used_count     int    [not null, default: 0]                 // đã dùng bao nhiêu lần

  start_date     datetime                                      // ngày bắt đầu áp dụng
  end_date       datetime                                      // ngày hết hạn

  minimum_price  int                                           // đơn tối thiểu để áp dụng

  status         varchar [not null, note: 'active|inactive|expired'] // trạng thái

  organizer_id   string [ref: > users.id]                      // organizer sở hữu voucher (nếu có)
  event_id       string [note: 'áp dụng riêng cho Event ID (từ Event Layout)']
  user_id        string [ref: > users.id]                      // voucher cá nhân hoá (huỷ vé thì cấp riêng cho user)

  created_at     datetime
  updated_at     datetime
}