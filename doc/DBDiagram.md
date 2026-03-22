# Thiết kế cơ sở dữ liệu - Event Ticketing Platform

## Có thể tái sử dụng được không?

**Có.** Thiết kế này dùng lại được cho:

| Phần | Tái sử dụng | Ghi chú |
|------|-------------|--------|
| **users** | ✅ Nguyên bản | Dùng cho mọi app có đăng nhập, role (customer/organizer/staff/admin). |
| **event_layouts** | ✅ Nguyên bản | Đã gộp thông tin Event + trạng thái duyệt (draft/published/rejected/completed). |
| **layout_zones** | ✅ Document nhúng | Nằm trong mảng `zones` của `event_layouts`, hỗ trợ seats/standing/stage. |
| **seats** | ✅ Nguyên bản | Ghế theo zone, trạng thái (available/reserved/sold/blocked), lưu độc lập. |
| **orders** | ✅ Nguyên bản | Đơn hàng (booking + payment), tích hợp voucher, PayOS, saga log. |
| **order_items** | ✅ Document nhúng | Dòng đơn: zone, seat (nullable), seatLabel, price, qty nhúng trong Order. |
| **tickets** | ✅ Nguyên bản | Vé điện tử phát hành sau thanh toán, chứa QR code. |
| **checkin_logs** | ✅ Nguyên bản | Nhật ký soát vé (staff scan QR), lưu kết quả check-in. |
| **bank_accounts** | ✅ Nguyên bản | Tài khoản ngân hàng organizer dùng nhận thanh toán (payout). |
| **vouchers** | ✅ Nguyên bản | Mã giảm giá / voucher cho sự kiện hoặc cá nhân. |

**Khi đem sang dự án khác:**

1. **Copy file DBML** (đoạn từ `Table users` đến hết) → dán vào [dbdiagram.io](https://dbdiagram.io) để xem sơ đồ.
2. **MongoDB:** Các Table được đánh dấu nhúng (embedded) như `layout_zones` và `order_items` không nằm ở collection riêng mà trong collection cha của chúng.
3. **Đổi cổng thanh toán:** Giữ nguyên `orders`, chỉ sửa hoặc thêm cột (vd: `stripe_payment_id`).

---

## Đối chiếu với code hiện tại (ETM)

### 1) Tên collection thực tế trong MongoDB (SDNTicket)

Theo model Mongoose trong `backend/services`, các collection đang dùng thực tế là:

| Service | Model | Collection thực tế |
|--------|-------|--------------------|
| auth-service | User | `users` |
| layout-service | EventLayout | `eventlayouts` |
| layout-service | Seat | `seats` |
| layout-service | BankAccount | `bankaccounts` |
| payment-service | Order | `orders` |
| payment-service | Ticket | `tickets` |
| payment-service | Voucher | `vouchers` |
| checkin-service | CheckinLog | `checkinlogs` |

> Ghi chú: Trong DBML bên dưới dùng tên logic dạng `event_layouts`, `order_items`, ... để dễ đọc. Khi triển khai MongoDB thật, tên collection có thể khác theo tên model + quy tắc pluralize của Mongoose.

### 2) Các cấu trúc nhúng (embedded) trong document

- `eventlayouts.zones[]` tương ứng logic `layout_zones` (không phải collection riêng).
- `orders.items[]` tương ứng logic `order_items` (không phải collection riêng).

### 3) Khuyến nghị đọc sơ đồ

- Dùng phần DBML để hiểu quan hệ nghiệp vụ tổng thể.
- Khi kiểm tra dữ liệu thật trên MongoDB, ưu tiên đối chiếu theo bảng "Collection thực tế" ở trên để tránh nhầm tên.

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
    event_id         string [unique, not null, note: 'ObjectId ref Event (merge vào Layout)']
    
    // Event Info (Merged into Layout)
    event_name       varchar [not null]
    event_date       datetime [not null]
    event_end_date   datetime
    event_image      varchar
    event_location   varchar
    event_description text
    min_price        int
    
    // Canvas Info
    canvas_width     int [not null, default: 800]
    canvas_height    int [not null, default: 600]
    canvas_color     varchar [not null, default: '#0f1219']
    version          int [not null, default: 1]
    
    // Approval workflow
    status           varchar [note: 'draft|published|rejected|completed', default: 'draft']
    rejection_reason varchar
    approved_by      string [ref: > users.id]
    approved_at      datetime
    
    // Payout Information
    payout_status    varchar [note: 'unpaid|processing|paid', default: 'unpaid']
    payout_receipt_url varchar
    payout_at        datetime
    
    // Invoice / billing info
    invoice_business_type varchar [note: 'individual|company', default: 'individual']
    invoice_full_name     varchar
    invoice_address       varchar
    invoice_tax_code      varchar
    
    created_by       string [ref: > users.id]
    created_at       datetime
    updated_at       datetime
    
    Note: 'Layout service - collection thực tế: eventlayouts (Gộp metadata sự kiện + approval + payout)'
  }

  Table layout_zones {
    id               string [pk, note: 'zoneId (client-side UUID, không dùng ObjectId)'] 
    layout_id        string [not null, ref: > event_layouts.id]
    
    name             varchar [not null]
    type             varchar [not null, note: 'seats|standing|stage|exit|barrier']
    
    // Layout parameters
    pos_x            int [not null]
    pos_y            int [not null]
    size_width       int [not null]
    size_height      int [not null]
    color            varchar [not null, note: 'Hex color #RRGGBB']
    rotation         int [default: 0]
    elevation        int [default: 0]
    display_order    int [default: 0]
    
    // Seat zone rules
    rows             int
    seats_per_row    int
    price            int
    
    // Standing zone rules
    capacity         int
    
    // Stage zone settings
    hide_screen      bool [default: false]
    video_url        varchar
    screen_height    int
    screen_width_ratio float
    
    // Hybrid cache metadata (embedded seatMetadata)
    total_seats      int
    available_seats  int
    reserved_seats   int
    sold_seats       int
    blocked_seats    int
    last_updated     datetime
    
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

    Note: 'Layout service - collection thực tế: seats'
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
    payos_link_id    varchar
    payos_checkout_url varchar
    qr_code          text

    // Voucher / discount snapshot
    voucher_code     varchar
    voucher_discount int
    voucher_id       string [ref: > vouchers.id]

    paid_at          datetime
    cancelled_at     datetime

    // Saga execution log (embedded array)
    saga_log         text [note: 'Array[{sagaName, status, steps[]}] - audit trail cho saga']

    created_at       datetime
    updated_at       datetime

    Note: 'Payment service - collection thực tế: orders'
  }

  Table order_items {
    order_id    string [not null, ref: > orders.id]         
    zone_name   varchar [not null]                          
    seat_id     string [ref: > seats.id]
    seat_label  varchar
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

    Note: 'Payment service - collection thực tế: vouchers'
  }

  ///////////////////////////////////////////////////////
  // PAYMENT SERVICE (TICKETS) - VÉ PHÁT HÀNH SAU THANH TOÁN
  ///////////////////////////////////////////////////////

  Table tickets {
    id             string [pk, note: 'Mongo ObjectId']

    ticket_id      varchar [unique, not null]                 // TV-{orderCode}-{itemIndex}
    order_id       string [not null, ref: > orders.id]
    order_code     bigint [not null]
    user_id        string [not null, ref: > users.id]

    event_id       string [not null]
    event_name     varchar [not null]
    zone_name      varchar [not null]
    seat_id        string [ref: > seats.id]                   // null nếu vé đứng
    seat_label     varchar
    price          int [not null]

    qr_payload     text [not null]                            // dữ liệu encode vào QR
    qr_image       text                                       // URL/base64 QR image

    status         varchar [not null, note: 'issued|checked-in|used|cancelled|refunded']
    checked_in_at  datetime
    used_at        datetime
    cancelled_at   datetime

    created_at     datetime
    updated_at     datetime

    Note: 'Payment service - collection thực tế: tickets'
  }

  ///////////////////////////////////////////////////////
  // CHECK-IN SERVICE - NHẬT KÝ SOÁT VÉ
  ///////////////////////////////////////////////////////

  Table checkin_logs {
    id            string [pk, note: 'Mongo ObjectId']

    ticket_code   varchar [not null]                          // map với tickets.ticket_id
    event_id      string
    staff_id      string [not null, ref: > users.id]
    result        varchar [not null, note: 'SUCCESS|ALREADY_CHECKED_IN|INVALID|CANCELLED|REFUNDED|ERROR']
    reason        varchar

    created_at    datetime
    updated_at    datetime

    Note: 'Checkin service - collection thực tế: checkinlogs'
  }

  ///////////////////////////////////////////////////////
  // LAYOUT SERVICE - TÀI KHOẢN NHẬN TIỀN CỦA ORGANIZER
  ///////////////////////////////////////////////////////

  Table bank_accounts {
    id              string [pk, note: 'Mongo ObjectId']

    event_id        string [not null]
    layout_id       string [ref: > event_layouts.id]
    organizer_id    string [not null, ref: > users.id]

    account_name    varchar [not null]
    account_number  varchar [not null]
    bank_name       varchar [not null]
    branch_name     varchar [not null]

    created_at      datetime
    updated_at      datetime

    Note: 'Layout service - collection thực tế: bankaccounts'
  }