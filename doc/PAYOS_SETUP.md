# 💳 Hướng Dẫn Setup PayOS - Cổng Thanh Toán Việt Nam

## 📖 PayOS là gì?

**PayOS** = Cổng thanh toán phổ biến tại Việt Nam, hỗ trợ:
- ✅ **QR Code** (VietQR, VNPay QR)
- ✅ **Thẻ ngân hàng** (ATM, Visa, Mastercard)
- ✅ **Ví điện tử** (MoMo, ZaloPay, ShopeePay)
- ✅ **Thanh toán nhanh** (Fast Payment)
- ✅ **Tiền VND** (phù hợp thị trường VN)

### Tại sao dùng PayOS?
- ✅ **Phù hợp thị trường VN** (VND, ngân hàng VN)
- ✅ **Nhiều phương thức** thanh toán
- ✅ **Dễ tích hợp** (SDK Node.js)
- ✅ **Phí thấp** hơn so với Stripe
- ✅ **Hỗ trợ tiếng Việt**

---

## 🚀 Bước 1: Đăng ký tài khoản PayOS

1. **Truy cập:** https://payos.vn/
2. **Đăng ký** tài khoản doanh nghiệp
3. **Xác thực** thông tin doanh nghiệp
4. **Kích hoạt** tài khoản

---

## 🔑 Bước 2: Lấy API Keys

Sau khi đăng ký thành công:

### Cách 1: Từ Dashboard PayOS

1. **Vào Dashboard:** https://my.payos.vn/ (hoặc https://payos.vn/dashboard)
2. **Nhìn vào sidebar bên trái** → Click vào **"Thiết lập"** (Settings)
3. **Trong phần "Thiết lập"**, tìm mục **"API Keys"** hoặc **"Thông tin API"**
4. **Copy 3 thông tin:**
   - **Client ID** (ví dụ: `123456`)
   - **API Key** (ví dụ: `a1b2c3d4e5f6g7h8i9j0`)
   - **Checksum Key** (ví dụ: `x1y2z3a4b5c6d7e8f9g0`)

### Cách 2: Nếu không thấy trong Settings

1. **Click vào tên tài khoản** (góc trên bên phải) → **"Cài đặt"** hoặc **"Settings"**
2. Hoặc tìm mục **"Tích hợp"** (Integration) hoặc **"API"**
3. Hoặc vào **"Quản lý"** → **"API Keys"**

### Cách 3: Từ URL trực tiếp

Thử truy cập:
- https://my.payos.vn/settings/api-keys
- https://my.payos.vn/integration
- https://my.payos.vn/api-keys

⚠️ **LƯU Ý:** 
- **Checksum Key** là **BÍ MẬT** - không share công khai!
- Có 2 môi trường: **Sandbox** (test) và **Production** (thật)
- Nếu chưa thấy, có thể cần **xác thực tài khoản** trước

---

## ⚙️ Bước 3: Cài đặt Package

```bash
cd backend
npm install @payos/node
```

---

## 🔧 Bước 4: Setup trong Project

### 4.1. Thêm vào `.env`

Mở file `backend/.env` và thêm:

```env
# PayOS Configuration (Thay Stripe)
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here

# Frontend URL (để redirect sau khi thanh toán)
FRONTEND_URL=http://localhost:5173

# PayOS Environment (sandbox hoặc production)
PAYOS_ENV=sandbox  # hoặc "production"
```

**Ví dụ:**
```env
PAYOS_CLIENT_ID=123456
PAYOS_API_KEY=a1b2c3d4e5f6g7h8i9j0
PAYOS_CHECKSUM_KEY=x1y2z3a4b5c6d7e8f9g0
FRONTEND_URL=http://localhost:5173
PAYOS_ENV=sandbox
```

### 4.2. Cập nhật `backend/src/index.ts`

Thay `STRIPE_API_KEY` bằng PayOS keys:

```typescript
const requiredEnvVars = [
  "MONGODB_CONNECTION_STRING",
  "JWT_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  // "STRIPE_API_KEY", // ❌ XÓA
  "PAYOS_CLIENT_ID",    // ✅ THÊM
  "PAYOS_API_KEY",      // ✅ THÊM
  "PAYOS_CHECKSUM_KEY", // ✅ THÊM
];
```

---

## 💻 Bước 5: Tạo PayOS Service

Tạo file `backend/src/services/payos.service.ts`:

```typescript
import PayOS from "@payos/node";

// Khởi tạo PayOS instance
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID as string,
  process.env.PAYOS_API_KEY as string,
  process.env.PAYOS_CHECKSUM_KEY as string
);

export interface PaymentLinkData {
  orderCode: number;        // Mã đơn hàng (unique)
  amount: number;           // Số tiền (VND)
  description: string;      // Mô tả đơn hàng
  returnUrl: string;        // URL redirect sau khi thanh toán thành công
  cancelUrl: string;        // URL redirect khi hủy thanh toán
  items?: Array<{          // Danh sách sản phẩm (optional)
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Tạo payment link từ PayOS
 */
export const createPaymentLink = async (data: PaymentLinkData) => {
  try {
    const paymentLink = await payos.createPaymentLink({
      orderCode: data.orderCode,
      amount: data.amount,
      description: data.description,
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl,
      items: data.items || [],
    });

    return paymentLink;
  } catch (error) {
    console.error("❌ Lỗi tạo payment link:", error);
    throw error;
  }
};

/**
 * Xác thực webhook từ PayOS
 */
export const verifyWebhook = (webhookData: any) => {
  try {
    return payos.verifyPaymentWebhookData(webhookData);
  } catch (error) {
    console.error("❌ Lỗi verify webhook:", error);
    return false;
  }
};

/**
 * Lấy thông tin payment theo orderCode
 */
export const getPaymentInfo = async (orderCode: number) => {
  try {
    const paymentInfo = await payos.getPaymentLinkInformation(orderCode);
    return paymentInfo;
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin payment:", error);
    throw error;
  }
};

export default payos;
```

---

## 🔄 Bước 6: Cập nhật Controller

Cập nhật `backend/src/express/controllers/hotel.controller.ts`:

### 6.1. Thay import Stripe bằng PayOS

```typescript
// ❌ XÓA
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

// ✅ THÊM
import { createPaymentLink, getPaymentInfo } from "../../services/payos.service";
```

### 6.2. Cập nhật `createPaymentIntent`

```typescript
// Tạo payment link từ PayOS
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;
    const userId = req.userId;

    // B1: Kiểm tra khách sạn có tồn tại không
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Không tìm thấy khách sạn" });
    }

    // B2: Tính tổng tiền (Giá x Số đêm) - VND
    const totalCost = hotel.pricePerNight * numberOfNights;

    // B3: Tạo orderCode unique (dùng timestamp + random)
    const orderCode = Date.now() + Math.floor(Math.random() * 1000);

    // B4: Tạo payment link từ PayOS
    const paymentLink = await createPaymentLink({
      orderCode: orderCode,
      amount: totalCost, // VND (không cần nhân 100 như Stripe)
      description: `Đặt phòng khách sạn ${hotel.name} - ${numberOfNights} đêm`,
      returnUrl: `${process.env.FRONTEND_URL}/booking/success?orderCode=${orderCode}`,
      cancelUrl: `${process.env.FRONTEND_URL}/booking/cancel`,
      items: [
        {
          name: `Phòng ${hotel.name}`,
          quantity: 1,
          price: totalCost,
        },
      ],
    });

    // B5: Lưu orderCode vào database (tạm thời) để verify sau
    // Có thể lưu vào Booking với status = "pending"

    // B6: Trả về payment link
    res.status(200).json({
      paymentLinkId: paymentLink.id,
      checkoutUrl: paymentLink.checkoutUrl, // URL để redirect khách hàng
      orderCode: orderCode,
      totalCost: totalCost,
      qrCode: paymentLink.qrCode, // QR code để quét
    });
  } catch (error) {
    console.error("❌ Lỗi createPaymentLink:", error);
    res.status(500).json({ message: "Lỗi khi tạo payment link" });
  }
};
```

### 6.3. Cập nhật `createBooking`

```typescript
// Lưu đơn đặt phòng sau khi thanh toán thành công
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.body; // Thay paymentIntentId bằng orderCode

    if (!orderCode) {
      return res.status(400).json({ 
        message: "orderCode là bắt buộc" 
      });
    }

    // B1: Lấy thông tin payment từ PayOS
    const paymentInfo = await getPaymentInfo(orderCode);

    // B2: Kiểm tra trạng thái thanh toán
    if (paymentInfo.status !== "PAID") {
      return res.status(400).json({
        message: `Thanh toán chưa hoàn tất. Trạng thái: ${paymentInfo.status}`,
      });
    }

    // B3: Kiểm tra thông tin có khớp không
    const hotelId = paymentInfo.data.hotelId || req.params.hotelId;
    if (paymentInfo.data.userId !== req.userId) {
      return res.status(400).json({ 
        message: "Dữ liệu thanh toán không trùng khớp" 
      });
    }

    // B4: Chuẩn bị dữ liệu Booking
    const newBooking: BookingType = {
      ...req.body,
      userId: req.userId,
      hotelId: hotelId,
      createdAt: new Date(),
      status: "confirmed",
      paymentStatus: "paid",
      orderCode: orderCode, // Lưu orderCode thay vì paymentIntentId
    };

    // B5: Lưu Booking vào DB
    const booking = new Booking(newBooking);
    await booking.save();

    // B6: Cập nhật thống kê
    await Hotel.findByIdAndUpdate(hotelId, {
      $inc: {
        totalBookings: 1,
        totalRevenue: newBooking.totalCost,
      },
    });

    await User.findByIdAndUpdate(req.userId, {
      $inc: {
        totalBookings: 1,
        totalSpent: newBooking.totalCost,
      },
    });

    res.status(200).json({ 
      message: "Đặt phòng thành công",
      booking 
    });
  } catch (error) {
    console.error("❌ Lỗi createBooking:", error);
    res.status(500).json({ 
      message: "Đã có lỗi xảy ra khi tạo đơn đặt phòng",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
```

---

## 🔔 Bước 7: Tạo Webhook Handler

Tạo route để nhận webhook từ PayOS:

```typescript
// backend/src/express/routes/payments.ts
import express from "express";
import { verifyWebhook } from "../../services/payos.service";
import Booking from "../../models/booking";

const router = express.Router();

// Webhook endpoint (PayOS sẽ gọi khi có thay đổi trạng thái)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    // B1: Verify webhook data
    const isValid = verifyWebhook(req.body);
    
    if (!isValid) {
      return res.status(400).json({ message: "Invalid webhook data" });
    }

    const { data } = req.body;
    const { orderCode, status } = data;

    // B2: Cập nhật trạng thái booking
    if (status === "PAID") {
      await Booking.findOneAndUpdate(
        { orderCode: orderCode },
        { 
          status: "confirmed",
          paymentStatus: "paid",
        }
      );
    }

    // B3: Trả về success cho PayOS
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Lỗi webhook:", error);
    res.status(500).json({ message: "Webhook error" });
  }
});

export default router;
```

Đăng ký route trong `backend/src/index.ts`:

```typescript
import paymentRoutes from "./express/routes/payments";
app.use("/api/payments", paymentRoutes);
```

---

## 🧪 Bước 8: Test API

### 8.1. Tạo Payment Link

```
POST http://localhost:7002/api/hotels/69500b155caab398322df6a1/bookings/payment-intent
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "numberOfNights": 2
}
```

**Response:**
```json
{
  "paymentLinkId": "xxx",
  "checkoutUrl": "https://pay.payos.vn/web/xxx",
  "orderCode": 1234567890,
  "totalCost": 4000000,
  "qrCode": "data:image/png;base64,..."
}
```

### 8.2. Redirect khách hàng đến `checkoutUrl`

Hoặc hiển thị QR code để quét.

### 8.3. Sau khi thanh toán thành công

PayOS sẽ redirect về `returnUrl` với `orderCode`.

### 8.4. Tạo Booking

```
POST http://localhost:7002/api/hotels/69500b155caab398322df6a1/bookings
Headers:
  Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "orderCode": 1234567890,
  "checkIn": "2024-12-25T14:00:00.000Z",
  "checkOut": "2024-12-27T11:00:00.000Z",
  "adultCount": 2,
  "childCount": 1,
  "totalCost": 4000000
}
```

---

## 📝 Bước 9: Cập nhật Model Booking

Cập nhật `backend/src/models/booking.ts`:

```typescript
// Thay paymentIntentId bằng orderCode
orderCode: { type: Number }, // PayOS order code
// paymentIntentId: { type: String }, // ❌ XÓA
```

---

## ✅ Checklist

- [ ] Đã đăng ký tài khoản PayOS
- [ ] Đã copy Client ID, API Key, Checksum Key
- [ ] Đã cài package `@payos/node`
- [ ] Đã thêm vào `.env`
- [ ] Đã tạo `payos.service.ts`
- [ ] Đã cập nhật controller
- [ ] Đã tạo webhook handler
- [ ] Đã test tạo payment link
- [ ] Đã test thanh toán thành công

---

## 🎯 Ưu điểm PayOS so với Stripe

| Tính năng | Stripe | PayOS |
|-----------|--------|-------|
| **Tiền tệ** | USD, EUR, GBP | **VND** ✅ |
| **Phương thức** | Thẻ quốc tế | **QR, Thẻ VN, Ví điện tử** ✅ |
| **Phí** | 2.9% + $0.30 | **Thấp hơn** ✅ |
| **Phù hợp VN** | ❌ | **✅** |
| **Hỗ trợ VN** | ❌ | **✅** |

---

## 📚 Tài Liệu Tham Khảo

- **PayOS Docs:** https://payos.vn/docs
- **Node.js SDK:** https://github.com/payosvn/payos-node
- **API Reference:** https://payos.vn/docs/api-reference

---

**🎉 Xong! Bây giờ bạn có thể thanh toán bằng PayOS rồi!**

