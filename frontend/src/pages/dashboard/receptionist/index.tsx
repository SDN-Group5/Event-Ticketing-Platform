import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReceptionistDashboard from "./ReceptionistDashboard";
import BookingsSection from "./BookingsSection";
import ServiceRequestsSection from "./ServiceRequestsSection";

/**
 * Receptionist Dashboard Index Component
 * Component gốc hiển thị TẤT CẢ sections cùng lúc
 * URL sẽ quyết định section nào được scroll đến và highlight
 */
const ReceptionistDashboardIndex = () => {
    const location = useLocation();

    // Refs để scroll đến section tương ứng
    const dashboardRef = useRef<HTMLDivElement>(null);
    const bookingsRef = useRef<HTMLDivElement>(null);
    const serviceRequestsRef = useRef<HTMLDivElement>(null);

    // Map URL path đến ref tương ứng
    const pathToRef: Record<string, React.RefObject<HTMLDivElement>> = {
        "/dashboard/receptionist": dashboardRef,
        "/dashboard/receptionist/": dashboardRef,
        "/dashboard/receptionist/bookings": bookingsRef,
        "/dashboard/receptionist/service-requests": serviceRequestsRef,
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
                <ReceptionistDashboard />
            </div>

            {/* Bookings Section */}
            <div
                ref={bookingsRef}
                id="bookings"
                className="scroll-mt-8"
            >
                <BookingsSection />
            </div>

            {/* Service Requests Section */}
            <div
                ref={serviceRequestsRef}
                id="service-requests"
                className="scroll-mt-8"
            >
                <ServiceRequestsSection />
            </div>
        </div>
    );
};

export default ReceptionistDashboardIndex;



