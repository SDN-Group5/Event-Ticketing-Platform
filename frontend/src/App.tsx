import {
  BrowserRouter as Router, // Bao bọc toàn bộ ứng dụng để sử dụng điều hướng
  Route,                   // Định nghĩa một tuyến đường đơn lẻ
  Routes,                  // Chứa danh sách các Route, giúp chọn ra Route khớp nhất
  Navigate,                // Dùng để chuyển hướng người dùng (Redirect)
} from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout"; // Giao diện riêng cho các trang đăng nhập/đăng ký
import ScrollToTop from "./components/ScrollToTop"; // Tự động cuộn lên đầu trang khi chuyển trang
import { Toaster } from "./components/ui/toaster"; // Hiển thị các thông báo (toast) cho người dùng
import SignIn from "./pages/SignIn";
import useAppContext from "./hooks/useAppContext"; // Hook lấy trạng thái ứng dụng (ví dụ: đã đăng nhập chưa)
import AuthHome from "./pages/AuthHome";

const App = () => {
  // Lấy giá trị isLoggedIn từ Context để kiểm tra người dùng đã đăng nhập hay chưa
  const { isLoggedIn } = useAppContext();

  return (
    <Router>
      {/* Luôn cuộn lên đầu trang mỗi khi route thay đổi */}
      <ScrollToTop />

      <Routes>
        {/* --- AUTH ONLY --- */}
        <Route
          path="/"
          element={
            <AuthLayout>
              <AuthHome />
            </AuthLayout>
          }
        />
        <Route
          path="/sign-in"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />

        {/* Nếu chưa login mà vào / → redirect sang /sign-in */}
        {!isLoggedIn && <Route path="*" element={<Navigate to="/sign-in" />} />}

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