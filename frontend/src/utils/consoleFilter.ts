/**
 * Console Filter Utility
 * Lọc các log không cần thiết từ third-party libraries (như PayOS)
 * 
 * Note: PayOS checkout page tự động poll payment status → tạo nhiều XHR requests
 * Đây là behavior bình thường, không phải lỗi
 */

// Chỉ filter trong development mode
if (import.meta.env.DEV) {
  // Danh sách các pattern cần filter
  const FILTER_PATTERNS = [
    /XHR finished loading.*pay\.payos\.vn/i, // PayOS check-status requests
    /check-status/i, // PayOS status checks
  ];

  // Lưu original console methods
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;

  /**
   * Kiểm tra xem message có nên được filter không
   */
  const shouldFilter = (message: string): boolean => {
    return FILTER_PATTERNS.some((pattern) => pattern.test(message));
  };

  /**
   * Filter console.log
   */
  console.log = (...args: any[]) => {
    const message = args.join(" ");
    if (!shouldFilter(message)) {
      originalLog.apply(console, args);
    }
  };

  /**
   * Filter console.info
   */
  console.info = (...args: any[]) => {
    const message = args.join(" ");
    if (!shouldFilter(message)) {
      originalInfo.apply(console, args);
    }
  };

  /**
   * Filter console.warn (giữ lại warnings quan trọng)
   */
  console.warn = (...args: any[]) => {
    const message = args.join(" ");
    if (!shouldFilter(message)) {
      originalWarn.apply(console, args);
    }
  };

  // Không filter console.error - giữ lại tất cả errors để debug
}

/**
 * Enable/Disable console filter
 */
export const enableConsoleFilter = () => {
  // Đã được enable tự động khi import file này (chỉ trong DEV mode)
};

export const disableConsoleFilter = () => {
  // Không cần disable vì chỉ chạy trong DEV mode
};

