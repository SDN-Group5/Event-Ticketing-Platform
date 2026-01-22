import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import StatsCard from "../../../components/dashboard/StatsCard";
import { formatVND } from "../../../utils/formatCurrency";
import {
    DollarSign,
    BookOpen,
    Hotel,
    Users,
    TrendingUp,
} from "lucide-react";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

/**
 * OwnerDashboard Component
 * Dashboard chính cho Owner với:
 * - Stats Cards (Revenue, Bookings, Hotels, Employees)
 * - Revenue Chart
 * - Bookings Chart
 */
const OwnerDashboard = () => {
    // Fetch dashboard data
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ["businessInsightsDashboard"],
        queryFn: apiClient.fetchBusinessInsightsDashboard,
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

    const employeesCount = employeesData?.employees?.length || employeesData?.length || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = dashboardData || {
        totalRevenue: 0,
        recentRevenue: 0,
        totalBookings: 0,
        recentBookings: 0,
        totalHotels: 0,
        revenueGrowth: 0,
        bookingGrowth: 0,
    };

    const hotelsCount = hotels?.length || 0;

    // Revenue chart data (last 6 months - mock data, sẽ fetch từ API sau)
    const revenueData = [
        { month: "Jul", revenue: 12000000 },
        { month: "Aug", revenue: 15000000 },
        { month: "Sep", revenue: 18000000 },
        { month: "Oct", revenue: 20000000 },
        { month: "Nov", revenue: 22000000 },
        { month: "Dec", revenue: stats.recentRevenue || 25000000 },
    ];

    // Bookings status distribution (mock data)
    const bookingsData = [
        { name: "Confirmed", value: 45, color: "#10b981" },
        { name: "Pending", value: 20, color: "#f59e0b" },
        { name: "Checked-in", value: 15, color: "#3b82f6" },
        { name: "Completed", value: 20, color: "#8b5cf6" },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="bg-white border-4 border-black p-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                <h1 className="text-4xl font-black text-black uppercase mb-2">
                    Owner Dashboard
                </h1>
                <p className="text-gray-600 font-medium">
                    Overview of your hotel business performance
                </p>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={formatVND(stats.totalRevenue)}
                    icon={DollarSign}
                    trend={{
                        value: stats.revenueGrowth || 0,
                        isPositive: (stats.revenueGrowth || 0) >= 0,
                    }}
                    description="All time revenue"
                />
                <StatsCard
                    title="Total Bookings"
                    value={stats.totalBookings || 0}
                    icon={BookOpen}
                    trend={{
                        value: stats.bookingGrowth || 0,
                        isPositive: (stats.bookingGrowth || 0) >= 0,
                    }}
                    description="All bookings"
                />
                <StatsCard
                    title="My Hotels"
                    value={hotelsCount}
                    icon={Hotel}
                    description="Active hotels"
                />
                <StatsCard
                    title="Employees"
                    value={employeesCount}
                    icon={Users}
                    description="Total staff"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div
                    className="bg-white border-4 border-black p-6"
                    style={{ boxShadow: "8px 8px 0px 0px #000" }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-6 h-6 text-black" strokeWidth={3} />
                        <h2 className="text-2xl font-black text-black uppercase">
                            Revenue Trend
                        </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#000" strokeWidth={2} />
                            <YAxis stroke="#000" strokeWidth={2} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "4px solid #000",
                                    borderRadius: "0",
                                }}
                                formatter={(value: number) => formatVND(value)}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#000"
                                strokeWidth={3}
                                dot={{ fill: "#000", strokeWidth: 2, r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings Chart */}
                <div
                    className="bg-white border-4 border-black p-6"
                    style={{ boxShadow: "8px 8px 0px 0px #000" }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-6 h-6 text-black" strokeWidth={3} />
                        <h2 className="text-2xl font-black text-black uppercase">
                            Bookings Status
                        </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={bookingsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="#000"
                                strokeWidth={2}
                            >
                                {bookingsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "4px solid #000",
                                    borderRadius: "0",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div
                className="bg-white border-4 border-black p-6"
                style={{ boxShadow: "8px 8px 0px 0px #000" }}
            >
                <h2 className="text-2xl font-black text-black uppercase mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/add-hotel"
                        className="bg-yellow-100 border-4 border-black p-4 font-black text-black uppercase hover:bg-yellow-200 transition-colors text-center"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        + Add Hotel
                    </a>
                    <a
                        href="/dashboard/owner/employees"
                        className="bg-blue-100 border-4 border-black p-4 font-black text-black uppercase hover:bg-blue-200 transition-colors text-center"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        + Add Employee
                    </a>
                    <a
                        href="/dashboard/owner/promotions"
                        className="bg-green-100 border-4 border-black p-4 font-black text-black uppercase hover:bg-green-200 transition-colors text-center"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        + Add Promotion
                    </a>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;

