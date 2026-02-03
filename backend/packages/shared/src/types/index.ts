// ============================================
// USER TYPES
// ============================================
export type UserRole = 'customer' | 'organizer' | 'staff' | 'admin';

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ============================================
// EVENT TYPES
// ============================================
export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  address: string;
  startDate: Date;
  endDate: Date;
  bannerImage?: string;
  organizerId: string;
  status: EventStatus;
  totalSeats: number;
  availableSeats: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BOOKING TYPES
// ============================================
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IBooking {
  _id: string;
  userId: string;
  eventId: string;
  seats: string[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherCode?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  qrCode?: string;
  checkedInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SEAT TYPES
// ============================================
export type SeatStatus = 'available' | 'reserved' | 'sold' | 'unavailable';

export interface ISeat {
  _id: string;
  eventId: string;
  zone: string;
  row: string;
  number: string;
  price: number;
  status: SeatStatus;
  reservedBy?: string;
  reservedUntil?: Date;
}

// ============================================
// VOUCHER TYPES
// ============================================
export type DiscountType = 'percentage' | 'fixed';

export interface IVoucher {
  _id: string;
  code: string;
  eventId?: string;
  organizerId: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// SERVICE COMMUNICATION
// ============================================
export interface ServiceHealthResponse {
  service: string;
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  timestamp: string;
}
