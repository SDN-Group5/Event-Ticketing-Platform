/**
 * PayOS Service (Frontend)
 * Mục đích: Wrapper service cho PayOS API calls từ frontend
 */

import axiosInstance from "../lib/api-client";

export interface PaymentLinkResponse {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  qrCode: string;
  checkoutUrl: string;
}

export interface CreatePaymentLinkRequest {
  hotelId: string;
  numberOfNights: number;
}

/**
 * Tạo payment link từ PayOS
 * Backend sẽ tạo payment link và trả về checkoutUrl
 */
export const createPaymentLink = async (
  data: CreatePaymentLinkRequest
): Promise<PaymentLinkResponse> => {
  const response = await axiosInstance.post(
    `/api/hotels/${data.hotelId}/bookings/payment-intent`,
    { numberOfNights: data.numberOfNights }
  );
  return response.data;
};

/**
 * Redirect đến PayOS checkout page
 */
export const redirectToPayOS = (checkoutUrl: string) => {
  window.location.href = checkoutUrl;
};



