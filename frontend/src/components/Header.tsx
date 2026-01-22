import { Link, useNavigate } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";
import useSearchContext from "../hooks/useSearchContext";
import { useUserStore } from "../stores/userStore";
import SignOutButton from "./SignOutButton";
import { NeoButton } from "./ui/neo-button";
import {
  FileText,
  Activity,
  BarChart3,
  Building2,
  Calendar,
  LogIn,
  Menu,
} from "lucide-react";

const Header = () => {
  const { isLoggedIn } = useAppContext();
  const { getUserRole } = useUserStore();
  const search = useSearchContext();
  const navigate = useNavigate();

  const userRole = getUserRole();

  const handleLogoClick = () => {
    // Clear search context when going to home page
    search.clearSearchValues();
    navigate("/");
  };

  return (
    <>
      {/* Development Banner */}
      {/* {!import.meta.env.PROD && (
        <div className="bg-yellow-500 text-black text-center py-1 text-xs font-medium">
          🚧 Development Mode - Auth state persists between sessions
        </div>
      )} */}
      <header
        className="bg-yellow-50 border-b-4 border-black sticky top-0 z-50"
        style={{ boxShadow: "0px 4px 0px 0px #000" }}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Neo Brutalism Style */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 group transition-all duration-150 hover:translate-x-1 active:translate-x-0"
            >
              <div
                className="bg-amber-500 p-3 border-4 border-black flex items-center justify-center"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Building2 className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
              <span
                className="text-2xl font-black text-black tracking-tight uppercase"
              >
                MernHolidays
              </span>
            </button>

            {/* Navigation - Neo Brutalism Style */}
            <nav className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  {/* Analytics Dashboard Link - Chỉ hiển thị cho owner và manager */}
                  {(userRole === "hotel_owner" || userRole === "manager") && (
                    <Link
                      to={
                        userRole === "hotel_owner"
                          ? "/dashboard/owner/analytics"
                          : "/dashboard/manager/analytics"
                      }
                      className="flex items-center px-4 py-2 bg-white border-4 border-black text-black font-black text-sm uppercase transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                      style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" strokeWidth={3} />
                      Thống Kê
                    </Link>
                  )}

                  {/* My Bookings Link */}
                  <Link
                    to="/my-bookings"
                    className="flex items-center px-4 py-2 bg-white border-4 border-black text-black font-black text-sm uppercase transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                  >
                    <Calendar className="w-4 h-4 mr-2" strokeWidth={3} />
                    Đặt Phòng
                  </Link>

                  {/* My Hotels Link - Chỉ hiển thị cho owner và manager */}
                  {(userRole === "hotel_owner" || userRole === "manager") && (
                    <Link
                      to={
                        userRole === "hotel_owner"
                          ? "/dashboard/owner/hotels"
                          : "/dashboard/manager/hotels"
                      }
                      className="flex items-center px-4 py-2 bg-white border-4 border-black text-black font-black text-sm uppercase transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                      style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                      <Building2 className="w-4 h-4 mr-2" strokeWidth={3} />
                      Khách Sạn
                    </Link>
                  )}

                  {/* API Documentation Link */}
                  <Link
                    to="/api-docs"
                    className="flex items-center px-4 py-2 bg-white border-4 border-black text-black font-black text-sm uppercase transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                  >
                    <FileText className="w-4 h-4 mr-2" strokeWidth={3} />
                    API Docs
                  </Link>

                  {/* API Status Link */}
                  <Link
                    to="/api-status"
                    className="flex items-center px-4 py-2 bg-white border-4 border-black text-black font-black text-sm uppercase transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                  >
                    <Activity className="w-4 h-4 mr-2" strokeWidth={3} />
                    Status
                  </Link>

                  <SignOutButton />
                </>
              ) : (
                <NeoButton asChild variant="default" size="default">
                  <Link to="/sign-in" className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" strokeWidth={3} />
                    Đăng Nhập
                  </Link>
                </NeoButton>
              )}
            </nav>

            {/* Mobile Menu Button - Neo Brutalism Style */}
            <div className="md:hidden">
              <button
                className="p-3 bg-white border-4 border-black text-black transition-all duration-150 active:translate-x-0 active:translate-y-0"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <Menu className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
