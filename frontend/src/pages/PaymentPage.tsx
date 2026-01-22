import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Clock, X, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import useAppContext from "../hooks/useAppContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"; // sử dụng radix ui

/**
 * PaymentPage Component
 * Trang trung gian hiển thị PayOS checkout trong iframe với countdown timer
 */
const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useAppContext();

    const checkoutUrl = searchParams.get("checkoutUrl");
    const hotelId = searchParams.get("hotelId");

    // ✅ Countdown timer state (5 phút = 300 giây)
    const PAYOS_QR_EXPIRY_SECONDS = 5 * 60;
    const [timeRemaining, setTimeRemaining] = useState<number>(PAYOS_QR_EXPIRY_SECONDS);
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const paymentLinkCreatedAtRef = useRef<number>(Date.now());

    // ✅ Format thời gian còn lại (MM:SS)
    const formatTimeRemaining = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // ✅ Effect: Countdown timer
    useEffect(() => {
        if (isExpired || !checkoutUrl) return;

        paymentLinkCreatedAtRef.current = Date.now();
        setTimeRemaining(PAYOS_QR_EXPIRY_SECONDS);
        setIsExpired(false);

        countdownIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - paymentLinkCreatedAtRef.current) / 1000);
            const remaining = PAYOS_QR_EXPIRY_SECONDS - elapsed;

            if (remaining <= 0) {
                setTimeRemaining(0);
                setIsExpired(true);
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
                showToast({
                    title: "Mã QR đã hết hạn",
                    description: "Vui lòng tạo lại mã thanh toán mới.",
                    type: "ERROR",
                });
            } else {
                setTimeRemaining(remaining);
            }
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [checkoutUrl, isExpired]);

    // ✅ Kiểm tra nếu thiếu thông tin
    if (!checkoutUrl) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-6 w-6" />
                            Lỗi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700">
                            Không tìm thấy thông tin thanh toán. Vui lòng quay lại và thử lại.
                        </p>
                        <Button onClick={() => navigate(-1)} className="w-full">
                            Quay lại
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ✅ Function: Tạo lại payment link
    const handleRefreshPaymentLink = () => {
        if (!hotelId) {
            showToast({
                title: "Lỗi",
                description: "Không tìm thấy thông tin khách sạn.",
                type: "ERROR",
            });
            return;
        }

        setIsRefreshing(true);
        // Redirect về trang booking để tạo lại payment link
        navigate(`/hotel/${hotelId}/booking`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* ✅ Countdown Timer Banner - Fixed ở trên cùng */}
            <div className={`sticky top-0 z-50 border-b-2 ${isExpired
                ? "bg-red-100 border-red-400"
                : timeRemaining <= 60
                    ? "bg-orange-100 border-orange-400"
                    : "bg-blue-100 border-blue-400"
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className={`h-6 w-6 ${isExpired
                                ? "text-red-600 animate-pulse"
                                : timeRemaining <= 60
                                    ? "text-orange-600 animate-pulse"
                                    : "text-blue-600"
                                }`} />
                            <div>
                                <span className={`font-bold text-lg ${isExpired
                                    ? "text-red-800"
                                    : timeRemaining <= 60
                                        ? "text-orange-800"
                                        : "text-blue-800"
                                    }`}>
                                    {isExpired
                                        ? "⏱️ Mã QR đã hết hạn"
                                        : `⏱️ Thời gian còn lại: ${formatTimeRemaining(timeRemaining)}`}
                                </span>
                                {!isExpired && timeRemaining <= 60 && (
                                    <p className="text-xs text-orange-700 mt-1 font-medium">
                                        ⚠️ Vui lòng thanh toán ngay! Mã QR sẽ hết hạn sau {formatTimeRemaining(timeRemaining)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isExpired && (
                                <Button
                                    onClick={handleRefreshPaymentLink}
                                    disabled={isRefreshing}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isRefreshing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang tạo lại...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Tạo lại mã thanh toán
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelDialog(true)}
                                className="border-gray-300 hover:bg-gray-50"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ PayOS Checkout iframe */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Card className="shadow-lg border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>Thanh toán qua PayOS</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative">
                            {/* ✅ Overlay warning khi hết hạn */}
                            {isExpired && (
                                <div className="absolute inset-0 bg-red-50 bg-opacity-95 z-10 flex items-center justify-center rounded-lg">
                                    <div className="text-center p-6">
                                        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-red-800 mb-2">
                                            Mã QR đã hết hạn
                                        </h3>
                                        <p className="text-gray-700 mb-4">
                                            Mã QR chỉ có hiệu lực trong 5 phút. Vui lòng tạo lại mã thanh toán mới.
                                        </p>
                                        <Button
                                            onClick={handleRefreshPaymentLink}
                                            disabled={isRefreshing}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            {isRefreshing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Đang tạo lại...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Tạo lại mã thanh toán
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ✅ PayOS iframe */}
                            <iframe
                                src={checkoutUrl}
                                className="w-full h-[calc(100vh-200px)] min-h-[600px] border-0 rounded-lg"
                                title="PayOS Checkout - QR Code Payment"
                                allow="payment"
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ✅ Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            Xác nhận hủy thanh toán
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn hủy thanh toán? Bạn sẽ được chuyển về trang trước và có thể đặt phòng lại sau.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            Không, tiếp tục thanh toán
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowCancelDialog(false);
                                navigate(-1);
                            }}
                        >
                            Có, hủy thanh toán
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentPage;

