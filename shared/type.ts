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
