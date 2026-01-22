import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import StatsCard from "../../../components/dashboard/StatsCard";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";

/**
 * ReceptionistDashboard Component
 * Dashboard chính cho Receptionist với Today's Tasks stats
 */
const ReceptionistDashboard = () => {
    // Fetch bookings
    const { data: bookingsData, isLoading } = useQuery({
        queryKey: ["getAllBookings", "today"],
        queryFn: () => apiClient.getAllBookings({ limit: 1000 }),
    });

    // Fetch service requests
    const { data: serviceRequestsData } = useQuery({
        queryKey: ["getAllServiceRequests", "today"],
        queryFn: () => apiClient.getAllServiceRequests(),
    });

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = bookingsData?.bookings?.filter((booking) => {
        const bookingDate = new Date(booking.checkIn);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
    }) || [];

    const pendingCheckIns = todayBookings.filter(
        (booking) => booking.status === "confirmed"
    ).length;

    const pendingCheckOuts = bookingsData?.bookings?.filter((booking) => {
        const checkoutDate = new Date(booking.checkOut);
        checkoutDate.setHours(0, 0, 0, 0);
        return (
            checkoutDate.getTime() === today.getTime() &&
            String(booking.status) === "checked_in"
        );
    }).length || 0;

    // Backend có thể trả về array hoặc object với serviceRequests field
    const serviceRequests = Array.isArray(serviceRequestsData) 
        ? serviceRequestsData 
        : serviceRequestsData?.serviceRequests || [];
    
    const pendingServiceRequests = serviceRequests.filter(
        (request: any) => request.status === "pending"
    ).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-black uppercase mb-2">
                    Receptionist Dashboard
                </h1>
                <p className="text-gray-600 font-medium">
                    Today's Tasks - {new Date().toLocaleDateString("vi-VN")}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Pending Check-ins"
                    value={pendingCheckIns.toString()}
                    icon={Clock}
                />
                <StatsCard
                    title="Pending Check-outs"
                    value={pendingCheckOuts.toString()}
                    icon={CheckCircle}
                />
                <StatsCard
                    title="Service Requests"
                    value={pendingServiceRequests.toString()}
                    icon={AlertCircle}
                />
                <StatsCard
                    title="Today's Bookings"
                    value={todayBookings.length.toString()}
                    icon={BookOpen}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-4 border-black p-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                <h2 className="text-2xl font-black text-black uppercase mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-100 border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                        <h3 className="font-black text-black uppercase mb-2">Check-in</h3>
                        <p className="text-sm text-gray-600">Process guest check-ins</p>
                    </div>
                    <div className="bg-blue-100 border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                        <h3 className="font-black text-black uppercase mb-2">Check-out</h3>
                        <p className="text-sm text-gray-600">Process guest check-outs</p>
                    </div>
                    <div className="bg-orange-100 border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                        <h3 className="font-black text-black uppercase mb-2">Service Requests</h3>
                        <p className="text-sm text-gray-600">Manage service requests</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;

