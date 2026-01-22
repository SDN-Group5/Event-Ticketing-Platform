import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { formatVND } from "../../../utils/formatCurrency";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * AnalyticsSection Component
 * Hiển thị analytics và báo cáo cho Owner (UC 14)
 */
const AnalyticsSection = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["businessInsightsDashboard"],
    queryFn: apiClient.fetchBusinessInsightsDashboard,
  });

  const { data: forecastData } = useQuery({
    queryKey: ["businessInsightsForecast"],
    queryFn: apiClient.fetchBusinessInsightsForecast,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-lg font-bold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Mock data cho charts (sẽ fetch từ API sau)
  const revenueData = [
    { month: "Jul", revenue: 12000000, bookings: 45 },
    { month: "Aug", revenue: 15000000, bookings: 52 },
    { month: "Sep", revenue: 18000000, bookings: 58 },
    { month: "Oct", revenue: 20000000, bookings: 62 },
    { month: "Nov", revenue: 22000000, bookings: 68 },
    { month: "Dec", revenue: dashboardData?.recentRevenue || 25000000, bookings: 75 },
  ];

  const occupancyData = [
    { day: "Mon", occupancy: 65 },
    { day: "Tue", occupancy: 72 },
    { day: "Wed", occupancy: 68 },
    { day: "Thu", occupancy: 75 },
    { day: "Fri", occupancy: 80 },
    { day: "Sat", occupancy: 85 },
    { day: "Sun", occupancy: 78 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-black" strokeWidth={3} />
        <h1 className="text-4xl font-black text-black uppercase">
          Analytics & Reports
        </h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-white border-4 border-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-black" strokeWidth={3} />
            <h3 className="text-lg font-black uppercase">Total Revenue</h3>
          </div>
          <p className="text-3xl font-black text-black">
            {formatVND(dashboardData?.totalRevenue)}
          </p>
          <p className="text-sm text-gray-600 mt-2">All time</p>
        </div>

        <div
          className="bg-white border-4 border-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-black" strokeWidth={3} />
            <h3 className="text-lg font-black uppercase">Total Bookings</h3>
          </div>
          <p className="text-3xl font-black text-black">
            {dashboardData?.totalBookings || 0}
          </p>
          <p className="text-sm text-gray-600 mt-2">All bookings</p>
        </div>

        <div
          className="bg-white border-4 border-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-black" strokeWidth={3} />
            <h3 className="text-lg font-black uppercase">Growth Rate</h3>
          </div>
          <p className="text-3xl font-black text-black">
            {dashboardData?.revenueGrowth?.toFixed(1) || 0}%
          </p>
          <p className="text-sm text-gray-600 mt-2">Revenue growth</p>
        </div>
      </div>

      {/* Revenue & Bookings Chart */}
      <div
        className="bg-white border-4 border-black p-6"
        style={{ boxShadow: "8px 8px 0px 0px #000" }}
      >
        <h2 className="text-2xl font-black text-black uppercase mb-6">
          Revenue & Bookings Trend
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#000" strokeWidth={2} />
            <YAxis yAxisId="left" stroke="#000" strokeWidth={2} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#000"
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "4px solid #000",
                borderRadius: "0",
              }}
              formatter={(value: number, name: string) => {
                if (name === "Revenue (VND)") {
                  return formatVND(value);
                }
                return value;
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="#000"
              name="Revenue (VND)"
            />
            <Bar
              yAxisId="right"
              dataKey="bookings"
              fill="#f59e0b"
              name="Bookings"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy Rate Chart */}
      <div
        className="bg-white border-4 border-black p-6"
        style={{ boxShadow: "8px 8px 0px 0px #000" }}
      >
        <h2 className="text-2xl font-black text-black uppercase mb-6">
          Weekly Occupancy Rate
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={occupancyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#000" strokeWidth={2} />
            <YAxis stroke="#000" strokeWidth={2} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "4px solid #000",
                borderRadius: "0",
              }}
            />
            <Line
              type="monotone"
              dataKey="occupancy"
              stroke="#000"
              strokeWidth={3}
              dot={{ fill: "#000", strokeWidth: 2, r: 5 }}
              name="Occupancy %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="bg-white border-4 border-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <h3 className="text-xl font-black text-black uppercase mb-4">
            Recent Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold">Last 30 Days Revenue</span>
              <span className="font-black text-black">
                {formatVND(dashboardData?.recentRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Last 30 Days Bookings</span>
              <span className="font-black text-black">
                {dashboardData?.recentBookings || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Average Booking Value</span>
              <span className="font-black text-black">
                {dashboardData?.recentRevenue && dashboardData?.recentBookings
                  ? formatVND(
                    Math.round(
                      dashboardData.recentRevenue / dashboardData.recentBookings
                    )
                  )
                  : formatVND(0)}
              </span>
            </div>
          </div>
        </div>

        <div
          className="bg-white border-4 border-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <h3 className="text-xl font-black text-black uppercase mb-4">
            Forecast
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold">Next Month Revenue</span>
              <span className="font-black text-black">
                {forecastData?.nextMonthRevenue
                  ? formatVND(forecastData.nextMonthRevenue)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Next Month Bookings</span>
              <span className="font-black text-black">
                {forecastData?.nextMonthBookings || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Trend</span>
              <span
                className={`font-black ${(dashboardData?.revenueGrowth || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {(dashboardData?.revenueGrowth || 0) >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(dashboardData?.revenueGrowth || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;

