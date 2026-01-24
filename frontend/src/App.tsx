import {
  BrowserRouter as Router, // Bao bọc toàn bộ ứng dụng để sử dụng điều hướng
  Route,                   // Định nghĩa một tuyến đường đơn lẻ
  Routes,                  // Chứa danh sách các Route, giúp chọn ra Route khớp nhất
  Navigate,                // Dùng để chuyển hướng người dùng (Redirect)
} from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout"; // Giao diện riêng cho các trang đăng nhập/đăng ký
import PublicLayout from "./layouts/PublicLayout";
import ScrollToTop from "./components/ScrollToTop"; // Tự động cuộn lên đầu trang khi chuyển trang
import { Toaster } from "./components/ui/toaster"; // Hiển thị các thông báo (toast) cho người dùng
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      {/* Luôn cuộn lên đầu trang mỗi khi route thay đổi */}
      <ScrollToTop />

      <Routes>
        {/* --- PUBLIC --- */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />

        {/* --- AUTH --- */}
        <Route
          path="/sign-in"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout>
              <VerifyEmail />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        {/* --- PROFILE (Protected) --- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* --- XỬ LÝ KHI KHÔNG TÌM THẤY TRANG --- 
            Nếu URL không khớp với bất kỳ route nào ở trên, chuyển hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Component hiển thị thông báo nổi trên cùng */}
      <Toaster />
    </Router>
  );
};

export default App;