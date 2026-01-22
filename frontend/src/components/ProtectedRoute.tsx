import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute Component
 * Bảo vệ routes dựa trên authentication và role
 * 
 * @param children - Component con cần được bảo vệ
 * @param requireAuth - Yêu cầu đăng nhập (default: true)
 * @param allowedRoles - Danh sách roles được phép truy cập (optional)
 * @param redirectTo - Route redirect nếu không có quyền (default: "/sign-in")
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) => {
  const { isLoggedIn, checkAuth } = useAuthStore();
  const { getUserRole, isCustomer } = useUserStore();

  // ✅ FIX: Chỉ validate token khi có token trong localStorage (tránh lỗi 401 không cần thiết)
  const token = localStorage.getItem("session_id");
  const { isLoading } = useQuery({
    queryKey: ["validateToken"],
    queryFn: apiClient.validateToken,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!token, // ✅ CHỈ chạy khi có token
  });

  // Check auth từ localStorage nếu query chưa chạy
  const hasAuth = isLoggedIn || checkAuth();

  // Nếu đang loading, hiển thị spinner
  if (isLoading) {
    return <LoadingSpinner message="Đang kiểm tra quyền truy cập..." />;
  }

  // Nếu yêu cầu auth nhưng chưa đăng nhập
  if (requireAuth && !hasAuth) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu có yêu cầu về role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = getUserRole();

    // Nếu chưa có user role (chưa fetch user info)
    if (!userRole) {
      // Nếu là customer và không có role, có thể là chưa fetch user
      // Cho phép truy cập nếu không có role requirement cụ thể
      if (isCustomer() && !allowedRoles.includes("customer")) {
        return <Navigate to="/" replace />;
      }
    }

    // Kiểm tra role có trong danh sách allowed không
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirect về dashboard theo role hoặc home
      const roleRedirects: Record<string, string> = {
        hotel_owner: "/dashboard/owner",
        manager: "/dashboard/manager",
        receptionist: "/dashboard/receptionist",
        customer: "/",
      };

      const redirectPath = roleRedirects[userRole] || "/";
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Cho phép truy cập
  return <>{children}</>;
};

export default ProtectedRoute;

