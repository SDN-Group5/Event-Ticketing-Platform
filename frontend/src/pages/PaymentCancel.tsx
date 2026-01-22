import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, Home, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

/**
 * PaymentCancel Page
 * Hiển thị khi khách hàng hủy thanh toán trên PayOS
 */
const PaymentCancel = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Lấy thông tin từ URL params (nếu có)
    const orderCode = searchParams.get("orderCode");

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <XCircle className="h-6 w-6" />
                        Thanh toán đã bị hủy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-gray-700 font-medium">
                                    Bạn đã hủy thanh toán. Booking của bạn chưa được xác nhận.
                                </p>
                                {orderCode && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mã đơn hàng: {orderCode}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Nếu bạn muốn tiếp tục đặt phòng, vui lòng quay lại và thử lại.
                    </p>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={() => {
                                // Nếu có hotelId trong sessionStorage, quay lại trang booking
                                const pendingBookingData = sessionStorage.getItem("pendingBookingData");
                                if (pendingBookingData) {
                                    try {
                                        const data = JSON.parse(pendingBookingData);
                                        if (data.hotelId) {
                                            navigate(`/hotel/${data.hotelId}/booking`);
                                            return;
                                        }
                                    } catch (e) {
                                        // Ignore parse error
                                    }
                                }
                                // Nếu không có, quay lại trang trước
                                navigate(-1);
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại đặt phòng
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            className="w-full"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Về trang chủ
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCancel;

