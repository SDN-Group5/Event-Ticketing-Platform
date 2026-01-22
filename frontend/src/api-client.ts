import axiosInstance from "./lib/api-client";
// ✅ Import kiểu dữ liệu form từ auth.schemas thay vì từ pages
import { RegisterFormData, SignInFormData } from "./schemas/auth.schemas";
import {
  HotelSearchResponse,
  HotelType,
  PayOSPaymentLinkResponse,
  UserType,
  HotelWithBookingsType,
  BookingType,
} from "../../shared/types";
import { BookingFormDataForPayOS } from "./forms/BookingForm/BookingFormPayOS";
import { queryClient } from "./main";

//================================================
//CRUD Users
export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

// Get all users (Owner only) - for overview
export const getAllUsers = async (params?: {
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string; // Filter theo companyId (cho employees cùng công ty)
}) => {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  // Tăng limit mặc định lên 1000 để lấy tất cả users
  const limit = params?.limit || 1000;
  queryParams.append("limit", limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.companyId) queryParams.append("companyId", params.companyId);

  const response = await axiosInstance.get(
    `/api/users?${queryParams.toString()}`
  );
  return response.data;
};

// Get user by ID (Owner only)
export const getUserById = async (userId: string) => {
  const response = await axiosInstance.get(`/api/users/${userId}`);
  return response.data;
};

// Update user (Owner only)
export const updateUser = async (
  userId: string,
  userData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role: "user" | "hotel_owner" | "receptionist" | "manager";
    phone: string;
    isActive: boolean;
  }>
) => {
  const response = await axiosInstance.patch(`/api/users/${userId}`, userData);
  return response.data;
};

// Delete user - Soft delete (Owner only)
export const deleteUser = async (userId: string) => {
  const response = await axiosInstance.delete(`/api/users/${userId}`);
  return response.data;
};

// Update user password (Owner only)
export const updateUserPassword = async (
  userId: string,
  newPassword: string
) => {
  const response = await axiosInstance.patch(
    `/api/users/${userId}/password`,
    { newPassword }
  );
  return response.data;
};

// Activate user (Owner only)
export const activateUser = async (userId: string) => {
  const response = await axiosInstance.patch(`/api/users/${userId}/activate`);
  return response.data;
};

export const register = async (formData: RegisterFormData) => {
  const response = await axiosInstance.post("/api/users/register", formData);
  return response.data;
};

export const signIn = async (formData: SignInFormData) => {
  const response = await axiosInstance.post("/api/auth/login", formData);

  // Store JWT token from response body in localStorage
  const token = response.data?.token;
  if (token) {
    localStorage.setItem("session_id", token);
  }

  // Store user info for incognito mode fallback
  if (response.data?.userId) {
    localStorage.setItem("user_id", response.data.userId);
  }

  // Force validate token after successful login to update React Query cache
  try {
    await validateToken();

    // Invalidate and refetch the validateToken query to update the UI
    queryClient.invalidateQueries({ queryKey: ["validateToken"] });

    // Force a refetch to ensure the UI updates
    await queryClient.refetchQueries({ queryKey: ["validateToken"] });
  } catch (error) {
    // Token validation failed, but continue if we have a stored token (incognito mode)
    if (!localStorage.getItem("session_id")) {
      throw error;
    }
  }

  return response.data;
};

export const validateToken = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Not logged in, throw error so React Query knows it failed
      throw new Error("Token invalid");
    }
    // For any other error (network, etc.), also throw
    throw new Error("Token validation failed");
  }
};

export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");

  // Clear localStorage (JWT tokens)
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");

  return response.data;
};

// Development utility to clear all browser storage
export const clearAllStorage = () => {
  // Clear localStorage
  localStorage.clear();
  // Clear sessionStorage
  sessionStorage.clear();
  // Clear cookies (by setting them to expire in the past)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

export const addMyHotel = async (hotelFormData: FormData) => {
  const response = await axiosInstance.post("/api/my-hotels", hotelFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/my-hotels");
  return response.data;
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/my-hotels/${hotelId}`);
  return response.data;
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  const hotelId = hotelFormData.get("hotelId");
  const response = await axiosInstance.put(
    `/api/my-hotels/${hotelId}`,
    hotelFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  maxPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams                  // tham số đàu vào( các object chứa các tiêu chí tìm kiếm)
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();

  //nếu không trống
  if (searchParams.destination && searchParams.destination.trim() !== "") {
    queryParams.append("destination", searchParams.destination.trim());
  }

  queryParams.append("checkIn", searchParams.checkIn || "");
  queryParams.append("checkOut", searchParams.checkOut || "");
  queryParams.append("adultCount", searchParams.adultCount || "");
  queryParams.append("childCount", searchParams.childCount || "");
  queryParams.append("page", searchParams.page || "");
  queryParams.append("maxPrice", searchParams.maxPrice || "");
  queryParams.append("sortOption", searchParams.sortOption || "");

  searchParams.facilities?.forEach((facility) =>
    queryParams.append("facilities", facility)
  );

  searchParams.types?.forEach((type) => queryParams.append("types", type));
  searchParams.stars?.forEach((star) => queryParams.append("stars", star));

  const response = await axiosInstance.get(`/api/hotels/search?${queryParams}`);
  return response.data;
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  const response = await axiosInstance.get("/api/hotels");
  return response.data;
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  const response = await axiosInstance.get(`/api/hotels/${hotelId}`);
  return response.data;
};

// ✅ PayOS: Tạo payment link
export const createPayOSPaymentLink = async (
  hotelId: string,
  numberOfNights: number
): Promise<PayOSPaymentLinkResponse> => {
  const response = await axiosInstance.post(
    `/api/hotels/${hotelId}/bookings/payment-intent`,
    { numberOfNights }
  );
  return response.data;
};

// ✅ Tạo booking sau khi thanh toán PayOS thành công
export const createRoomBooking = async (formData: BookingFormDataForPayOS) => {
  const response = await axiosInstance.post(
    `/api/hotels/${formData.hotelId}/bookings`,
    formData
  );
  return response.data;
};

export const fetchMyBookings = async (): Promise<HotelWithBookingsType[]> => {
  const response = await axiosInstance.get("/api/my-bookings");
  return response.data;
};

export const fetchHotelBookings = async (
  hotelId: string
): Promise<BookingType[]> => {
  const response = await axiosInstance.get(`/api/bookings/hotel/${hotelId}`);
  return response.data;
};

// ============================================
// BOOKINGS MANAGEMENT API (Manager/Receptionist)
// ============================================
export const getAllBookings = async (params?: {
  status?: string;
  hotelId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<{ bookings: BookingType[]; pagination: any }> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.hotelId) queryParams.append("hotelId", params.hotelId);
  if (params?.userId) queryParams.append("userId", params.userId);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await axiosInstance.get(
    `/api/bookings?${queryParams.toString()}`
  );
  return response.data;
};

export const updateBooking = async (
  bookingId: string,
  bookingData: Partial<BookingType>
) => {
  const response = await axiosInstance.put(
    `/api/bookings/${bookingId}`,
    bookingData
  );
  return response.data;
};

// ============================================
// CHECK-IN / CHECK-OUT API
// ============================================
export const checkIn = async (data: { bookingId: string; roomId?: string }) => {
  const response = await axiosInstance.post(
    "/api/v2/booking-operations/check-in",
    data
  );
  return response.data;
};

export const checkOut = async (data: {
  bookingId: string;
  extraCharges?: number;
  notes?: string;
  paymentMethod?: "cash" | "card"; // Payment method cho phần thanh toán bổ sung
}) => {
  const response = await axiosInstance.post(
    "/api/v2/booking-operations/check-out",
    data
  );
  return response.data;
};

// ============================================
// SERVICE REQUESTS API
// ============================================
export const getAllServiceRequests = async (params?: {
  bookingId?: string;
  userId?: string;
  hotelId?: string;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.bookingId) queryParams.append("bookingId", params.bookingId);
  if (params?.userId) queryParams.append("userId", params.userId);
  if (params?.hotelId) queryParams.append("hotelId", params.hotelId);
  if (params?.status) queryParams.append("status", params.status);

  const response = await axiosInstance.get(
    `/api/v2/service-requests?${queryParams.toString()}`
  );
  return response.data;
};

export const createServiceRequest = async (data: {
  bookingId: string;
  userId: string;
  hotelId: string;
  serviceType: string;
  description: string;
  price?: number;
}) => {
  const response = await axiosInstance.post("/api/v2/service-requests", data);
  return response.data;
};

export const updateServiceRequest = async (
  serviceRequestId: string,
  data: { status?: string; price?: number; description?: string }
) => {
  const response = await axiosInstance.patch(
    `/api/v2/service-requests/${serviceRequestId}`,
    data
  );
  return response.data;
};

// Business Insights API functions
export const fetchBusinessInsightsDashboard = async () => {
  const response = await axiosInstance.get("/api/business-insights/dashboard");
  return response.data;
};

export const fetchBusinessInsightsForecast = async () => {
  const response = await axiosInstance.get("/api/business-insights/forecast");
  return response.data;
};

export const fetchBusinessInsightsPerformance = async () => {
  const response = await axiosInstance.get(
    "/api/business-insights/performance"
  );
  return response.data;
};


//================================================
// CRUD Employee
// Employees API functions
export const getAllEmployees = async (params?: {
  companyId?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.companyId) queryParams.append("companyId", params.companyId);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await axiosInstance.get(
    `/api/v2/employees?${queryParams.toString()}`
  );
  return response.data;
};

export const createEmployee = async (employeeData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "receptionist" | "manager" | "hotel_owner";
  phone?: string;
  companyId?: string;
  isActive?: boolean;
}) => {
  const response = await axiosInstance.post("/api/v2/employees", employeeData);
  return response.data;
};

export const updateEmployee = async (
  employeeId: string,
  employeeData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role: "receptionist" | "manager" | "hotel_owner";
    phone: string;
    companyId: string;
    isActive: boolean;
  }>
) => {
  const response = await axiosInstance.patch(
    `/api/v2/employees/${employeeId}`,
    employeeData
  );
  return response.data;
};

export const deleteEmployee = async (employeeId: string) => {
  const response = await axiosInstance.delete(`/api/v2/employees/${employeeId}`);
  return response.data;
};

export const updateEmployeePassword = async (
  employeeId: string,
  newPassword: string
) => {
  const response = await axiosInstance.patch(
    `/api/v2/employees/${employeeId}/password`,
    { newPassword }
  );
  return response.data;
};

export const activateEmployee = async (employeeId: string) => {
  const response = await axiosInstance.patch(
    `/api/v2/employees/${employeeId}/activate`
  );
  return response.data;
};


//================================================
//CRUD  mã giảm giá
// Promotions API functions
export const getAllPromotions = async (params?: {
  hotelId?: string;
  isActive?: boolean;
  currentDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.hotelId) queryParams.append("hotelId", params.hotelId);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());
  if (params?.currentDate)
    queryParams.append("currentDate", params.currentDate);

  const response = await axiosInstance.get(
    `/api/v2/promotions?${queryParams.toString()}`
  );
  return response.data;
};

export const getActivePromotions = async (hotelId?: string) => {
  const queryParams = new URLSearchParams();
  if (hotelId) queryParams.append("hotelId", hotelId);

  const response = await axiosInstance.get(
    `/api/v2/promotions/active?${queryParams.toString()}`
  );
  return response.data;
};

export const createPromotion = async (promotionData: {
  name: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"; // loại giảm giá
  discountValue: number;
  startDate: string;
  endDate: string;
  hotelId?: string;
  minStay?: number;
  maxUsage?: number;
  isActive?: boolean;
}) => {
  const response = await axiosInstance.post(
    "/api/v2/promotions",
    promotionData
  );
  return response.data;
};

export const updatePromotion = async (
  promotionId: string,
  promotionData: Partial<{
    name: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT"; // loại giảm giá
    discountValue: number;
    startDate: string;
    endDate: string;
    hotelId: string;
    minStay: number;
    maxUsage: number;
    isActive: boolean;
  }>
) => {
  const response = await axiosInstance.patch(
    `/api/v2/promotions/${promotionId}`,
    promotionData
  );
  return response.data;
};

// ============================================
// PAYMENTS MANAGEMENT API
// ============================================
export interface PaymentType {
  orderCode: number;
  bookingId: string;
  userId: any;
  hotelId: any;
  hotelName?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  bookingStatus: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetailType extends PaymentType {
  hotelCity?: string;
  customerPhone?: string;
  finalTotalCost?: number;
  paymentMethod?: string;
  adultCount: number;
  childCount: number;
  specialRequests?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  payosInfo?: any;
}

export interface PaymentStatisticsType {
  totalTransactions: number;
  totalRevenue: number;
  statusBreakdown: Record<string, number>;
}

// Lấy danh sách giao dịch thanh toán
export const getAllPayments = async (params?: {
  status?: string;
  paymentStatus?: string;
  hotelId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}): Promise<{ payments: PaymentType[]; pagination: any }> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.paymentStatus) queryParams.append("paymentStatus", params.paymentStatus);
  if (params?.hotelId) queryParams.append("hotelId", params.hotelId);
  if (params?.userId) queryParams.append("userId", params.userId);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await axiosInstance.get(
    `/api/payments?${queryParams.toString()}`
  );
  return response.data;
};

// Lấy chi tiết một giao dịch theo orderCode
export const getPaymentByOrderCode = async (
  orderCode: string
): Promise<{ payment: PaymentDetailType }> => {
  const response = await axiosInstance.get(`/api/payments/${orderCode}`);
  return response.data;
};

// Lấy thống kê giao dịch
export const getPaymentStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
  hotelId?: string;
}): Promise<{ statistics: PaymentStatisticsType }> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.hotelId) queryParams.append("hotelId", params.hotelId);

  const response = await axiosInstance.get(
    `/api/payments/statistics?${queryParams.toString()}`
  );
  return response.data;
};

export const deletePromotion = async (promotionId: string) => {
  const response = await axiosInstance.delete(
    `/api/v2/promotions/${promotionId}`
  );
  return response.data;
};


// ============================================
// Validate Promotion Code
// nghiệp vụ handle giảm giá
export interface ValidatePromotionCodeRequest {
  code: string;
  hotelId: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  numberOfNights: number;
  totalCost: number;
}

export interface ValidatePromotionCodeResponse {
  message: string;
  valid: boolean;
  promotion?: {
    _id: string;
    name: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  };
  discountAmount?: number;
  finalPrice?: number;
  originalPrice?: number;
}

export const validatePromotionCode = async (
  data: ValidatePromotionCodeRequest
): Promise<ValidatePromotionCodeResponse> => { //Promise có nghĩa là chờ  xí khi mô validate xong ta sẽ trả cho mi cái định dạng đúng

  // Sử dụng thư viện axios để gửi một yêu cầu POST đến Server
  // axiosInstance thường đã được cấu hình sẵn Base URL và Headers (Token)
  const response = await axiosInstance.post(
    "/api/v2/promotions/validate",
    data      
  );
  return response.data;
};

