/**
 * TYPE: UserType - Định nghĩa cấu trúc người dùng cho Event Ticketing Platform
 */
export type UserType = {
  _id: string;
  email: string;
  password: string; // Password đã hash
  firstName: string;
  lastName: string;
  role?: "customer" | "organizer" | "staff" | "admin";
  phone?: string;
  avatar?: string | null; // Cloudinary URL
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  preferences?: {
    preferredDestinations: string[];
    preferredEventTypes: string[];
    budgetRange: {
      min: number;
      max: number;
    };
  };

  totalBookings?: number;
  totalSpent?: number;
  lastLogin?: Date;
  companyId?: string; // ID công ty (cho organizer)
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * TYPE: UserRole - union role hợp lệ, tái sử dụng cho FE/BE
 */
export type UserRole = NonNullable<UserType["role"]>;

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "cancelled"
  | "expired"
  | "refunded";

export type OrganizerBankInfo = {
  bankAccountName: string;
  bankAccountNumber: string;
  bankName?: string;
  bankCode?: string;
};

export type PayoutStatus = "pending" | "success" | "failed" | "skipped";

export type OrderType = {
  _id: string;
  orderCode: number;
  userId: string;
  eventId: string;
  eventName: string;
  organizerId: string;
  channel?: "jsp" | "mobile" | string;

  items: {
    zoneName: string;
    seatId?: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  organizerAmount: number;
  totalAmount: number;

  organizerBank?: OrganizerBankInfo;

  payoutStatus?: PayoutStatus;
  payoutTxnId?: string;
  payoutError?: string;
  payoutAt?: Date;

  status: PaymentStatus;
  payosPaymentLinkId?: string;
  payosCheckoutUrl?: string;
  qrCode?: string;

  paidAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateOrderInput = {
  eventId: string;
  eventName: string;
  organizerId: string;
  items: {
    zoneName: string;
    seatId?: string;
    price: number;
    quantity: number;
  }[];
};

