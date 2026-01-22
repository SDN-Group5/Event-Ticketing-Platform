import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { BookingType } from "../../../../../shared/types";
import { formatVND } from "../../../utils/formatCurrency";
import { CheckCircle, Search, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import useAppContext from "../../../hooks/useAppContext";
import EmptyState from "../../../components/EmptyState";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";

/**
 * CheckInPage Component
 * Trang check-in cho Receptionist (UC 9)
 */
const CheckInPage = () => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState("");
    const [foundBooking, setFoundBooking] = useState<BookingType | null>(null);
    const [roomId, setRoomId] = useState("");
    const [showEarlyCheckInDialog, setShowEarlyCheckInDialog] = useState(false);
    const [earlyCheckInDays, setEarlyCheckInDays] = useState(0);

    // Fetch bookings để tìm kiếm
    const { data: bookingsData } = useQuery({
        queryKey: ["getAllBookings"],
        queryFn: () => apiClient.getAllBookings({ limit: 1000 }),
    });

    // Check-in mutation
    const checkInMutation = useMutation({
        mutationFn: (data: { bookingId: string; roomId?: string }) =>
            apiClient.checkIn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getAllBookings"] });
            showToast({
                title: "Check-in thành công!",
                description: "Đã cập nhật trạng thái booking thành công.",
                type: "SUCCESS",
            });
            setFoundBooking(null);
            setSearchInput("");
            setRoomId("");
        },
        onError: (error: any) => {
            showToast({
                title: "Check-in thất bại",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi check-in",
                type: "ERROR",
            });
        },
    });

    /**
     * Tìm booking theo booking code (orderCode hoặc _id) hoặc room number (roomId)
     */
    const handleSearch = () => {
        if (!searchInput.trim()) {
            showToast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập booking code hoặc room number",
                type: "ERROR",
            });
            return;
        }

        const searchTerm = searchInput.trim().toLowerCase();

        // Tìm booking theo:
        // 1. Booking ID (_id)
        // 2. Order Code (nếu có)
        // 3. Room ID (nếu có)
        const booking = bookingsData?.bookings?.find((b) => {
            // Tìm theo _id
            if (b._id.toLowerCase() === searchTerm || b._id.toLowerCase().includes(searchTerm)) {
                return true;
            }

            // Tìm theo orderCode (nếu có trong booking)
            const bookingWithOrderCode = b as any;
            if (bookingWithOrderCode.orderCode &&
                String(bookingWithOrderCode.orderCode).includes(searchTerm)) {
                return true;
            }

            // Tìm theo roomId (nếu có trong booking)
            if (bookingWithOrderCode.roomId &&
                String(bookingWithOrderCode.roomId).toLowerCase().includes(searchTerm)) {
                return true;
            }

            return false;
        });

        if (booking) {
            // ✅ Validation 1: Kiểm tra booking đã check-in chưa
            const bookingStatus = booking.status as string;
            if (bookingStatus === "checked_in") {
                showToast({
                    title: "Booking đã được check-in",
                    description: "Booking này đã được check-in rồi. Không thể check-in lại.",
                    type: "ERROR",
                });
                setFoundBooking(null);
                return;
            }

            // ✅ Validation 2: Kiểm tra status phải là "confirmed"
            if (bookingStatus !== "confirmed") {
                showToast({
                    title: "Không thể check-in",
                    description: `Booking phải ở trạng thái "confirmed". Trạng thái hiện tại: ${bookingStatus}`,
                    type: "ERROR",
                });
                setFoundBooking(null);
                return;
            }

            // ✅ Validation 3: Kiểm tra payment status
            if (booking.paymentStatus !== "paid") {
                showToast({
                    title: "Booking chưa thanh toán",
                    description: `Booking chưa thanh toán. PaymentStatus: ${booking.paymentStatus}`,
                    type: "ERROR",
                });
                setFoundBooking(null);
                return;
            }

            // ✅ Validation 4: Kiểm tra early check-in (check-in trước ngày)
            const checkInDate = new Date(booking.checkIn);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            checkInDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff < 0) {
                // Check-in sớm (trước ngày check-in)
                setEarlyCheckInDays(Math.abs(daysDiff));
                setShowEarlyCheckInDialog(true);
                setFoundBooking(booking);
                return;
            }

            // Check-in đúng ngày hoặc sau ngày check-in → OK
            setFoundBooking(booking);
        } else {
            setFoundBooking(null);
        }
    };

    /**
     * Xử lý check-in (có thể được gọi từ dialog early check-in hoặc button thường)
     */
    const handleCheckIn = () => {
        if (!foundBooking) return;

        checkInMutation.mutate({
            bookingId: foundBooking._id,
            roomId: roomId || undefined,
        });

        // Đóng dialog nếu đang mở
        setShowEarlyCheckInDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-black uppercase mb-2">
                    Check-in
                </h1>
                <p className="text-gray-600 font-medium">
                    Nhập booking code hoặc room number để tìm booking
                </p>
            </div>

            {/* Search Form */}
            <div className="bg-white border-4 border-black p-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Nhập booking code hoặc room number..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            className="pl-10 border-4 border-black font-bold"
                        />
                    </div>
                    <Button
                        onClick={handleSearch}
                        className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        <Search className="w-5 h-5 mr-2" />
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            {/* Booking Details */}
            {foundBooking && (
                <div className="bg-white border-4 border-black p-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                    <h2 className="text-2xl font-black text-black uppercase mb-4">
                        Booking Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase mb-1">Guest Name</p>
                            <p className="text-lg font-black">
                                {foundBooking.firstName} {foundBooking.lastName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase mb-1">Email</p>
                            <p className="text-lg font-black">{foundBooking.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase mb-1">Check-in Date</p>
                            <p className="text-lg font-black">
                                {new Date(foundBooking.checkIn).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase mb-1">Check-out Date</p>
                            <p className="text-lg font-black">
                                {new Date(foundBooking.checkOut).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase mb-1">Total Cost</p>
                            <p className="text-lg font-black text-green-600">
                                {formatVND(foundBooking.totalCost)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase mb-1">Status</p>
                            <Badge className="bg-blue-100 text-blue-800 border-2 border-black font-bold">
                                {foundBooking.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Room ID Input (Optional) */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Room ID (Optional)
                        </label>
                        <Input
                            placeholder="Nhập Room ID nếu có..."
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="border-4 border-black font-bold"
                        />
                    </div>

                    {/* Check-in Button */}
                    <Button
                        onClick={handleCheckIn}
                        disabled={checkInMutation.isPending}
                        className="w-full bg-green-100 border-4 border-black text-black font-black uppercase hover:bg-green-200 disabled:opacity-50"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        {checkInMutation.isPending ? (
                            "Đang xử lý..."
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Confirm Check-in
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* No Booking Found - Sử dụng EmptyState */}
            {!foundBooking && searchInput && (
                <EmptyState
                    icon={Search}
                    title="Không tìm thấy booking"
                    description="Không tìm thấy booking với mã này. Vui lòng kiểm tra lại booking code hoặc thử tìm bằng room number."
                    size="md"
                />
            )}

            {/* ✅ Early Check-in Confirmation Dialog */}
            <Dialog open={showEarlyCheckInDialog} onOpenChange={setShowEarlyCheckInDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <Clock className="h-5 w-5" />
                            Cảnh báo: Check-in sớm
                        </DialogTitle>
                        <DialogDescription>
                            Khách check-in sớm {earlyCheckInDays} ngày so với ngày đặt phòng.
                            Bạn có muốn tiếp tục check-in không?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEarlyCheckInDialog(false);
                                setFoundBooking(null);
                            }}
                            className="px-4 py-2"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCheckIn}
                            disabled={checkInMutation.isPending}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700"
                        >
                            {checkInMutation.isPending ? "Đang xử lý..." : "Tiếp tục check-in"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CheckInPage;

