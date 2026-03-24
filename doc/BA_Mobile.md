# Tài liệu triển khai sâu - Organizer Mobile (Dashboard Lite + AI)

**Mục tiêu:** Tăng giá trị cho role `organizer` trên mobile theo hướng "monitor + action nhanh", không thay thế dashboard web full.

**Đối tượng dùng chính:** Organizer đang di chuyển, cần quyết định nhanh trong ngày diễn ra sự kiện.

---

## 1) Product vision và nguyên tắc thiết kế

- Mobile chỉ tập trung:
  - Xem KPI nhanh theo thời gian thực
  - Nhận cảnh báo bất thường
  - Thực hiện tác vụ 1 chạm (quick actions)
  - Xử lý đơn lỗi/check-in tại hiện trường
- Web vẫn là nơi phân tích sâu và cấu hình nâng cao.

**Nguyên tắc UX**
- 3 giây phải thấy thông tin quan trọng.
- 2 chạm để đi tới thao tác chính.
- Không hiển thị quá nhiều biểu đồ phức tạp trên mobile.

---

## 2) Phạm vi chức năng cần có (MVP)

## 2.1 Organizer Home (Dashboard Lite)
- KPI nhanh:
  - Doanh thu hôm nay
  - Vé đã bán hôm nay
  - Check-in rate hôm nay
- Quick actions:
  - Tạo event
  - Mở Scan Ticket
  - Mở Voucher
  - Mở Analytics
- Order quick view:
  - Đơn mới nhất
  

## 2.2 AI Assistant nâng cấp cho organizer
- Nút gợi ý sẵn:
  - Checklist trước giờ diễn dựa theo sự kiện 
  - Đánh giá  seat map 
- Context-aware:
  - Nếu đang chọn event A -> AI trả lời dựa trên dữ liệu event A
  - Có thể kèm KPI/event summary vào prompt

## 2.3 Nghiệp vụ nâng cao trên mobile (ngoài MVP)

Mục tiêu của phần này là tăng năng lực vận hành tại hiện trường. Ưu tiên theo impact/effort:

- **P1 - Làm sớm (impact cao, effort vừa):**
  - **Incident Center:** gom lỗi thanh toán, lỗi quét QR, lỗi vé vào một hàng đợi xử lý nhanh.
  - **Staff Ops nhanh:** duyệt yêu cầu phân công staff, xem staff online/offline theo event.
  - **Broadcast khẩn:** gửi thông báo ngay cho người đã mua vé (đổi cổng, dời giờ, thời tiết xấu).
  - **Offline check-in fallback:** khi mạng chập chờn, lưu tạm kết quả scan và đồng bộ sau.

- **P2 - Làm sau P1 (impact tốt, effort trung bình):**
  - **Capacity & Gate Monitor:** theo dõi tải check-in theo cổng/khu để điều phối nhân sự.
  - **Flash campaign trong ngày:** bật voucher ngắn hạn khi tốc độ bán vé thấp hơn kỳ vọng.
  - **Refund/Exception queue:** danh sách case cần xử lý tay (failed payment, pending refund, dispute).

- **P3 - Mở rộng dài hạn (impact chiến lược, effort cao):**
  - **Payout mini dashboard:** theo dõi tiền thực nhận, phí sàn, trạng thái đối soát.
  - **Post-event snapshot:** báo cáo 1 trang sau sự kiện (doanh thu, lấp đầy, check-in fail rate, bài học).
  - **AI hành động theo ngữ cảnh sâu:** gợi ý quyết định dựa trên xu hướng bán theo giờ và tình trạng cổng check-in.

**Định nghĩa done cho 2.3 (gợi ý):**
- Mỗi nghiệp vụ phải có: trigger rõ ràng, dữ liệu đầu vào, hành động 1-2 chạm, và log lịch sử xử lý.
- Không triển khai tính năng nào nếu chưa xác định owner backend + API contract.
- Bắt buộc có fallback khi mất mạng cho các chức năng hiện trường (scan/check-in/incident).

---

## 3) Luồng người dùng (user flow)

## 3.1 Dashboard Lite
1. Organizer mở app -> vào tab `Manage` hoặc `AI Assistant`.
2. Chọn event hiện hành (nếu có nhiều event).
3. Thấy ngay KPI + cảnh báo + quick actions.
4. Khi có cảnh báo, chạm card để vào màn xử lý (`ScanTicket`, `VoucherManagement`, `EventAnalytics`, `ManageOrdersLite`).

## 3.2 AI Context-aware
1. Organizer chọn event trong dashboard.
2. Vào `AI Assistant`.
3. Bấm quick prompt hoặc nhập tự do.
4. AI trả lời theo ngữ cảnh event đã chọn.

---

## 4) Thông số KPI và quy tắc cảnh báo

## 4.1 KPI công thức
- `RevenueToday = sum(order.totalAmount)` với đơn `PAID` trong ngày.
- `TicketsSoldToday = sum(item.quantity)` với đơn `PAID` trong ngày.
- `CheckinRate = checkedIn / issuedTickets * 100`.

## 4.2 Cảnh báo gợi ý
- **Failed payment spike**:
  - Điều kiện: số đơn failed 15 phút gần nhất > ngưỡng (`>= 10`) hoặc tăng > 2x so với 1 giờ trước.
  - Mức độ: warning/high.
- **Check-in anomaly**:
  - Điều kiện: tỷ lệ scan fail > 15% trong 10 phút.
  - Hoặc lưu lượng check-in tăng đột biến tại 1 cổng.
  - Mức độ: warning/high.

---

## 5) Mapping với module mobile hiện có

Các module đã có:
- `mobile/src/screens/MyEvents.tsx`
- `mobile/src/screens/ScanTicket.tsx`
- `mobile/src/screens/VoucherManagement.tsx`
- `mobile/src/screens/organizer/EventAnalytics.tsx`
- `mobile/src/screens/organizer/CreateEvent.tsx`
- `mobile/src/screens/organizer/SeatMapDesigner.tsx`
- `mobile/src/screens/AIAssistant.tsx`
- `mobile/src/services/paymentApiService.ts`
- `mobile/src/services/checkinApiService.ts`
- `mobile/src/services/voucherApiService.ts`

Kết luận:
- Nền tảng đã đủ để làm dashboard lite.
- Thiếu chính: API tổng hợp organizer metrics + organizer order quick view.

---

## 6) Đề xuất API contract (backend cần bổ sung)

## 6.1 Dashboard summary cho organizer
- `GET /api/organizer/dashboard/summary?eventId=...&range=today`
- Response gợi ý:
```json
{
  "success": true,
  "data": {
    "eventId": "evt_123",
    "revenueToday": 120000000,
    "ticketsSoldToday": 520,
    "issuedTickets": 1000,
    "checkedIn": 310,
    "checkinRate": 31,
    "failedPayments15m": 12,
    "scanFailRate10m": 18.5,
    "alerts": [
      { "type": "failed_payment_spike", "severity": "high", "message": "Failed payment tăng cao 15 phút gần nhất" },
      { "type": "checkin_anomaly", "severity": "warning", "message": "Tỷ lệ scan fail vượt ngưỡng" }
    ]
  }
}
```

## 6.2 Order quick view
- `GET /api/organizer/orders/quick?eventId=...&limit=20`
- Trả về 2 nhóm:
  - `newOrders`
  - `failedOrders`

## 6.3 AI context payload
- `GET /api/organizer/events/:eventId/context-for-ai`
- Trả về: KPI hiện tại, vé theo zone, trạng thái check-in, top voucher.

---

## 7) Thiết kế UI mobile đề xuất

## 7.1 Màn `OrganizerHomeLite` (mới)
- Header:
  - Event selector (dropdown)
  - Trạng thái realtime (last updated)
- Section 1: KPI cards (3 cards)
- Section 2: Alerts list (max 3)
- Section 3: Quick actions (4 buttons)
- Section 4: Order quick view (new/failed)

## 7.2 Điều hướng
- Từ `TabNavigator`:
  - Role organizer vào `Manage` -> mở `OrganizerHomeLite` trước
  - Từ đây điều hướng sang các màn hiện có

---

## 8) Nâng cấp AI Assistant cho organizer (chi tiết)

## 8.1 Quick prompts
- "Checklist trước giờ diễn"
- "Gợi ý giá vé theo tình hình bán"
- "Tối ưu seat map để tăng lấp đầy"
- "Xử lý khi check-in fail tăng cao"

## 8.2 Context-aware prompt strategy
- Prompt hệ thống:
  - Vai trò organizer
  - Trả lời ngắn gọn, hành động được ngay
- Prompt người dùng:
  - Câu hỏi của organizer
  - Context event hiện tại:
    - revenue/tickets/checkin
    - zone seat occupancy
    - failed payment trend
    - voucher usage

## 8.3 Guardrail
- Không trả lời số liệu "bịa":
  - Nếu thiếu dữ liệu -> nói rõ thiếu gì
  - Đưa ra giả định cụ thể
- Không tự ý thực hiện thao tác nguy hiểm (hủy đơn, đổi giá hàng loạt).

---

## 9) Kiến trúc kỹ thuật đề xuất

## 9.1 Frontend mobile
- Tạo service mới:
  - `organizerDashboardApiService.ts`
  - `organizerOrdersApiService.ts`
- Tạo screen mới:
  - `screens/organizer/OrganizerHomeLite.tsx`
- State management:
  - Dùng `useEffect + polling` mỗi 30-60 giây cho ngày diễn ra
  - Cache theo `eventId`

## 9.2 Backend
- Bổ sung endpoint aggregator (dashboard summary).
- Bổ sung endpoint order quick view theo `organizerId` + `eventId`.
- Có thể dùng Redis cache 30-60s để giảm tải.

## 9.3 Bảo mật
- Không để khóa AI trong mobile app.
- Chuyển gọi AI qua backend proxy:
  - Mobile -> Backend `/api/ai/organizer-assistant`
  - Backend mới giữ key provider.

---

## 10) Kế hoạch triển khai theo sprint

## Sprint 1 (3-5 ngày)
- Tạo `OrganizerHomeLite` UI tĩnh + navigation.
- Nối dữ liệu thật cho KPI cơ bản.
- Quick actions điều hướng ổn định.

## Sprint 2 (3-5 ngày)
- Alerts logic + order quick view.
- Polling realtime nhẹ.
- Empty/loading/error state đầy đủ.

## Sprint 3 (3-5 ngày)
- AI quick prompts + context-aware theo event.
- Chuyển AI call về backend proxy.
- Hoàn thiện bảo mật và logging.

---

## 11) Acceptance criteria (điều kiện hoàn thành)

- Organizer mở app thấy KPI trong <= 3 giây (khi mạng ổn định).
- Quick actions hoạt động 100% với role organizer.
- Alerts hiển thị đúng theo điều kiện dữ liệu.
- Order quick view có `new` và `failed`.
- AI trả lời dựa trên event đang chọn, không trả lời chung chung.
- Không còn key AI hardcoded trong mobile.

---

## 12) Test cases tối thiểu

- Event có dữ liệu bình thường -> KPI đúng.
- Event không có đơn -> KPI = 0, UI không crash.
- Mất mạng -> hiển thị lỗi + cho retry.
- Role khác organizer -> không thấy organizer dashboard.
- Dữ liệu check-in fail tăng cao -> alert xuất hiện.
- AI khi thiếu context -> thông báo thiếu dữ liệu, không bịa số.

---

## 13) Rủi ro và phương án xử lý

- **Rủi ro:** Backend chưa có endpoint tổng hợp.
  - **Giải pháp:** làm tạm endpoint adapter trong payment/checkin service.
- **Rủi ro:** Polling nhiều gây tải cao.
  - **Giải pháp:** cache server + tăng interval theo trạng thái event.
- **Rủi ro:** AI phản hồi không ổn định.
  - **Giải pháp:** quick prompts + template fallback + guardrail.

---

## 14) Checklist implementation nhanh (cho dev mới)

- [ ] Tạo `OrganizerHomeLite.tsx`
- [ ] Tạo `organizerDashboardApiService.ts`
- [ ] Tạo `organizerOrdersApiService.ts`
- [ ] Add route vào `AppNavigator`/`TabNavigator`
- [ ] Render KPI + Alerts + Quick Actions + Orders
- [ ] Nâng cấp `AIAssistant.tsx` với quick prompts organizer
- [ ] Nối context event -> `aiAssistantService`
- [ ] Chuyển AI call về backend proxy
- [ ] Test role + test network error

---

## 15) Gợi ý ưu tiên triển khai ngay tuần này

1. Làm `OrganizerHomeLite` bản đầu tiên.
2. Nối KPI thật + quick actions.
3. Bổ sung order quick view.
4. Cuối cùng mới tinh chỉnh AI context nâng cao.

Lý do: Đây là luồng tạo giá trị thực tế nhanh nhất cho organizer trong vận hành hằng ngày.
