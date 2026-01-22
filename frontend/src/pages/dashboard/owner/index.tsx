import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import OwnerDashboard from "./OwnerDashboard";
import HotelsSection from "./HotelsSection";
import EmployeesSection from "./EmployeesSection";
import PromotionsSection from "./PromotionsSection";
import AnalyticsSection from "./AnalyticsSection";
import UsersSection from "./UsersSection";
import PaymentsSection from "./PaymentsSection";

/**
 * Owner Dashboard Index Component
 * Component gốc hiển thị TẤT CẢ sections cùng lúc
 * URL sẽ quyết định section nào được scroll đến và highlight
 */
const OwnerDashboardIndex = () => {
    const location = useLocation();

    // Refs để scroll đến section tương ứng
    const dashboardRef = useRef<HTMLDivElement>(null);
    const hotelsRef = useRef<HTMLDivElement>(null);
    const employeesRef = useRef<HTMLDivElement>(null);
    const promotionsRef = useRef<HTMLDivElement>(null);
    const analyticsRef = useRef<HTMLDivElement>(null);
    const usersRef = useRef<HTMLDivElement>(null);
    const paymentsRef = useRef<HTMLDivElement>(null);

    // Map URL path đến ref tương ứng
    const pathToRef: Record<string, React.RefObject<HTMLDivElement>> = {
        "/dashboard/owner": dashboardRef,
        "/dashboard/owner/": dashboardRef,
        "/dashboard/owner/hotels": hotelsRef,
        "/dashboard/owner/employees": employeesRef,
        "/dashboard/owner/promotions": promotionsRef,
        "/dashboard/owner/analytics": analyticsRef,
        "/dashboard/owner/users": usersRef,
        "/dashboard/owner/payments": paymentsRef,
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
                <OwnerDashboard />
            </div>

            {/* Hotels Section */}
            <div
                ref={hotelsRef}
                id="hotels"
                className="scroll-mt-8"
            >
                <HotelsSection />
            </div>

            {/* Employees Section */}
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

            {/* Users Section */}
            <div
                ref={usersRef}
                id="users"
                className="scroll-mt-8"
            >
                <UsersSection />
            </div>

            {/* Payments Section */}
            <div
                ref={paymentsRef}
                id="payments"
                className="scroll-mt-8"
            >
                <PaymentsSection />
            </div>
        </div>
    );
};

export default OwnerDashboardIndex;
