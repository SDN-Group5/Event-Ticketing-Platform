import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Hotel,
  Users,
  Tag,
  BarChart3,
  Menu,
  X,
  UserCircle,
  BookOpen,
  AlertCircle,
  CheckCircle,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useUserStore } from "../../stores/userStore";
import { Button } from "../ui/button";

/**
 * Sidebar Component - Neo Brutalism Style
 * Navigation menu cho dashboard theo role
 */
interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[]; // Roles được phép truy cập
}

const Sidebar = () => {
  const location = useLocation();
  const { getUserRole } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = getUserRole();

  // Menu items theo role
  const menuItems: MenuItem[] = [
    // Owner menu
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard/owner",
      roles: ["hotel_owner"],
    },
    {
      label: "My Hotels",
      icon: Hotel,
      path: "/dashboard/owner/hotels",
      roles: ["hotel_owner"],
    },
    {
      label: "Employees",
      icon: Users,
      path: "/dashboard/owner/employees",
      roles: ["hotel_owner"],
    },
    {
      label: "Promotions",
      icon: Tag,
      path: "/dashboard/owner/promotions",
      roles: ["hotel_owner"],
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/dashboard/owner/analytics",
      roles: ["hotel_owner"],
    },
    {
      label: "Users",
      icon: UserCircle,
      path: "/dashboard/owner/users",
      roles: ["hotel_owner"],
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/dashboard/owner/payments",
      roles: ["hotel_owner"],
    },
    // Manager menu
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard/manager",
      roles: ["manager"],
    },
    {
      label: "Bookings",
      icon: BookOpen,
      path: "/dashboard/manager/bookings",
      roles: ["manager"],
    },
    {
      label: "Hotels",
      icon: Hotel,
      path: "/dashboard/manager/hotels",
      roles: ["manager"],
    },
    {
      label: "Employees",
      icon: Users,
      path: "/dashboard/manager/employees",
      roles: ["manager"],
    },
    {
      label: "Promotions",
      icon: Tag,
      path: "/dashboard/manager/promotions",
      roles: ["manager"],
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/dashboard/manager/analytics",
      roles: ["manager"],
    },
    // Receptionist menu
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard/receptionist",
      roles: ["receptionist"],
    },
    {
      label: "Bookings",
      icon: BookOpen,
      path: "/dashboard/receptionist/bookings",
      roles: ["receptionist"],
    },
    {
      label: "Service Requests",
      icon: AlertCircle,
      path: "/dashboard/receptionist/service-requests",
      roles: ["receptionist"],
    },
    {
      label: "Check-in",
      icon: CheckCircle,
      path: "/dashboard/receptionist/check-in",
      roles: ["receptionist"],
    },
    {
      label: "Check-out",
      icon: LogOut,
      path: "/dashboard/receptionist/check-out",
      roles: ["receptionist"],
    },
  ];

  // Filter menu items theo role hiện tại
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole || "")
  );

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white border-4 border-black text-black font-black p-2"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r-4 border-black z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ boxShadow: "4px 0px 0px 0px #000" }}
      >
        {/* Logo */}
        <div className="p-6 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black uppercase">
            {userRole === "hotel_owner" && "Owner Panel"}
            {userRole === "manager" && "Manager Panel"}
            {userRole === "receptionist" && "Receptionist Panel"}
          </h2>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 font-bold text-sm uppercase
                  transition-all duration-150
                  ${active
                    ? "bg-black text-white"
                    : "bg-white text-black border-4 border-black hover:bg-yellow-100"
                  }
                `}
                style={{
                  boxShadow: active
                    ? "4px 4px 0px 0px #000"
                    : "4px 4px 0px 0px #000",
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-black bg-gray-50">
          <p className="text-xs font-bold text-gray-600 uppercase">
            MERNHOLIDAYS
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

