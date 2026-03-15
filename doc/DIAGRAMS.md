# System Architecture & Workflows - Event Ticketing Platform

Tài liệu này tổng hợp các biểu đồ (Diagrams) mô tả kiến trúc và luồng hoạt động của hệ thống dưới dạng **Mermaid**. Bạn có thể copy code này vào [Mermaid Live Editor](https://mermaid.live/) để xem hoặc render trực tiếp nếu tool hỗ trợ.

---

## 1. Kiến Trúc Tổng Quan (System Architecture)
Mô tả cách các Microservices tương tác với nhau thông qua API Gateway và Shared Database/Broker.

```mermaid
graph TD
    User([Customer/Organizer/Staff]) <--> Gateway[API Gateway - Port 4000]
    
    subgraph Microservices
        Gateway -- /api/auth --> Auth[Auth Service - Port 4001]
        Gateway -- /api/v1 --> Layout[Layout Service - Port 4002]
        Gateway -- /api/payments --> Payment[Payment Service - Port 4004]
        Gateway -- /api/checkin --> Checkin[Checkin Service - Port 4005]
    end

    subgraph Infrastructure
        Auth & Layout & Payment & Checkin <--> MongoDB[(MongoDB Atlas)]
        Layout <--> Sockets(Socket.io - Realtime Seats)
        Payment <--> PayOS[PayOS API]
        Payment <--> Email[SMTP Email Service]
        Layout <--> RabbitMQ((RabbitMQ Broker))
        Payment <--> RabbitMQ
    end
```

---

## 2. Luồng Đăng Nhập & Phân Quyền (Auth & RBAC)
Quy trình xác thực người dùng và cấp quyền dựa trên Role.

```mermaid
sequenceDiagram
    participant U as User
    participant G as Gateway
    participant A as Auth Service
    participant DB as MongoDB

    U->>G: POST /api/auth/login (email, password)
    G->>A: Forward Login Request
    A->>DB: Find User & Verify Password
    DB-->>A: User Data (Role: Organizer/Customer/...)
    A->>A: Generate JWT Token (payload: userId, role)
    A-->>G: Return Token + User Info
    G-->>U: HTTP 200 (Set Cookie/Token)
    
    Note over U, DB: Các lần gọi sau: Header Authorization: Bearer [Token]
```

---

## 3. Luồng AI Assistant & Tìm kiếm (Discovery)
Mô tả cách AI Assistant hỗ trợ tìm kiếm và gợi ý đặt vé.

```mermaid
sequenceDiagram
    participant C as Customer
    participant M as Mobile App
    participant L as Layout Service
    participant AI as AI Engine (Logic in App)

    C->>M: Nhập tin nhắn "Tìm show nhạc MU"
    M->>AI: Phân tích keyword 'show', 'nhạc', 'MU'
    M->>L: GET /api/v1/layouts (Fetch All Events)
    L-->>M: Danh sách sự kiện Approved
    AI->>AI: Filters events by keywords
    AI-->>C: Trả về tin nhắn gợi ý + Card Sự Kiện
    C->>M: Nhấn "Đặt ngay"trên Card
    M->>C: Navigation to TicketSelection (eventId)
```

---

## 4. Luồng Đặt Vé & Thanh Toán (Booking Saga)
Mô tả quy trình phức tạp nhất: Giữ ghế -> Thanh toán -> Webhook.

```mermaid
sequenceDiagram
    participant C as Customer
    participant P as Payment Service
    participant OS as PayOS API
    participant R as RabbitMQ
    participant L as Layout Service
    participant S as Socket.io

    C->>P: POST /api/payments/create (eventId, seats)
    P->>P: Start BookingSaga (Cleanup -> Validate Voucher)
    P->>P: Create Order (Status: Pending)
    P->>OS: Create Payment Link
    OS-->>P: checkoutUrl & paymentLinkId
    P-->>C: Trả về checkoutUrl
    
    C->>OS: Thanh toán thành công (Bank Transfer)
    OS->>P: POST /webhook (orderCode, status: PAID)
    
    P->>P: Start PaymentCompleteSaga
    P->>P: Mark Order Status: PAID
    P->>R: Publish 'seats.bulk_sold'
    R->>L: Consume 'seats.bulk_sold'
    L->>L: Update Seat DB: Status SOLD
    L->>S: Broadcast 'seat-update' (eventId, seats)
    S-->>C: Cập nhật sơ đồ ghế realtime
    P->>P: Create Tickets & Send Email (QR)
```

---

## 5. Luồng Hủy Vé & Cấp Voucher (Refund Policy)
Quy trình hoàn tiền 50% bằng Voucher.

```mermaid
sequenceDiagram
    participant C as Customer
    participant P as Payment Service
    participant DB as MongoDB
    participant R as RabbitMQ
    participant L as Layout Service

    C->>P: POST /api/payments/cancel-with-voucher/:id
    P->>DB: Verify Order Status (must be PAID)
    P->>P: Calculate 50% Refund Value
    P->>DB: Create Voucher (Exclusive for User)
    P->>DB: Update Order Status: REFUNDED
    P->>R: Publish 'seats.release'
    R->>L: Consume 'seats.release'
    L->>DB: Reset Seat Status: AVAILABLE
    P-->>C: Thông báo Hủy thành công & Gửi mã Voucher
```

---

## 6. Luồng Kiểm Duyệt & Vận Hành (Admin & Organizer)
Tương tác giữa Organizer tạo sự kiện và Admin phê duyệt.

```mermaid
stateDiagram-v2
    [*] --> Draft: Organizer Creates Event
    Draft --> Pending: Organizer Submits for Approval
    Pending --> Approved: Admin Reviews & Approves
    Pending --> Rejected: Admin Rejects (Need Edit)
    Rejected --> Draft: Organizer Updates
    Approved --> Published: Automatically listing on App
    Published --> Ongoing: Event Starts
    Ongoing --> Completed: Event Ends
```

---

## 7. Luồng Check-in Tại Cổng (Checkin Workflow)
Xử lý quét mã QR bởi Staff.

```mermaid
flowchart TD
    Start([Staff Scans QR]) --> Scan{Scan TicketCode}
    Scan --> FindDB{Find Ticket in DB?}
    FindDB -- No --> Error1[Result: INVALID - Not Found]
    FindDB -- Yes --> CheckStatus{Ticket Status?}
    
    CheckStatus -- "Checked-in" --> Error2[Result: FAIL - Already Used]
    CheckStatus -- "Cancelled/Refunded" --> Error3[Result: FAIL - Invalid]
    CheckStatus -- "Paid/Issued" --> Success[Update Status: Checked-in]
    
    Success --> Log[Create CheckinLog]
    Error1 --> Log
    Error2 --> Log
    Error3 --> Log
    
    Log --> End([Return Result to App])
```

---

## 8. Sơ Đồ Trạng Thái Ghế (Seat State Machine)
Mô tả vòng đời của một vị trí ghế ngồi.

```mermaid
stateDiagram-v2
    [*] --> Available: Initialize Layout
    Available --> Reserved: User holds seat (Booking start)
    Reserved --> Available: Timeout or User Cancels
    Reserved --> Sold: Payment Webhook Received
    Sold --> Available: Order Refunded/Cancelled
    Sold --> CheckedIn: Staff Scans Ticket at Gate
```

---
**Tài liệu này được trích xuất từ cấu trúc thư mục `backend/services/` và mã nguồn các Saga Orchestrator.**
