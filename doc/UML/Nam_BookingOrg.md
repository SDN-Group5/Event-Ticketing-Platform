# UML Designs - Nam's Group (Core Booking & Org Setup)

> **Trạng thái triển khai (dựa trên code backend thực tế):**
> - ✅ UC-09, UC-21, UC-22, UC-24, UC-25, UC-18, UC-42 (Job), UC-43 — **Đã có code**
> - ⚠️ UC-16 (Waitlist) — **Thiết kế, chưa có code**
> - ⚠️ UC-26 (Global Notification Broadcast) — **Chỉ có RabbitMQ config, chưa có broadcast endpoint**

---

## UC-09: Select & Hold Seat ✅

### 1. Activity Diagram
```plantuml
@startuml UC09-Activity
|User|
start
:Select a seat on the Seat Map;
:Submit request;

|Layout Service|
:Validate JWT (requireAuth);
:Call seatService.reserveSeat();
:findOneAndUpdate({ status: 'available' });
if (Seat available?) then (Yes)
  :Set status = 'reserved';
  :Set reservationExpiry = now + 15 min;
  :updateZoneCache(layoutId, zoneId);

  |MongoDB (Seats)|
  :Save updated Seat document;
  :Update seatMetadata in EventLayout;

  |Socket.io|
  :broadcastSeatUpdate(eventId, seat);

  |User|
  :Seat reserved for 15 minutes;
  stop
else (No)
  |Layout Service|
  :Return 400 - Seat not available;
  |User|
  :Show error message;
  stop
endif
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant U as User
    participant LS as Layout Service
    participant DB as MongoDB (Seats)
    participant EL as MongoDB (EventLayout)
    participant SK as Socket.io

    U->>LS: POST /api/v1/events/:id/seats/reserve
    LS->>LS: requireAuth middleware
    LS->>DB: findOneAndUpdate({ status:'available' }, { status:'reserved', reservationExpiry: now+15m })
    alt Seat available
        DB-->>LS: Updated seat
        LS->>EL: updateZoneCache(layoutId, zoneId)
        LS->>SK: broadcastSeatUpdate(eventId, seatData)
        SK-->>U: seatStatusUpdate (to all clients in room)
        LS-->>U: 200 OK - Seat reserved
    else Seat taken
        DB-->>LS: null
        LS-->>U: 400 - Seat not available
    end
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Available
    Available --> Reserved: User selects (findOneAndUpdate)
    Reserved --> Available: Cron Job (every 1 min, expiry passed)
    Reserved --> Available: User cancels (releaseReservation)
    Reserved --> Sold: Payment confirmed (bulk-sold)
    Sold --> Available: Order cancelled / refunded
```

### 4. Communication Diagram
```mermaid
graph LR
    U((User)) --> LS[Layout Service]
    LS --> DB[(MongoDB - Seats)]
    LS --> EL[(MongoDB - EventLayout)]
    LS --> SK[Socket.io]
    SK --> U2((Other Users))
```

### 5. Class Diagram
```plantuml
@startuml UC09-Class
skinparam classAttributeIconSize 0

class Seat {
  + _id: ObjectId
  + eventId: ObjectId
  + layoutId: ObjectId
  + zoneId: String
  + row: Number
  + seatNumber: Number
  + seatLabel: String
  + status: Enum(available, reserved, sold, blocked)
  + reservedBy: ObjectId
  + reservedAt: Date
  + reservationExpiry: Date
  + price: Number
  + version: Number
  + isAvailable(): Boolean
  + isExpired(): Boolean
}

class EventLayout {
  + _id: ObjectId
  + eventId: ObjectId
  + zones: List<LayoutZone>
}

class LayoutZone {
  + id: String
  + type: Enum(seats, standing)
  + price: Number
  + seatMetadata: SeatMetadata
}

class SeatMetadata {
  + totalSeats: Number
  + availableSeats: Number
  + reservedSeats: Number
  + soldSeats: Number
  + lastUpdated: Date
}

class SeatService {
  + reserveSeat(eventId, zoneId, row, seatNum, userId): Seat
  + bulkReserveSeats(eventId, seatIds, userId): Seat[]
  + autoReserveSeat(eventId, zoneId, userId): Seat
  + releaseReservation(seatId, userId): Seat
  + updateZoneCache(layoutId, zoneId): SeatMetadata
  + releaseExpiredReservations(): Seat[]
}

class SeatCleanupJob {
  + startSeatCleanupJob(): void
  + schedule: "* * * * *" (every 1 min)
}

class SocketIO {
  + broadcastSeatUpdate(eventId, seatData): void
}

EventLayout "1" *-- "many" LayoutZone : contains
LayoutZone "1" *-- "1" SeatMetadata : caches
Seat "many" o-- "1" EventLayout : layoutId ref
SeatService ..> Seat : manages
SeatService ..> EventLayout : updates cache
SeatService ..> SocketIO : triggers broadcast
SeatCleanupJob ..> SeatService : calls releaseExpiredReservations()
@enduml
```

---

## UC-16: Waitlist Registration ⚠️ (Design Only — Not Yet Implemented)

> **Lưu ý:** Chức năng này chưa có code trong backend. Đây là thiết kế dự kiến.

### 1. Sequence Diagram (Design)
```mermaid
sequenceDiagram
    participant U as User
    participant LS as Layout Service
    participant DB as MongoDB (Waitlist)

    U->>LS: POST /api/v1/waitlist/join (eventId)
    LS->>DB: findOne({ userId, eventId })
    alt Not yet joined
        DB-->>LS: null
        LS->>DB: insertOne({ userId, eventId, status: 'waiting' })
        LS-->>U: 201 - Joined waitlist
    else Already joined
        DB-->>LS: Existing record
        LS-->>U: 400 - Already registered
    end
```

### 2. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Waiting: User joins
    Waiting --> Notified: Ticket released
    Notified --> Purchased: User buys in time
    Notified --> Expired: Time limit passed
```

### 3. Class Diagram (Planned Design)
```plantuml
@startuml UC16-Class
skinparam classAttributeIconSize 0

class Waitlist {
  + _id: ObjectId
  + userId: ObjectId
  + eventId: ObjectId
  + joinedAt: Date
  + notifiedAt: Date
  + status: Enum(waiting, notified, purchased, expired)
}

class User {
  + _id: ObjectId
  + email: String
  + firstName: String
}

class EventLayout {
  + _id: ObjectId
  + eventId: ObjectId
}

Waitlist "many" o-- "1" User : userId ref
Waitlist "many" o-- "1" EventLayout : eventId ref
@enduml
```
> **Note:** This collection does not yet exist in the backend codebase.

---

## UC-21: Organizer Register / Login ✅

### 1. Activity Diagram
```plantuml
@startuml UC21-Activity
|Organizer|
start
if (Have an account?) then (Yes)
  :Enter email & password;
  :Submit POST /api/auth/login;
  |Auth Service|
  :bcrypt.compare(password, hash);
  if (Valid?) then (Yes)
    :Generate JWT { userId, role: 'organizer' };
    |Organizer|
    :Redirect to Organizer Dashboard;
    stop
  else (No)
    :Return 401 Unauthorized;
    |Organizer|
    :Show error;
    stop
  endif
else (No)
  |Organizer|
  :Fill registration form (email, password, name);
  :Submit POST /api/auth/register;
  |Auth Service|
  :Check email uniqueness;
  :bcrypt.hash(password);
  :Create User { role: 'organizer' };
  :Send OTP email via Nodemailer;
  |Organizer|
  :Enter OTP code;
  :Submit POST /api/auth/verify-otp;
  |Auth Service|
  :Verify OTP (expires in 1 min);
  :Set isVerified = true;
  |Organizer|
  :Account activated, proceed to login;
  stop
endif
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant O as Organizer
    participant AS as Auth Service
    participant DB as MongoDB (Users)
    participant ES as Email Service (Nodemailer)

    O->>AS: POST /api/auth/register (email, password, firstName, lastName)
    AS->>DB: findOne({ email })
    DB-->>AS: null (available)
    AS->>AS: bcrypt.hash(password)
    AS->>DB: User.create({ role: 'organizer', isVerified: false })
    AS->>ES: sendVerificationEmail(OTP)
    ES-->>O: Email with 6-digit OTP

    O->>AS: POST /api/auth/verify-otp (otp)
    AS->>DB: Update isVerified = true
    AS-->>O: 200 OK - Activated

    O->>AS: POST /api/auth/login (email, password)
    AS->>DB: findOne({ email })
    AS->>AS: bcrypt.compare(password, hash)
    AS-->>O: JWT Token { role: 'organizer' }
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Registered: POST /register
    Registered --> Verified: OTP confirmed
    Verified --> Active: Login
    Active --> Deactivated: Admin disables
```

### 4. Communication Diagram
```mermaid
graph LR
    O((Organizer)) --> AS[Auth Service]
    AS --> DB[(User Collection)]
    AS --> ES[Email Service]
    AS --> O
```

### 5. Class Diagram
```plantuml
@startuml UC21-Class
skinparam classAttributeIconSize 0

class User {
  + _id: ObjectId
  + email: String
  + password: String (hashed)
  + firstName: String
  + lastName: String
  + role: Enum(user, organizer, staff, admin)
  + isVerified: Boolean
  + isActive: Boolean
  + emailVerificationCode: String
  + companyId: ObjectId
}

class AuthController {
  + register(req, res): void
  + login(req, res): void
  + verifyOtp(req, res): void
  + forgotPassword(req, res): void
  + resetPassword(req, res): void
}

class EmailService {
  + sendVerificationEmail(email, otp): void
  + sendPasswordResetEmail(email, otp): void
}

class JWTMiddleware {
  + verifyToken(req, res, next): void
}

class RoleMiddleware {
  + roleCheck(roles[]): Middleware
}

AuthController ..> User : create / query
AuthController ..> EmailService : send OTP
JWTMiddleware ..> User : decode & attach userId
RoleMiddleware ..> User : check role field
@enduml
```

---

## UC-22: Create New Event ✅

### 1. Activity Diagram
```plantuml
@startuml UC22-Activity
|Organizer|
start
:Enter event info (Title, Date, Location, Image);
:Design Seating Map (Zones, Prices);
:Submit POST /api/v1/layouts;

|Layout Service|
:Check role (organizer or admin);
if (Authorized?) then (No)
  :Return 403 Forbidden;
  |Organizer|
  :Permission denied;
  stop
else (Yes)
  |Layout Service|
  :findOne({ eventId });
  if (Layout exists?) then (Yes)
    :Return 409 Conflict;
    |Organizer|
    :Use PUT to update instead;
    stop
  else (No)
    |Layout Service|
    :Save new EventLayout { status: draft };
    :Filter zones (type: seats, standing);

    |Seat Service|
    repeat
      :Get next Zone;
      if (type = 'seats'?) then (Yes)
        :Compute row labels (A, B, C...);
        :Build seat objects;
      else (standing)
        :Build virtual spots (S1...SN);
      endif

      |MongoDB|
      :insertMany(seat records);
      :Update seatMetadata in EventLayout;

      |Seat Service|
    backward:Next zone;
    repeat while (More zones?)

    |Layout Service|
    :Return 201 Created;
    |Organizer|
    :Event ready;
    stop
  endif
endif
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant O as Organizer
    participant LS as Layout Service
    participant DB as MongoDB (EventLayout)
    participant SS as Seat Service
    participant SDB as MongoDB (Seats)

    O->>LS: POST /api/v1/layouts (eventInfo, zones, canvas)
    LS->>LS: Check role (organizer/admin)
    LS->>DB: findOne({ eventId })
    DB-->>LS: null
    LS->>DB: new EventLayout({...}).save()
    DB-->>LS: Layout saved

    loop For each zone (seats or standing)
        LS->>SS: generateSeatsForZone(eventId, layoutId, zone)
        SS->>SDB: insertMany(seats)
        SS->>DB: updateOne seatMetadata
    end

    LS-->>O: 201 Created
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Draft: Layout created
    Draft --> Published: Admin approves
    Draft --> Rejected: Admin rejects
    Published --> Completed: Event ends
    Rejected --> Draft: Organizer edits & resubmits
```

### 4. Communication Diagram
```mermaid
graph LR
    O((Organizer)) --> LS[Layout Service]
    LS --> DB[(EventLayout)]
    LS --> SS[Seat Service]
    SS --> SDB[(Seats Collection)]
    SS --> DB
```

### 5. Class Diagram
```plantuml
@startuml UC22-Class
skinparam classAttributeIconSize 0

class EventLayout {
  + _id: ObjectId
  + eventId: ObjectId
  + eventName: String
  + eventDate: Date
  + eventImage: String
  + eventLocation: String
  + eventDescription: String
  + minPrice: Number
  + zones: List<LayoutZone>
  + canvasWidth: Number
  + canvasHeight: Number
  + canvasColor: String
  + createdBy: ObjectId
  + version: Number
  + payoutInfo: Object
  + invoiceInfo: Object
}

class LayoutZone {
  + id: String
  + name: String
  + type: Enum(seats, standing)
  + rows: Number
  + seatsPerRow: Number
  + capacity: Number
  + price: Number
  + seatMetadata: SeatMetadata
}

class SeatMetadata {
  + totalSeats: Number
  + availableSeats: Number
  + reservedSeats: Number
  + soldSeats: Number
  + lastUpdated: Date
}

class Seat {
  + _id: ObjectId
  + eventId: ObjectId
  + layoutId: ObjectId
  + zoneId: String
  + row: Number
  + seatNumber: Number
  + seatLabel: String
  + price: Number
  + status: Enum(available, reserved, sold)
}

class LayoutController {
  + createLayout(req, res): void
  + updateLayout(req, res): void
  + deleteLayout(req, res): void
  + getLayoutByEvent(req, res): void
  + validateLayout(req, res): void
}

class SeatService {
  + generateSeatsForZone(eventId, layoutId, zone): Seat[]
  + updateZoneCache(layoutId, zoneId): SeatMetadata
}

EventLayout "1" *-- "many" LayoutZone : contains (embedded)
LayoutZone "1" *-- "1" SeatMetadata : caches (embedded)
Seat "many" o-- "1" EventLayout : layoutId ref
LayoutController ..> EventLayout : create / update / delete
LayoutController ..> SeatService : generateSeatsForZone()
SeatService ..> Seat : insertMany
SeatService ..> EventLayout : updateOne seatMetadata
@enduml
```

---

## UC-24: Voucher Management ✅

### 1. Activity Diagram
```plantuml
@startuml UC24-Activity
|Organizer|
start
:Go to Voucher Management;
:Click "Create New Voucher";
:Fill: code, discountType, discountValue,\nmaxUses, startDate, endDate, minimumPrice;
:Submit POST /api/payments/organizer/vouchers;

|Payment Service|
:Extract organizerId (x-user-id header);
:Normalize code = UPPERCASE;
:Validate discountType (percentage or fixed);
:findOne({ code }) - check uniqueness;
if (Code exists?) then (Yes)
  :Return 400 - Duplicate code;
  |Organizer|
  :Choose different code;
  stop
else (No)
  |Payment Service|
  :Validate endDate not in past;
  if (endDate invalid?) then (Yes)
    :Return 400 - Invalid date;
    |Organizer|
    :Fix and retry;
    stop
  else (No)
    |Payment Service|
    :Voucher.create({ ... status: 'active' });
    |MongoDB|
    :Insert Voucher document;
    |Payment Service|
    :Return 201 Created;
    |Organizer|
    :Voucher is live;
    stop
  endif
endif
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant O as Organizer
    participant PS as Payment Service
    participant DB as MongoDB (Vouchers)
    participant C as Customer

    O->>PS: POST /api/payments/organizer/vouchers
    PS->>DB: findOne({ code })
    DB-->>PS: null
    PS->>DB: Voucher.create({ code, discountType, ... })
    DB-->>PS: Saved
    PS-->>O: 201 Created

    Note over C, PS: Customer applies voucher at checkout
    C->>PS: POST /api/payments/vouchers/preview (items, voucherCode)
    PS->>DB: findOne({ code, status: 'active' })
    PS->>PS: Validate expiry, maxUses, minimumPrice, eventId
    PS-->>C: { subtotal, voucherDiscount, totalAmount }
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Active: Created
    Active --> Expired: endDate < now
    Active --> Exhausted: usedCount >= maxUses
    Active --> Inactive: Organizer disables (PUT)
    Expired --> [*]
    Exhausted --> [*]
```

### 4. Communication Diagram
```mermaid
graph LR
    O((Organizer)) -- CRUD --> PS[Payment Service]
    PS -- findOne/create/update/delete --> DB[(Voucher Collection)]
    C((Customer)) -- preview --> PS
    PS -- validate --> BS[BookingSaga on checkout]
```

### 5. Class Diagram
```plantuml
@startuml UC24-Class
skinparam classAttributeIconSize 0

class Voucher {
  + _id: ObjectId
  + code: String (UPPERCASE, unique)
  + discountType: Enum(percentage, fixed)
  + discountValue: Number
  + maxUses: Number
  + usedCount: Number
  + minimumPrice: Number
  + startDate: Date
  + endDate: Date
  + status: Enum(active, inactive)
  + organizerId: ObjectId
  + eventId: ObjectId
  + userId: ObjectId
}

class VoucherController {
  + createVoucher(req, res): void
  + getVouchers(req, res): void
  + updateVoucher(req, res): void
  + deleteVoucher(req, res): void
  + previewVoucher(req, res): void
}

class BookingSaga {
  + validateVoucherStep: SagaStep
  + execute(ctx): void
}

class Order {
  + _id: ObjectId
  + voucherCode: String
  + voucherId: ObjectId
  + voucherDiscount: Number
  + subtotal: Number
  + totalAmount: Number
}

VoucherController ..> Voucher : CRUD
BookingSaga ..> Voucher : findOne & increment usedCount
Order "many" o-- "0..1" Voucher : voucherId ref
@enduml
```

---

## UC-25: Staff CRUD ✅

### 1. Activity Diagram
```plantuml
@startuml UC25-Activity
|Organizer|
start
:Go to Team Management;
:Click "Add Staff";
:Enter email, firstName, lastName, password;
:Submit POST /api/users/staff;

|Auth Service|
:verifyToken + roleCheck('organizer');
if (Authorized?) then (No)
  :Return 403 Forbidden;
  |Organizer|
  stop
else (Yes)
  |Auth Service|
  :findOne({ email }) - check duplicate;
  if (Email exists?) then (Yes)
    :Return 400 - Email taken;
    |Organizer|
    :Use different email;
    stop
  else (No)
    |Auth Service|
    :User.create({ role:'staff', companyId: organizerId });
    |MongoDB|
    :Insert User document;
    |Auth Service|
    :Return 201 - Staff account created;
    |Organizer|
    :Share credentials with staff member;
    stop
  endif
endif
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant O as Organizer
    participant AS as Auth Service
    participant DB as MongoDB (Users)

    O->>AS: POST /api/users/staff (email, firstName, lastName, password)
    AS->>AS: verifyToken + roleCheck(['organizer'])
    AS->>DB: findOne({ email })
    DB-->>AS: null
    AS->>DB: User.create({ role:'staff', companyId: organizerId })
    DB-->>AS: Staff created
    AS-->>O: 201 - Staff data (no password)

    O->>AS: GET /api/users/staff
    AS->>DB: find({ companyId: organizerId, role: 'staff' })
    DB-->>AS: Staff list (paginated)
    AS-->>O: 200 - Staff list

    O->>AS: PATCH /api/users/staff/:staffId (firstName, isActive...)
    AS->>DB: User.findById(staffId), check companyId
    AS->>DB: staff.save()
    AS-->>O: 200 - Updated

    O->>AS: DELETE /api/users/staff/:staffId
    AS->>DB: findByIdAndDelete(staffId)
    AS-->>O: 200 - Deleted
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Active: Created by Organizer
    Active --> Inactive: isActive = false (PATCH)
    Inactive --> Active: isActive = true (PATCH)
    Active --> Deleted: DELETE /staff/:id
    Inactive --> Deleted: DELETE /staff/:id
    Deleted --> [*]
```

### 4. Communication Diagram
```mermaid
graph LR
    O((Organizer)) --> AS[Auth Service]
    AS --> MW[verifyToken + roleCheck]
    AS --> DB[(User Collection)]
```

### 5. Class Diagram
```plantuml
@startuml UC25-Class
skinparam classAttributeIconSize 0

class User {
  + _id: ObjectId
  + email: String
  + password: String
  + firstName: String
  + lastName: String
  + phone: String
  + role: Enum(user, organizer, staff, admin)
  + companyId: ObjectId
  + isActive: Boolean
}

class UserController {
  + createStaff(req, res): void
  + getStaffList(req, res): void
  + getStaffById(req, res): void
  + updateStaff(req, res): void
  + deleteStaff(req, res): void
}

class JWTMiddleware {
  + verifyToken(req, res, next): void
}

class RoleMiddleware {
  + roleCheck(roles[]): Middleware
}

User "many" o-- "1" User : companyId (Organizer)
UserController ..> User : CRUD (filter by companyId)
UserController ..> JWTMiddleware : protected by
UserController ..> RoleMiddleware : roleCheck(['organizer'])
@enduml
```

---

## UC-18: Ticket Issuance & QR Delivery ✅

### 1. Activity Diagram
```plantuml
@startuml UC18-Activity
|PayOS Gateway|
start
:Send Webhook (Status: PAID);

|Payment Service|
:verifyPaymentWebhookData(signature);
:Find Order by orderCode;
:Run PaymentCompleteSaga;

|PaymentCompleteSaga|
:Step 1 - Mark Order status = 'paid';
:Step 2 - Publish seats.bulk_sold (RabbitMQ);
:Step 3 - Auto-payout to Organizer bank;
:Step 4 - sendPaymentConfirmationEmail;

|Ticket Service|
:createTicketsForOrder(orderId, items);
:Generate QR code per ticket;
:Save Ticket documents { status: 'issued' };

|MongoDB|
:insertMany(Ticket records);

|Email Service|
:sendTicketQREmail(userEmail, tickets);

|Customer|
:Receive email with QR ticket(s);
stop
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant PY as PayOS
    participant PS as Payment Service
    participant PCS as PaymentCompleteSaga
    participant TS as Ticket Service
    participant DB as MongoDB (Tickets)
    participant ES as Email Service
    participant C as Customer

    PY->>PS: POST /webhook { orderCode, status: PAID }
    PS->>PS: verifyPaymentWebhookData(signature)
    PS->>PCS: execute({ order })
    PCS->>PCS: mark-order-paid
    PCS->>PCS: publish seats.bulk_sold (RabbitMQ)
    PCS->>PCS: auto-payout to organizer bank
    PCS->>ES: sendPaymentConfirmationEmail
    PCS->>TS: createTicketsForOrder(orderId, items)
    TS->>TS: Generate QR per ticket
    TS->>DB: insertMany(Ticket records)
    DB-->>TS: Saved
    PCS->>ES: sendTicketQREmail(email, tickets)
    ES-->>C: Email with QR attachments
    PCS-->>PS: Saga done
    PS-->>PY: 200 OK
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Issued: createTicketsForOrder()
    Issued --> Consumed: QR scanned at gate (checkin-service)
    Issued --> Invalidated: Order refunded
    Consumed --> [*]
    Invalidated --> [*]
```

### 4. Communication Diagram
```mermaid
graph LR
    PY[PayOS] --> PS[Payment Service]
    PS --> PCS[PaymentCompleteSaga]
    PCS --> TS[Ticket Service]
    TS --> DB[(Tickets Collection)]
    PCS --> ES[Email Service]
    ES --> C((Customer))
```

### 5. Class Diagram
```plantuml
@startuml UC18-Class
skinparam classAttributeIconSize 0

class Order {
  + _id: ObjectId
  + orderCode: Number
  + userId: ObjectId
  + eventId: ObjectId
  + eventName: String
  + items: List<OrderItem>
  + status: Enum(pending, processing, paid, cancelled)
  + totalAmount: Number
}

class Ticket {
  + _id: ObjectId
  + orderId: ObjectId
  + orderCode: Number
  + userId: ObjectId
  + eventId: ObjectId
  + eventName: String
  + seatId: ObjectId
  + status: Enum(issued, consumed, invalidated)
  + qrCode: String
}

class PaymentCompleteSaga {
  + markPaidStep: SagaStep
  + markSeatsSoldStep: SagaStep
  + autoPayoutStep: SagaStep
  + sendEmailStep: SagaStep
  + createTicketsStep: SagaStep
  + sendTicketQRStep: SagaStep
  + execute(ctx): SagaResult
}

class TicketService {
  + createTicketsForOrder(orderId, orderCode, userId, eventId, items): Ticket[]
}

class EmailService {
  + sendPaymentConfirmationEmail(data): Boolean
  + sendTicketQREmail(data): Boolean
}

PaymentCompleteSaga ..> Order : mark status = paid
PaymentCompleteSaga ..> TicketService : createTicketsForOrder()
PaymentCompleteSaga ..> EmailService : sendTicketQREmail()
TicketService ..> Ticket : insertMany
Ticket "many" o-- "1" Order : orderId ref
@enduml
```

---

## UC-42: Automatic Order Cleanup (Auto Job) ✅

> **Thực tế trong code:** UC-42 trong code là **tự động dọn dẹp đơn hàng hết hạn** (`orderCleanup.ts`) và **tự động giải phóng ghế hết hạn** (`seatCleanup.js`), không phải gửi reminder email.

### 1. Activity Diagram
```plantuml
@startuml UC42-Activity
|System - Order Cleanup (every 20s)|
start
:Find Orders: status IN (pending, processing)\nAND createdAt < now - 5 minutes;

|MongoDB|
:Return expired order list;

|System - Order Cleanup|
if (Expired orders found?) then (Yes)
  repeat
    :Run CancelSaga for each order;
    :Cancel PayOS payment link;
    :Release reserved seats;
    :Delete Order document;
  backward:Next order;
  repeat while (More orders?)
  :Log cleanup complete;
  stop
else (No)
  :No action needed;
  stop
endif

|System - Seat Cleanup (every 1 min)|
start
:Find Seats: status='reserved'\nAND reservationExpiry < now;

|MongoDB|
:Return expired seats;

|System - Seat Cleanup|
if (Expired seats?) then (Yes)
  :updateMany(status = 'available');
  :updateZoneCache for affected zones;
  :broadcastSeatUpdate via Socket.io;
  stop
else (No)
  stop
endif
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant OJ as Order Cleanup Job (20s interval)
    participant SJ as Seat Cleanup Job (node-cron, 1 min)
    participant DB as MongoDB
    participant CS as CancelSaga
    participant PY as PayOS
    participant SK as Socket.io

    loop Every 20 seconds
        OJ->>DB: find({ status: pending/processing, createdAt < now-5min })
        DB-->>OJ: Expired orders
        loop For each expired order
            OJ->>CS: execute({ order, payosClient })
            CS->>PY: cancelPaymentLink(paymentLinkId)
            CS->>DB: Release seats (bulk-release)
            CS->>DB: Delete order
        end
    end

    loop Every 1 minute (node-cron)
        SJ->>DB: find({ status:'reserved', expiry < now })
        DB-->>SJ: Expired seats
        SJ->>DB: updateMany(status = 'available')
        SJ->>DB: updateZoneCache()
        SJ->>SK: broadcastSeatUpdate()
    end
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    state "Order Cleanup" as OC {
        [*] --> Scanning: Every 20 seconds
        Scanning --> Cancelling: Found stale orders
        Cancelling --> Done: All cancelled
        Scanning --> Idle: Nothing to do
    }
    state "Seat Cleanup" as SC {
        [*] --> Scanning2: Every 1 minute (cron)
        Scanning2 --> Releasing: Found expired reservations
        Releasing --> Broadcasting: Socket.io update
        Scanning2 --> Idle2: Nothing to do
    }
```

### 4. Class Diagram
```plantuml
@startuml UC42-Class
skinparam classAttributeIconSize 0

class OrderCleanupJob {
  + startOrderCleanupJob(): void
  + processExpiredOrders(): void
  + interval: 20 seconds (setInterval)
}

class SeatCleanupJob {
  + startSeatCleanupJob(): void
  + schedule: "* * * * *" (node-cron, every 1 min)
}

class CancelSaga {
  + execute(ctx): SagaResult
  + cancelPayOSLink: SagaStep
  + releaseSeatsStep: SagaStep
  + deleteOrderStep: SagaStep
}

class SeatService {
  + releaseExpiredReservations(): Seat[]
}

class Order {
  + _id: ObjectId
  + status: Enum(pending, processing, paid, cancelled)
  + createdAt: Date
}

class Seat {
  + _id: ObjectId
  + status: Enum(available, reserved, sold)
  + reservationExpiry: Date
}

OrderCleanupJob ..> Order : find expired orders
OrderCleanupJob ..> CancelSaga : execute per order
CancelSaga ..> Order : delete
SeatCleanupJob ..> SeatService : releaseExpiredReservations()
SeatService ..> Seat : updateMany status=available
@enduml
```

---

## UC-43: Escrow Payment & Platform Commission ✅

### 1. Activity Diagram
```plantuml
@startuml UC43-Activity
|Customer|
start
:Select seats and proceed to checkout;
:Submit POST /api/payments/create;

|Payment Service (BookingSaga)|
:Validate & apply voucher (if any);
:subtotal = sum(items);
:commissionAmount = totalAmount * 5%;
:organizerAmount = totalAmount - commissionAmount;
:Create Order { status: 'pending' };
:createPaymentLink(PayOS);

|PayOS|
:Generate QR code + checkoutUrl;
:Return payment link;

|Payment Service|
:Order status = 'processing';
:Return checkoutUrl to Customer;

|Customer|
:Complete bank transfer via QR;

|PayOS|
:Send Webhook (PAID);

|Payment Service (PaymentCompleteSaga)|
:Verify webhook signature;
:Mark Order status = 'paid';
:Publish seats.bulk_sold;
if (organizerBank configured?) then (Yes)
  :transferToOrganizerBank(organizerAmount);
  |Bank API|
  :Execute bank transfer;
  |Payment Service|
  :payoutStatus = 'success', payoutTxnId saved;
else (No / Not configured)
  :payoutStatus = 'skipped';
endif
:Create Tickets + Send QR Email;

|Customer|
:Receive confirmation + QR ticket;
stop
@enduml
```

### 2. Sequence Diagram
```mermaid
sequenceDiagram
    participant C as Customer
    participant PS as Payment Service
    participant BS as BookingSaga
    participant PY as PayOS
    participant PCS as PaymentCompleteSaga
    participant BT as BankTransfer Service
    participant B as Bank API

    C->>PS: POST /api/payments/create (items, voucherCode)
    PS->>BS: execute(ctx)
    BS->>BS: commissionAmount = totalAmount * 5%
    BS->>BS: organizerAmount = totalAmount - commission
    BS->>PY: createPaymentLink({ orderCode, amount })
    PY-->>BS: { checkoutUrl, qrCode, paymentLinkId }
    BS->>BS: Save Order { status: 'processing' }
    BS-->>PS: order + paymentLink
    PS-->>C: 201 { checkoutUrl, qrCode }

    C->>PY: Pay via banking app

    PY->>PS: POST /webhook { PAID }
    PS->>PCS: execute({ order })
    PCS->>PCS: mark-order-paid
    PCS->>BT: transferToOrganizerBank(organizerAmount, bankInfo)
    BT->>B: POST /transfers
    B-->>BT: { transactionId }
    BT-->>PCS: success
    PCS->>PCS: Update payoutStatus = 'success'
    PCS->>PCS: Create tickets + Send QR email
    PCS-->>PS: Saga complete
    PS-->>PY: 200 OK
```

### 3. State Diagram
```mermaid
stateDiagram-v2
    [*] --> Pending: Order created (BookingSaga)
    Pending --> Processing: PayOS link created
    Processing --> Paid: Webhook PAID
    Processing --> Cancelled: Expired (5min cleanup job)
    Paid --> Refunded: cancelPaidOrderWithVoucher

    state Paid {
        [*] --> PayoutPending
        PayoutPending --> PayoutSuccess: bank transfer OK
        PayoutPending --> PayoutFailed: bank transfer error
        PayoutPending --> PayoutSkipped: no bank configured
    }
```

### 4. Communication Diagram
```mermaid
graph LR
    C((Customer)) --> PS[Payment Service]
    PS --> BS[BookingSaga]
    BS --> PY[PayOS API]
    PY --> PS
    PS --> PCS[PaymentCompleteSaga]
    PCS --> BT[BankTransfer Service]
    BT --> B[Bank API]
    PCS --> TS[Ticket Service]
    PCS --> ES[Email Service]
```

### 5. Class Diagram
```plantuml
@startuml UC43-Class
skinparam classAttributeIconSize 0

class Order {
  + _id: ObjectId
  + orderCode: Number
  + userId: ObjectId
  + organizerId: ObjectId
  + subtotal: Number
  + commissionRate: Number
  + commissionAmount: Number
  + organizerAmount: Number
  + totalAmount: Number
  + voucherDiscount: Number
  + status: Enum(pending, processing, paid, cancelled)
  + payosPaymentLinkId: String
  + payosCheckoutUrl: String
  + qrCode: String
  + payoutStatus: Enum(pending, success, failed, skipped)
  + payoutTxnId: String
  + organizerBank: BankInfo
}

class BankInfo {
  + bankAccountNumber: String
  + bankAccountName: String
  + bankCode: String
  + bankName: String
}

class BookingSaga {
  + cleanupStep: SagaStep
  + validateVoucherStep: SagaStep
  + createOrderStep: SagaStep
  + createPayOSLinkStep: SagaStep
  + execute(ctx): SagaResult
}

class PaymentCompleteSaga {
  + markPaidStep: SagaStep
  + markSeatsSoldStep: SagaStep
  + autoPayoutStep: SagaStep
  + sendEmailStep: SagaStep
  + createTicketsStep: SagaStep
  + sendTicketQRStep: SagaStep
  + execute(ctx): SagaResult
}

class BankTransferService {
  + transferToOrganizerBank(payload): BankTransferResult
}

class PayOSClient {
  + createPaymentLink(data): PaymentLink
  + cancelPaymentLink(linkId): void
}

Order "1" *-- "1" BankInfo : organizerBank (embedded)
BookingSaga ..> Order : create
BookingSaga ..> PayOSClient : createPaymentLink()
PaymentCompleteSaga ..> Order : mark paid, update payout
PaymentCompleteSaga ..> BankTransferService : transferToOrganizerBank()
BankTransferService ..> PayOSClient : external bank API call
@enduml
```
