/**
 * TYPE: UserType - Định nghĩa cấu trúc người dùng
 */
export type UserType = {
  _id: string;
  email: string;
  password: string; // Password đã hash
  firstName: string;
  lastName: string;
  role?: "customer" | "organizer" | "staff" | "admin";
  phone?: string;
  
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  preferences?: {
    preferredDestinations: string[];
    preferredHotelTypes: string[];
    budgetRange: {
      min: number;
      max: number;
    };
  };

  totalBookings?: number;
  totalSpent?: number;
  lastLogin?: Date;
  companyId?: string; // ID công ty (cho employees: manager, receptionist, hotel_owner)
  isActive?: boolean;
  emailVerified?: boolean;
  emailVerificationCode?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetCode?: string | null;
  passwordResetExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};