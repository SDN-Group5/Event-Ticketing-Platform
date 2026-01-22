/**
 * Format currency to VND (Vietnamese Dong)
 * @param amount - Số tiền cần format
 * @returns String đã format theo chuẩn VND
 * 
 * Ví dụ:
 * formatVND(1000000) => "1.000.000 VND"
 * formatVND(50000) => "50.000 VND"
 */
export const formatVND = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "0 VND";
  }
  
  // Format với dấu chấm phân cách hàng nghìn
  return `${amount.toLocaleString("vi-VN")} VND`;
};

/**
 * Format currency to VND without unit (chỉ số)
 * @param amount - Số tiền cần format
 * @returns String đã format không có đơn vị
 * 
 * Ví dụ:
 * formatVNDNumber(1000000) => "1.000.000"
 */
export const formatVNDNumber = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "0";
  }
  
  return amount.toLocaleString("vi-VN");
};



