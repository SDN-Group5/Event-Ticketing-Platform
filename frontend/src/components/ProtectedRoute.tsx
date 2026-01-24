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
  const { getUserRole, setCurrentUser } = useUserStore();

  // ✅ FIX: Chỉ validate token khi có token trong localStorage (tránh lỗi 401 không cần thiết)
  const token = localStorage.getItem("session_id");
  const { isLoading: isValidating, isError: isTokenError } = useQuery({
    queryKey: ["validateToken"],
    queryFn: apiClient.validateToken,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Không refetch khi component mount lại
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    enabled: !!token, // ✅ CHỈ chạy khi có token
  });

  // Fetch user info nếu chưa có (chỉ khi token valid)
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ["fetchCurrentUser"],
    queryFn: async () => {
      const user = await apiClient.fetchCurrentUser();
      setCurrentUser(user);
      return user;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!token && !isTokenError && !isValidating, // Chỉ fetch khi token valid và không đang validate
  });

  const isLoading = isValidating || isLoadingUser;

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

    // Kiểm tra role có trong danh sách allowed không
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirect về dashboard theo role hoặc home
      const roleRedirects: Record<string, string> = {
        customer: "/",
        organizer: "/dashboard/organizer",
        staff: "/dashboard/staff",
        admin: "/dashboard/admin",
      };

      const redirectPath = roleRedirects[userRole] || "/";
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Cho phép truy cập
  return <>{children}</>;
};

export default ProtectedRoute;

