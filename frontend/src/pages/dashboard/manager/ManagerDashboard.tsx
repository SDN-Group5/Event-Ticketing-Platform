import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import StatsCard from "../../../components/dashboard/StatsCard";
import { formatVND } from "../../../utils/formatCurrency";
import {
    DollarSign,
    BookOpen,
    Hotel,
    Users,
} from "lucide-react";

/**
 * ManagerDashboard Component
 * Dashboard chính cho Manager với Today's Overview stats
 */
const ManagerDashboard = () => {
    // Fetch dashboard data
    const { isLoading } = useQuery({
        queryKey: ["businessInsightsDashboard"],
        queryFn: apiClient.fetchBusinessInsightsDashboard,
    });

    // Fetch bookings count (today)
    const { data: bookingsData } = useQuery({
        queryKey: ["getAllBookings", "today"],
        queryFn: () => apiClient.getAllBookings({ limit: 1000 }),
    });

    // Fetch hotels count
    const { data: hotels } = useQuery({
        queryKey: ["fetchMyHotels"],
        queryFn: apiClient.fetchMyHotels,
    });

    // Fetch employees count
    const { data: employeesData } = useQuery({
        queryKey: ["getAllEmployees"],
        queryFn: () => apiClient.getAllEmployees(),
    });

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = bookingsData?.bookings?.filter((booking) => {
        const bookingDate = new Date(booking.checkIn);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
    }) || [];

    const todayRevenue = todayBookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);

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
                    Manager Dashboard
                </h1>
                <p className="text-gray-600 font-medium">
                    Today's Overview - {new Date().toLocaleDateString("vi-VN")}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Today's Revenue"
                    value={formatVND(todayRevenue)}
                    icon={DollarSign}
                />
                <StatsCard
                    title="Today's Bookings"
                    value={todayBookings.length.toString()}
                    icon={BookOpen}
                />
                <StatsCard
                    title="Total Hotels"
                    value={(hotels?.length || 0).toString()}
                    icon={Hotel}
                />
                <StatsCard
                    title="Total Employees"
                    value={(employeesData?.employees?.length || 0).toString()}
                    icon={Users}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-4 border-black p-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                <h2 className="text-2xl font-black text-black uppercase mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-100 border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                        <h3 className="font-black text-black uppercase mb-2">Manage Bookings</h3>
                        <p className="text-sm text-gray-600">View and edit all bookings</p>
                    </div>
                    <div className="bg-yellow-100 border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                        <h3 className="font-black text-black uppercase mb-2">Manage Rooms</h3>
                        <p className="text-sm text-gray-600">View and manage hotel rooms</p>
                    </div>
                    <div className="bg-yellow-100 border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                        <h3 className="font-black text-black uppercase mb-2">View Analytics</h3>
                        <p className="text-sm text-gray-600">Check performance metrics</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;

