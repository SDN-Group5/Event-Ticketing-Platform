import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer 
      className="bg-yellow-50 border-t-4 border-black"
      style={{ boxShadow: "0px -4px 0px 0px #000" }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div 
                className="bg-amber-500 p-2 border-4 border-black flex items-center justify-center"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Building2 className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <span className="text-2xl font-black text-black uppercase">
                MernHolidays
              </span>
            </div>
            <p className="text-black leading-relaxed font-medium">
              Khám phá những khách sạn, resort và chỗ nghỉ tuyệt vời trên toàn thế giới.
              Đặt phòng với sự tự tin và tận hưởng những trải nghiệm đáng nhớ.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-white border-4 border-black text-black flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Facebook className="w-5 h-5" strokeWidth={2.5} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white border-4 border-black text-black flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Twitter className="w-5 h-5" strokeWidth={2.5} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white border-4 border-black text-black flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Instagram className="w-5 h-5" strokeWidth={2.5} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white border-4 border-black text-black flex items-center justify-center transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Linkedin className="w-5 h-5" strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-black uppercase">
              Liên Kết Nhanh
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Trang Chủ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Khách Sạn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Điểm Đến
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Về Chúng Tôi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-black uppercase">
              Hỗ Trợ
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Trung Tâm Trợ Giúp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Hướng Dẫn Đặt Phòng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Chính Sách Hủy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  Điều Khoản Dịch Vụ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-black uppercase">
              Liên Hệ
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 bg-amber-500 border-4 border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "2px 2px 0px 0px #000" }}
                >
                  <Mail className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <span className="text-black font-medium">support@mernholidays.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 bg-amber-500 border-4 border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "2px 2px 0px 0px #000" }}
                >
                  <Phone className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <span className="text-black font-medium">+84 (0) 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 bg-amber-500 border-4 border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "2px 2px 0px 0px #000" }}
                >
                  <MapPin className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <span className="text-black font-medium">
                  123 Đường Du Lịch, Thành Phố Du Lịch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-4 border-black mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-black text-sm font-medium">
            © 2025 MernHolidays. Bảo lưu mọi quyền.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-black hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Chính Sách Bảo Mật
            </a>
            <a
              href="#"
              className="text-black hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Điều Khoản Dịch Vụ
            </a>
            <a
              href="#"
              className="text-black hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Chính Sách Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
