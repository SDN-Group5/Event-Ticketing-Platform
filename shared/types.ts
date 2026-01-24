// Backward-compat shim:
// Nhiều file frontend cũ đang import từ `shared/types`.
// Dự án mới đang có `shared/type.ts` (UserType).
// File này tạo lại `shared/types.ts` để build không bị lỗi import.

export * from "./type";

// Legacy types (tạm thời để không vỡ build khi còn giữ các màn hình cũ).
// Bạn có thể thay dần các `any` này bằng type thật khi implement module Event Ticketing.
export type HotelType = any;
export type BookingType = any;
export type HotelWithBookingsType = any;
export type HotelSearchResponse = any;
export type PaymentIntentResponse = any;
export type PayOSPaymentLinkResponse = any;
export type EmployeeType = any;
export type PromotionType = any;
export type ServiceRequestType = any;

