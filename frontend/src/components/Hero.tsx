import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { NeoButton } from "./ui/neo-button";
import { NeoCard, NeoCardContent } from "./ui/neo-card";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-yellow-50 overflow-hidden">
      {/* Neo Brutalism Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_#000_25%,_transparent_25%),_linear-gradient(-45deg,_#000_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_#000_75%),_linear-gradient(-45deg,_transparent_75%,_#000_75%)] bg-[size:60px_60px]" />
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Brand Name - Neo Brutalism Style */}
        <h1 
          className="text-7xl md:text-9xl font-bold text-amber-600 mb-10 tracking-tighter uppercase leading-none"
          style={{ textShadow: "6px 6px 0px #000" }}
        >
          MernHolidays
        </h1>

        {/* Main Headline - Neo Brutalism Style */}
        <h2 
          className="text-5xl md:text-7xl font-semibold text-black mb-16 uppercase leading-tight"
          style={{ 
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            textShadow: "3px 3px 0px #000",
            letterSpacing: "0.02em"
          }}
        >
          Đặt Phòng Khách Sạn
          <br />
          Dễ Dàng Hơn
        </h2>

        {/* Description Box - Neo Brutalism Style */}
        <div className="max-w-3xl mx-auto mb-16">
          <NeoCard className="p-8 md:p-10">
            <NeoCardContent className="p-0">
              <p className="text-lg md:text-xl text-black leading-relaxed font-medium">
                Nền tảng kết nối khách hàng với khách sạn chuyên nghiệp.
                <br />
                Tìm kiếm, đặt phòng, thanh toán trực tuyến - Tất cả trong một nơi.
              </p>
            </NeoCardContent>
          </NeoCard>
        </div>

        {/* Call-to-Action Buttons - Neo Brutalism Style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          {/* Đăng Nhập Ngay Button */}
          <NeoButton asChild variant="default" size="lg" className="w-full sm:w-auto">
            <Link to="/sign-in">ĐĂNG NHẬP NGAY</Link>
          </NeoButton>

          {/* Tìm Hiểu Thêm Button */}
          <NeoButton asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link to="#features">TÌM HIỂU THÊM</Link>
          </NeoButton>
        </div>

        {/* Scroll Indicator - Neo Brutalism Style */}
        <div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{ filter: "drop-shadow(3px 3px 0px #000)" }}
        >
          <ChevronDown className="w-8 h-8 text-black" strokeWidth={3} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
