import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { BookingType } from "../../../../../shared/types";
import { formatVND } from "../../../utils/formatCurrency";
import { BookOpen, Search, Edit, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import useAppContext from "../../../hooks/useAppContext";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

/**
 * BookingsSection Component
 * Quản lý bookings cho Manager (UC 7)
 */
const BookingsSection = () => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    // TODO: Khi triển khai màn hình chỉnh sửa booking, có thể bật lại state này
    const [, setEditingBooking] = useState<BookingType | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    // Fetch bookings
    const { data: bookingsData, isLoading } = useQuery({
        queryKey: ["getAllBookings", statusFilter, searchTerm],
        queryFn: () => apiClient.getAllBookings({
            status: statusFilter !== "all" ? statusFilter : undefined,
            limit: 1000
        }),
    });

    // Update booking mutation (hiện tại chỉ khởi tạo để dùng sau này)
    useMutation({
        mutationFn: ({ bookingId, data }: { bookingId: string; data: Partial<BookingType> }) =>
            apiClient.updateBooking(bookingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getAllBookings"] });
            showToast({
                title: "Cập nhật booking thành công!",  // định nghĩa label
                description: "Booking đã được cập nhật thành công.", //  define description
                type: "SUCCESS", // style css của thẻ 
            });
            setEditingBooking(null);
        },
        onError: (error: any) => {
            showToast({
                title: "Cập nhật booking thất bại",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật booking.",
                type: "ERROR",
            });
        },
    });

    // Cancel booking mutation
    const cancelMutation = useMutation({
        mutationFn: (bookingId: string) =>
            apiClient.updateBooking(bookingId, { status: "cancelled" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getAllBookings"] });
            showToast({
                title: "Hủy booking thành công!",
                description: "Booking đã được hủy thành công.",
                type: "SUCCESS",
            });
        },
        onError: (error: any) => {
            showToast({
                title: "Hủy booking thất bại",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi hủy booking.",
                type: "ERROR",
            });
        },
    });

    const bookings = bookingsData?.bookings || [];

    // Filter bookings by search term
    const filteredBookings = bookings.filter((booking) => {
        // Nếu không có search term → hiển thị tất cả
        if (!searchTerm || !searchTerm.trim()) {
            return true;
        }

        const searchLower = searchTerm.toLowerCase();
        // Thêm null/undefined check trước khi gọi toLowerCase()
        return (
            (booking.firstName?.toLowerCase() || "").includes(searchLower) ||
            (booking.lastName?.toLowerCase() || "").includes(searchLower) ||
            (booking.email?.toLowerCase() || "").includes(searchLower) ||
            (booking._id?.toLowerCase() || "").includes(searchLower)
        );
    });

    const handleCancel = (booking: BookingType) => {
        setConfirmDialog({
            isOpen: true,
            title: "Hủy Booking",
            message: `Bạn có chắc muốn hủy booking của ${booking.firstName} ${booking.lastName}?`,
            variant: "danger",
            onConfirm: () => {
                cancelMutation.mutate(booking._id);
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    const getStatusBadge = (status?: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
            confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-800" },
            checked_in: { label: "Đã check-in", className: "bg-green-100 text-green-800" },
            checked_out: { label: "Đã check-out", className: "bg-purple-100 text-purple-800" },
            completed: { label: "Hoàn tất", className: "bg-green-100 text-green-800" },
            cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
        };
        const statusInfo = statusMap[status || "pending"] || statusMap.pending;
        return (
            <Badge className={`${statusInfo.className} border-2 border-black font-bold`}>
                {statusInfo.label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-black" strokeWidth={3} />
                    <h1 className="text-4xl font-black text-black uppercase">
                        Bookings Management
                    </h1>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên, email, booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-4 border-black font-bold"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border-4 border-black font-bold bg-white"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="checked_in">Đã check-in</option>
                    <option value="checked_out">Đã check-out</option>
                    <option value="completed">Hoàn tất</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length > 0 ? (
                <div className="bg-white border-4 border-black overflow-hidden" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-black uppercase">Guest</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Hotel</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Check-in</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Check-out</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Total</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Status</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="border-b-2 border-black hover:bg-yellow-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold">
                                                    {booking.firstName || ""} {booking.lastName || ""}
                                                </p>
                                                <p className="text-sm text-gray-600">{booking.email || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{booking.hotelId || "N/A"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.checkIn
                                                ? new Date(booking.checkIn).toLocaleDateString("vi-VN")
                                                : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.checkOut
                                                ? new Date(booking.checkOut).toLocaleDateString("vi-VN")
                                                : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {formatVND(booking.totalCost || 0)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => setEditingBooking(booking)}
                                                    className="bg-blue-100 border-2 border-black text-black font-bold hover:bg-blue-200"
                                                    style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                {booking.status !== "cancelled" && booking.status !== "completed" && (
                                                    <Button
                                                        onClick={() => handleCancel(booking)}
                                                        className="bg-red-100 border-2 border-black text-red-800 font-bold hover:bg-red-200"
                                                        style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white border-4 border-black p-12 text-center" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-600">Không có bookings nào</p>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
        </div>
    );
};

export default BookingsSection;

