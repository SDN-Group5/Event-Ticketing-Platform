// ============================================
// IMPORT CÁC THƯ VIỆN VÀ COMPONENTS
// ============================================// React Query: Quản lý server state (fetching, caching data từ API)
import { useQuery } from "@tanstack/react-query";
// React Router: Điều hướng giữa các trang
import { useNavigate } from "react-router-dom";
// API Client: Các hàm gọi API (fetchHotels, searchHotels, etc.)
import * as apiClient from "../api-client";
// Component hiển thị card khách sạn mới nhất
import LatestDestinationCard from "../components/LastestDestinationCard";
// Component tìm kiếm nâng cao (địa điểm, ngày, số người, giá, v.v.)
import AdvancedSearch from "../components/AdvancedSearch";
// Component Hero section (phần đầu trang với banner và search bar)
import Hero from "../components/Hero";
// Icons từ Lucide React (thư viện icon)
import { Search, MapPin, Calendar, Users, Shield, CreditCard } from "lucide-react";
// Neo Brutalism UI Components (card với style đặc biệt)
import { NeoCard, NeoCardTitle, NeoCardDescription } from "../components/ui/neo-card";

// ============================================
// COMPONENT CHÍNH: HOME PAGE (LANDING PAGE)
// ============================================
const Home = () => {
  // ============================================
  // FETCH DANH SÁCH KHÁCH SẠN TỪ API
  // ============================================
  // useQuery: Tự động fetch data khi component mount
  // "fetchQuery": Key để cache data (React Query sẽ cache theo key này)
  // apiClient.fetchHotels(): Hàm gọi API GET /api/hotels
  // data: hotels → Kết quả trả về từ API (danh sách khách sạn)
  const { data: hotels } = useQuery({
    queryKey: ["fetchHotels"],
    queryFn: () => apiClient.fetchHotels(),
  });

  // ============================================
  // HOOK ĐIỀU HƯỚNG
  // ============================================
  // navigate: Hàm để chuyển trang (tương tự window.location nhưng dùng React Router)
  const navigate = useNavigate();

  // ============================================
  // HANDLER: XỬ LÝ KHI NGƯỜI DÙNG TÌM KIẾM
  // ============================================
  // Khi người dùng nhấn "Tìm kiếm" trong AdvancedSearch component
  // → Chuyển sang trang /search và truyền dữ liệu tìm kiếm qua state
  const handleSearch = (searchData: any) => {
    navigate("/search", { state: { searchData } });
  };

  // ============================================
  // RENDER LANDING PAGE
  // ============================================
  return (
    <>
      {/* ============================================
          PHẦN 1: HERO SECTION
          ============================================
          - Banner lớn ở đầu trang
          - Có thể chứa: Logo, slogan, search bar nhanh
          - Component Hero được import từ ../components/Hero
      */}
      <Hero />

      {/* ============================================
          PHẦN 2: TÍNH NĂNG NỔI BẬT (FEATURES SECTION)
          ============================================
          - Giới thiệu 6 tính năng chính của website
          - Style: Neo Brutalism (border đen dày, shadow, màu vàng/amber)
          - Background: Trắng (bg-white)
      */}
      <section id="features" className="py-20 bg-white">
        {/* Container: Giới hạn chiều rộng tối đa, căn giữa, padding responsive */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header của section: Tiêu đề và mô tả */}
          <div className="text-center mb-16">
            {/* Tiêu đề chính: Font đen, chữ hoa, kích thước lớn */}
            <h2
              className="text-4xl md:text-6xl font-black text-black mb-6 uppercase"
            >
              Tính Năng Nổi Bật
            </h2>
            {/* Mô tả ngắn gọn */}
            <p className="text-xl text-black font-medium">
              Trải nghiệm đặt phòng khách sạn với những tính năng hiện đại
            </p>
          </div>

          {/* Grid layout: 1 cột (mobile) → 2 cột (tablet) → 3 cột (desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ============================================
                CARD 1: TÌM KIẾM THÔNG MINH
                ============================================
                - Icon: Search (kính lúp)
                - Mô tả: Tìm kiếm theo địa điểm, giá, tiện nghi
            */}
            <NeoCard
              className="text-center p-8 bg-yellow-100 transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              {/* Icon box: Nền vàng (amber-500), border đen dày, có shadow */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 border-4 border-black mb-6" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <Search className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              {/* Tiêu đề card */}
              <NeoCardTitle className="mb-3">Tìm Kiếm Thông Minh</NeoCardTitle>
              {/* Mô tả card */}
              <NeoCardDescription>
                Tìm kiếm khách sạn theo địa điểm, giá cả, tiện nghi một cách nhanh chóng
              </NeoCardDescription>
            </NeoCard>

            {/* ============================================
                CARD 2: ĐIỂM ĐẾN TOÀN CẦU
                ============================================
                - Icon: MapPin (đinh ghim bản đồ)
                - Mô tả: Khám phá hàng ngàn khách sạn
            */}
            <NeoCard
              className="text-center p-8 bg-yellow-100 transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 border-4 border-black mb-6" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <MapPin className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <NeoCardTitle className="mb-3">Điểm Đến Toàn Cầu</NeoCardTitle>
              <NeoCardDescription>
                Khám phá hàng ngàn khách sạn tại các điểm đến phổ biến
              </NeoCardDescription>
            </NeoCard>

            {/* ============================================
                CARD 3: ĐẶT PHÒNG LINH HOẠT
                ============================================
                - Icon: Calendar (lịch)
                - Mô tả: Đặt phòng linh hoạt, hủy miễn phí
            */}
            <NeoCard
              className="text-center p-8 bg-yellow-100 transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 border-4 border-black mb-6" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <Calendar className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <NeoCardTitle className="mb-3">Đặt Phòng Linh Hoạt</NeoCardTitle>
              <NeoCardDescription>
                Đặt phòng dễ dàng với lịch trình linh hoạt và hủy miễn phí
              </NeoCardDescription>
            </NeoCard>

            {/* ============================================
                CARD 4: THANH TOÁN AN TOÀN
                ============================================
                - Icon: CreditCard (thẻ tín dụng)
                - Mô tả: Thanh toán với PayOS, bảo mật
            */}
            <NeoCard
              className="text-center p-8 bg-yellow-100 transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 border-4 border-black mb-6" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <CreditCard className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <NeoCardTitle className="mb-3">Thanh Toán An Toàn</NeoCardTitle>
              <NeoCardDescription>
                Thanh toán trực tuyến an toàn với PayOS, bảo mật tuyệt đối
              </NeoCardDescription>
            </NeoCard>

            {/* ============================================
                CARD 5: HỖ TRỢ 24/7
                ============================================
                - Icon: Users (người dùng)
                - Mô tả: Đội ngũ hỗ trợ luôn sẵn sàng
            */}
            <NeoCard
              className="text-center p-8 bg-yellow-100 transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 border-4 border-black mb-6" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <Users className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <NeoCardTitle className="mb-3">Hỗ Trợ 24/7</NeoCardTitle>
              <NeoCardDescription>
                Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giúp đỡ bạn
              </NeoCardDescription>
            </NeoCard>

            {/* ============================================
                CARD 6: BẢO MẬT THÔNG TIN
                ============================================
                - Icon: Shield (khiên bảo vệ)
                - Mô tả: Mã hóa và bảo vệ thông tin
            */}
            <NeoCard
              className="text-center p-8 bg-yellow-100 transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 border-4 border-black mb-6" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <Shield className="w-10 h-10 text-black" strokeWidth={3} />
              </div>
              <NeoCardTitle className="mb-3">Bảo Mật Thông Tin</NeoCardTitle>
              <NeoCardDescription>
                Thông tin cá nhân được mã hóa và bảo vệ an toàn
              </NeoCardDescription>
            </NeoCard>
          </div>
        </div>
      </section>

      {/* ============================================
          PHẦN 3: TÌM KIẾM NÂNG CAO (SEARCH SECTION)
          ============================================
          - Form tìm kiếm đầy đủ: địa điểm, ngày, số người, giá, tiện nghi
          - Background: Vàng nhạt (bg-yellow-50)
          - Component AdvancedSearch: Xử lý logic tìm kiếm
          - onSearch: Callback khi người dùng nhấn "Tìm kiếm" → chuyển sang /search
      */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header của section */}
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-6xl font-black text-black mb-6 uppercase"
            >
              Bắt Đầu Tìm Kiếm
            </h2>
            <p className="text-xl text-black font-medium">
              Tìm khách sạn phù hợp với nhu cầu của bạn
            </p>
          </div>
          {/* Component tìm kiếm: Truyền hàm handleSearch để xử lý khi submit */}
          <AdvancedSearch onSearch={handleSearch} />
        </div>
      </section>

      {/* ============================================
          PHẦN 4: ĐIỂM ĐẾN MỚI NHẤT (LATEST DESTINATIONS)
          ============================================
          - Hiển thị danh sách khách sạn mới nhất từ API
          - Background: Trắng (bg-white)
          - Grid layout: 1 cột (mobile) → 2 cột (tablet) → 3 cột (desktop)
          - hotels: Data từ useQuery ở trên (danh sách khách sạn)
          - map(): Duyệt qua từng hotel và render LatestDestinationCard
          - key={hotel._id}: React cần key để optimize re-render
      */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header của section */}
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black text-black mb-6 uppercase"
            >
              Điểm Đến Mới Nhất
            </h2>
            <p className="text-xl text-black font-medium">
              Những điểm đến mới nhất được thêm bởi các chủ khách sạn của chúng tôi
            </p>
          </div>

          {/* Grid hiển thị danh sách khách sạn */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 
              Conditional Rendering: 
              - hotels?.map(): Chỉ render nếu hotels có data (?. = optional chaining)
              - Nếu hotels = undefined/null → Không render gì (không bị lỗi)
            */}
            {hotels?.map((hotel) => (
              <LatestDestinationCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// Export component để sử dụng ở các file khác (App.tsx, routes, etc.)
export default Home;
