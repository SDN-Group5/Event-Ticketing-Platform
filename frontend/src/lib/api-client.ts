import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

/**
 * Xác định Base URL của API dựa trên môi trường
 */
const getBaseURL = () => {
  // Ưu tiên: Lấy từ biến môi trường (.env)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Nếu chạy localhost → dùng backend local
  if (window.location.hostname === "localhost") {
    return "http://localhost:7002";
  }

  // Mặc định: localhost
  return "http://localhost:7002";
};

/**
 * Mở rộng cấu hình Axios để thêm metadata (track số lần retry)
 */
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { retryCount: number };
}

/**
 * Tạo axios instance với cấu hình chung cho toàn bộ app
 */
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookies cùng request
  timeout: 30000, // Timeout 30 giây
});

/**
 * REQUEST INTERCEPTOR: Tự động chạy TRƯỚC KHI gửi request
 * - Thêm JWT token vào Authorization header
 * - Khởi tạo metadata để track retry
 */
axiosInstance.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  // Lấy JWT token từ localStorage và thêm vào header
  const token = localStorage.getItem("session_id");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Đã tắt log để giảm noise trong console
  // } else {
  //   if (import.meta.env.DEV) {
  //     console.warn("⚠️  No JWT token found in localStorage for request:", config.url);
  //   }
  // }

  // Khởi tạo retry count = 0
  config.metadata = { retryCount: 0 };

  return config;
});

/**
 * RESPONSE INTERCEPTOR: Tự động chạy SAU KHI nhận response
 * Xử lý các lỗi phổ biến và tự động retry
 */
axiosInstance.interceptors.response.use(
  // Request thành công → trả về response bình thường
  (response) => response,

  // Request thất bại → xử lý lỗi
  async (error) => {
    const { config } = error;

    // Lỗi 401: Token hết hạn → Xóa token và session
    if (error.response?.status === 401) {
      Cookies.remove("session_id");
      localStorage.removeItem("session_id");
    }

    // Lỗi 429: Rate limit → Retry với exponential backoff (1s, 2s, 4s)
    if (error.response?.status === 429 && config) {
      const customConfig = config as CustomAxiosRequestConfig;
      if (customConfig.metadata && customConfig.metadata.retryCount < 3) {
        customConfig.metadata.retryCount += 1;
        const delay = Math.pow(2, customConfig.metadata.retryCount - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return axiosInstance(config);
      }
    }

    // Lỗi network (mất kết nối) → Retry sau 2 giây (tối đa 2 lần)
    if (!error.response && config) {
      const customConfig = config as CustomAxiosRequestConfig;
      if (customConfig.metadata && customConfig.metadata.retryCount < 2) {
        customConfig.metadata.retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return axiosInstance(config);
      }
    }

    // Nếu không retry được → reject error
    return Promise.reject(error);
  }
);

export default axiosInstance;
