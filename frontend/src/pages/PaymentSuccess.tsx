import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

/**
 * PaymentSuccess Page
 * Hiển thị sau khi thanh toán thành công qua PayOS
 */
const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const orderCode = searchParams.get("orderCode");
    const hotelId = searchParams.get("hotelId");

    const [isCreatingBooking, setIsCreatingBooking] = useState(false);

    // Mutation để tạo booking sau khi thanh toán thành công
    const createBookingMutation = useMutation({
        mutationFn: (data: {
            hotelId: string;
            orderCode: number;
            firstName: string;
            lastName: string;
            email: string;
            phone?: string;
            adultCount: number;
            childCount: number;
            checkIn: string;
            checkOut: string;
            totalCost: number;
            specialRequests?: string;
        }) => {
            // Backend expect orderCode trong body cùng với các fields khác
            return apiClient.createRoomBooking({
                hotelId: data.hotelId,
                orderCode: data.orderCode, // Backend expect number
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                adultCount: data.adultCount,
                childCount: data.childCount,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                totalCost: data.totalCost,
                specialRequests: data.specialRequests,
            } as any); // Type assertion - BookingFormDataForPayOS đã có orderCode
        },
        onSuccess: () => {
            showToast({
                title: "Đặt phòng thành công!",
                description: "Booking của bạn đã được xác nhận thành công.",
                type: "SUCCESS",
            });
            setTimeout(() => {
                navigate("/my-bookings");
            }, 2000);
        },
        onError: (error: any) => {
            showToast({
                title: "Lỗi tạo booking",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi tạo booking",
                type: "ERROR",
            });
        },
    });

    useEffect(() => {
        // Kiểm tra orderCode và hotelId
        if (!orderCode || !hotelId) {
            showToast({
                title: "Thiếu thông tin",
                description: "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.",
                type: "ERROR",
            });
            navigate("/");
            return;
        }

        // Lấy form data từ sessionStorage
        const pendingBookingDataStr = sessionStorage.getItem("pendingBookingData");
        if (!pendingBookingDataStr) {
            showToast({
                title: "Thiếu thông tin",
                description: "Không tìm thấy thông tin đặt phòng. Vui lòng đặt lại.",
                type: "ERROR",
            });
            navigate("/");
            return;
        }

        try {
            const pendingBookingData = JSON.parse(pendingBookingDataStr);

            setIsCreatingBooking(true);

            // Tạo booking với data từ sessionStorage
            // Backend expect orderCode trong body cùng với các fields khác
            createBookingMutation.mutate({
                hotelId,
                orderCode: parseInt(orderCode),
                firstName: pendingBookingData.firstName,
                lastName: pendingBookingData.lastName,
                email: pendingBookingData.email,
                phone: pendingBookingData.phone,
                adultCount: pendingBookingData.adultCount,
                childCount: pendingBookingData.childCount,
                checkIn: pendingBookingData.checkIn,
                checkOut: pendingBookingData.checkOut,
                totalCost: pendingBookingData.totalCost,
                promotionCode: pendingBookingData.promotionCode, // ✅ THÊM
                discountAmount: pendingBookingData.discountAmount, // ✅ THÊM
                specialRequests: pendingBookingData.specialRequests,
            } as any); // Type assertion - BookingFormDataForPayOS đã có orderCode

            // Xóa pending booking data sau khi đã lấy
            sessionStorage.removeItem("pendingBookingData");
        } catch (error: any) {
            showToast({
                title: "Lỗi",
                description: error?.message || "Có lỗi xảy ra khi xử lý thông tin đặt phòng",
                type: "ERROR",
            });
            setIsCreatingBooking(false);
        }
    }, [orderCode, hotelId]);

    if (isCreatingBooking || createBookingMutation.isPending) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-lg font-medium text-gray-700">
                            Đang xác nhận booking...
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Vui lòng đợi trong giây lát
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (createBookingMutation.isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-6 w-6" />
                            Có lỗi xảy ra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700">
                            Đã có lỗi xảy ra khi tạo booking. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.
                        </p>
                        <Button onClick={() => navigate("/my-bookings")} className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Về trang My Bookings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-green-100 rounded-full p-4 mb-6">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Thanh toán thành công!
                    </h1>
                    <p className="text-gray-600 text-center mb-6">
                        Booking của bạn đã được xác nhận thành công. Bạn sẽ được chuyển đến trang My Bookings...
                    </p>
                    <Button onClick={() => navigate("/my-bookings")} className="w-full">
                        Xem booking của tôi
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSuccess;

