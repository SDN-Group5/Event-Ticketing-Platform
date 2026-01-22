import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ManagerDashboard from "./ManagerDashboard";
import BookingsSection from "./BookingsSection";
import HotelsSection from "../owner/HotelsSection";
import PromotionsSection from "../owner/PromotionsSection";
import EmployeesSection from "../owner/EmployeesSection"; // UC 13: Manager có quyền quản lý employees
import AnalyticsSection from "../owner/AnalyticsSection";

/**
 * Manager Dashboard Index Component
 * Component gốc hiển thị TẤT CẢ sections cùng lúc
 * URL sẽ quyết định section nào được scroll đến và highlight
 */
const ManagerDashboardIndex = () => {
    const location = useLocation();

    // Refs để scroll đến section tương ứng
    const dashboardRef = useRef<HTMLDivElement>(null);
    const bookingsRef = useRef<HTMLDivElement>(null);
    const hotelsRef = useRef<HTMLDivElement>(null);
    const employeesRef = useRef<HTMLDivElement>(null); // UC 13: Manager có quyền quản lý employees
    const promotionsRef = useRef<HTMLDivElement>(null);
    const analyticsRef = useRef<HTMLDivElement>(null);

    // Map URL path đến ref tương ứng
    const pathToRef: Record<string, React.RefObject<HTMLDivElement>> = {
        "/dashboard/manager": dashboardRef,
        "/dashboard/manager/": dashboardRef,
        "/dashboard/manager/bookings": bookingsRef,
        "/dashboard/manager/hotels": hotelsRef, // UC 11: Quản lý Danh mục Phòng & KS
        "/dashboard/manager/employees": employeesRef, // UC 13: Quản lý Tài khoản Nhân viên
        "/dashboard/manager/promotions": promotionsRef, // UC 12: Quản lý Giá & Khuyến mãi
        "/dashboard/manager/analytics": analyticsRef, // UC 14: Xem Báo cáo Thống kê
    };

    // Scroll đến section tương ứng khi URL thay đổi
    useEffect(() => {
        const currentPath = location.pathname;
        const targetRef = pathToRef[currentPath];

        if (targetRef?.current) {
            // Delay nhỏ để đảm bảo DOM đã render
            setTimeout(() => {
                targetRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [location.pathname]);

    return (
        <div className="space-y-8">
            {/* Dashboard Overview Section */}
            <div
                ref={dashboardRef}
                id="dashboard"
                className="scroll-mt-8"
            >
                <ManagerDashboard />
            </div>

            {/* Bookings Section */}
            <div
                ref={bookingsRef}
                id="bookings"
                className="scroll-mt-8"
            >
                <BookingsSection />
            </div>

            {/* Hotels Section - UC 11: Quản lý Danh mục Phòng & KS */}
            <div
                ref={hotelsRef}
                id="hotels"
                className="scroll-mt-8"
            >
                <HotelsSection />
            </div>

            {/* Employees Section - UC 13: Quản lý Tài khoản Nhân viên */}
            <div
                ref={employeesRef}
                id="employees"
                className="scroll-mt-8"
            >
                <EmployeesSection />
            </div>

            {/* Promotions Section */}
            <div
                ref={promotionsRef}
                id="promotions"
                className="scroll-mt-8"
            >
                <PromotionsSection />
            </div>

            {/* Analytics Section */}
            <div
                ref={analyticsRef}
                id="analytics"
                className="scroll-mt-8"
            >
                <AnalyticsSection />
            </div>
        </div>
    );
};

export default ManagerDashboardIndex;

