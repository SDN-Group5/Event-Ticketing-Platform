import { useForm } from "react-hook-form";
import { PayOSPaymentLinkResponse, UserType } from "../../../../shared/types";
import useSearchContext from "../../hooks/useSearchContext";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    User,
    Phone,
    MessageSquare,
    CreditCard,
    Shield,
    CheckCircle,
    ExternalLink,
    Tag,
    X,
    Loader2,
    AlertCircle,
    Clock,
    RefreshCw,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatVND } from "../../utils/formatCurrency";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";

type Props = {
    currentUser: UserType;
    paymentLink: PayOSPaymentLinkResponse;
};

export type BookingFormDataForPayOS = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    adultCount: number;
    childCount: number;
    checkIn: string;
    checkOut: string;
    hotelId: string;
    orderCode: number;
    totalCost: number;
    promotionCode?: string; // ✅ THÊM: Mã khuyến mãi
    discountAmount?: number; // ✅ THÊM: Số tiền giảm giá
    specialRequests?: string;
};

/**
 * BookingFormPayOS Component
 * Form đặt phòng với PayOS payment và Promotion Code
 */
const BookingFormPayOS = ({ currentUser, paymentLink }: Props) => {
    const search = useSearchContext();
    const { hotelId } = useParams();
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();

    // Local state cho form fields
    const [firstName, setFirstName] = useState<string>(currentUser.firstName || "");
    const [lastName, setLastName] = useState<string>(currentUser.lastName || "");
    const [email, setEmail] = useState<string>(currentUser.email || "");
    const [phone, setPhone] = useState<string>(currentUser.phone || "");
    const [specialRequests, setSpecialRequests] = useState<string>("");

    // ✅ State cho promotion code
    const [promotionCode, setPromotionCode] = useState<string>("");
    const [appliedPromotion, setAppliedPromotion] = useState<{
        code: string;
        discountAmount: number;
        finalPrice: number;
        description: string;
    } | null>(null);
    const [isValidatingPromotion, setIsValidatingPromotion] = useState<boolean>(false);
    const [promotionError, setPromotionError] = useState<string>("");

    // ✅ State cho Cancel Dialog
    const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);

    // ✅ State cho QR code expiry countdown (5 phút = 300 giây)
    const PAYOS_QR_EXPIRY_SECONDS = 5 * 60; // 5 phút
    const [timeRemaining, setTimeRemaining] = useState<number>(PAYOS_QR_EXPIRY_SECONDS);
    const [isExpired, setIsExpired] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const paymentLinkCreatedAtRef = useRef<number>(Date.now()); // Track thời gian tạo payment link

    // Tính số đêm
    const numberOfNights = Math.ceil(
        (search.checkOut.getTime() - search.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // ✅ Effect: Reset countdown khi payment link mới được tạo
    useEffect(() => {
        paymentLinkCreatedAtRef.current = Date.now();
        setTimeRemaining(PAYOS_QR_EXPIRY_SECONDS);
        setIsExpired(false);
    }, [paymentLink.orderCode]); // Reset khi orderCode thay đổi

    // ✅ Effect: Countdown timer cho QR code expiry
    useEffect(() => {
        if (isExpired) return; // Dừng countdown nếu đã hết hạn

        countdownIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - paymentLinkCreatedAtRef.current) / 1000);
            const remaining = PAYOS_QR_EXPIRY_SECONDS - elapsed;

            if (remaining <= 0) {
                setTimeRemaining(0);
                setIsExpired(true);
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
            } else {
                setTimeRemaining(remaining);
            }
        }, 1000); // Update mỗi giây

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [isExpired, paymentLink.orderCode]);

    // ✅ Function: Tạo lại payment link khi hết hạn
    const handleRefreshPaymentLink = async () => {
        if (!hotelId) return;

        setIsRefreshing(true);
        try {
            // Invalidate query để tạo lại payment link
            await queryClient.invalidateQueries({
                queryKey: ["createPayOSPaymentLink", hotelId, numberOfNights],
            });

            showToast({
                title: "Đã tạo lại mã thanh toán",
                description: "Mã QR mới đã được tạo. Vui lòng thanh toán trong vòng 5 phút.",
                type: "SUCCESS",
            });
        } catch (error) {
            showToast({
                title: "Lỗi tạo lại mã thanh toán",
                description: "Vui lòng thử lại sau.",
                type: "ERROR",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // ✅ Format thời gian còn lại (MM:SS)
    const formatTimeRemaining = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const { handleSubmit } = useForm<BookingFormDataForPayOS>({
        defaultValues: {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            adultCount: search.adultCount,
            childCount: search.childCount,
            checkIn: search.checkIn.toISOString(),
            checkOut: search.checkOut.toISOString(),
            hotelId: hotelId || "",
            orderCode: paymentLink.orderCode,
            totalCost: paymentLink.totalCost,
        },
        mode: "onChange",
        shouldUnregister: false,
    });

    /**
     * Validate và áp dụng promotion code
     */
    const handleApplyPromotion = async () => {
        if (!promotionCode.trim()) {
            setPromotionError("Vui lòng nhập mã khuyến mãi");
            return;
        }

        if (!hotelId) {
            setPromotionError("Không tìm thấy thông tin khách sạn");
            return;
        }

        setIsValidatingPromotion(true);
        setPromotionError("");

        try {
            const result = await apiClient.validatePromotionCode({
                code: promotionCode.trim(),
                hotelId,
                checkIn: search.checkIn.toISOString(),
                checkOut: search.checkOut.toISOString(),
                numberOfNights,
                totalCost: paymentLink.totalCost,
            });

            if (result.valid && result.promotion && result.discountAmount !== undefined && result.finalPrice !== undefined) {
                setAppliedPromotion({
                    code: promotionCode.trim(),
                    discountAmount: result.discountAmount,
                    finalPrice: result.finalPrice,
                    description: result.promotion.description,
                });
                showToast({
                    title: "Áp dụng mã khuyến mãi thành công!",
                    description: result.promotion.description,
                    type: "SUCCESS",
                });
            } else {
                setPromotionError(result.message || "Mã khuyến mãi không hợp lệ");
                setAppliedPromotion(null);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi validate mã khuyến mãi";
            setPromotionError(errorMessage);
            setAppliedPromotion(null);
            showToast({
                title: "Lỗi validate mã khuyến mãi",
                description: errorMessage,
                type: "ERROR",
            });
        } finally {
            setIsValidatingPromotion(false);
        }
    };

    /**
     * Xóa promotion code đã áp dụng
     */
    const handleRemovePromotion = () => {
        setPromotionCode("");
        setAppliedPromotion(null);
        setPromotionError("");
    };

    /**
     * Xử lý khi user click "Thanh toán với PayOS"
     */
    const onSubmit = (formData: BookingFormDataForPayOS) => {
        // ✅ Lưu thời gian tạo payment link vào sessionStorage để có thể check sau
        const paymentLinkInfo = {
            createdAt: paymentLinkCreatedAtRef.current,
            expiresAt: paymentLinkCreatedAtRef.current + (PAYOS_QR_EXPIRY_SECONDS * 1000),
            orderCode: paymentLink.orderCode,
        };
        sessionStorage.setItem("paymentLinkExpiry", JSON.stringify(paymentLinkInfo));

        // Tạo complete form data với thông tin từ state (cho phép chỉnh sửa)
        const completeFormData: BookingFormDataForPayOS = {
            ...formData,
            firstName: firstName || currentUser.firstName, // ✅ Cho phép chỉnh sửa
            lastName: lastName || currentUser.lastName, // ✅ Cho phép chỉnh sửa
            email: email || currentUser.email, // ✅ Cho phép chỉnh sửa
            phone: phone || undefined,
            specialRequests: specialRequests || undefined,
            promotionCode: appliedPromotion?.code || undefined,
            discountAmount: appliedPromotion?.discountAmount || undefined,
            totalCost: appliedPromotion?.finalPrice || paymentLink.totalCost, // ✅ Dùng finalPrice nếu có promotion
        };

        // Lưu form data vào sessionStorage để PaymentSuccess page có thể đọc
        sessionStorage.setItem("pendingBookingData", JSON.stringify(completeFormData));

        // ✅ Redirect đến trang PaymentPage với iframe (thay vì redirect trực tiếp đến PayOS)
        // Trang PaymentPage sẽ hiển thị countdown timer + iframe PayOS
        const paymentPageUrl = `/payment?checkoutUrl=${encodeURIComponent(paymentLink.checkoutUrl)}&orderCode=${paymentLink.orderCode}&hotelId=${hotelId || ""}`;
        window.location.href = paymentPageUrl;
    };

    // Tính giá hiển thị (có promotion hay không)
    const displayPrice = appliedPromotion?.finalPrice || paymentLink.totalCost;

    return (
        <div className="p-6">
            <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <User className="h-6 w-6 text-blue-600" />
                    Xác nhận thông tin đặt phòng
                </CardTitle>
                <p className="text-gray-600 mt-2">
                    Vui lòng kiểm tra và hoàn tất thông tin đặt phòng của bạn
                </p>

                {/* ✅ Countdown Timer nổi bật ở đầu form */}
                {!isExpired && (
                    <div className={`mt-4 rounded-lg p-3 border-2 ${timeRemaining <= 60
                        ? "bg-orange-50 border-orange-400"
                        : "bg-blue-50 border-blue-300"
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className={`h-5 w-5 ${timeRemaining <= 60 ? "text-orange-600 animate-pulse" : "text-blue-600"
                                    }`} />
                                <span className={`font-bold text-lg ${timeRemaining <= 60 ? "text-orange-800" : "text-blue-800"
                                    }`}>
                                    Mã QR còn hiệu lực: {formatTimeRemaining(timeRemaining)}
                                </span>
                            </div>
                            {timeRemaining <= 60 && (
                                <span className="text-xs text-orange-700 font-semibold animate-pulse">
                                    ⚠️ Sắp hết hạn!
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Sau khi click "Thanh toán với PayOS", bạn có {formatTimeRemaining(timeRemaining)} để hoàn tất thanh toán
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Thông tin cá nhân
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Họ <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    placeholder="Nhập họ của bạn"
                                    className="focus:ring-2 focus:ring-blue-500"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Tên <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    placeholder="Nhập tên của bạn"
                                    className="focus:ring-2 focus:ring-blue-500"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    placeholder="Nhập email của bạn"
                                    className="focus:ring-2 focus:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Số điện thoại (Tùy chọn)
                                </Label>
                                <Input
                                    type="tel"
                                    placeholder="Nhập số điện thoại của bạn"
                                    className="focus:ring-2 focus:ring-blue-500"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ✅ Promotion Code Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-blue-600" />
                            Mã khuyến mãi (Tùy chọn)
                        </h3>

                        {!appliedPromotion ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Nhập mã khuyến mãi"
                                        className="flex-1 focus:ring-2 focus:ring-blue-500"
                                        value={promotionCode}
                                        onChange={(e) => {
                                            setPromotionCode(e.target.value);
                                            setPromotionError("");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleApplyPromotion();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleApplyPromotion}
                                        disabled={isValidatingPromotion || !promotionCode.trim()}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isValidatingPromotion ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Áp dụng"
                                        )}
                                    </Button>
                                </div>
                                {promotionError && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{promotionError}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold text-green-800">
                                            Mã khuyến mãi: {appliedPromotion.code}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemovePromotion}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-green-700 mb-2">
                                    {appliedPromotion.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Giảm giá:</span>
                                    <span className="font-bold text-green-600">
                                        -{formatVND(appliedPromotion.discountAmount)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            Yêu cầu đặc biệt (Tùy chọn)
                        </h3>

                        <div className="space-y-2">
                            <textarea
                                rows={4}
                                placeholder="Mọi yêu cầu đặc biệt, sở thích hoặc thông tin bổ sung..."
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                Cho chúng tôi biết nếu bạn có bất kỳ yêu cầu đặc biệt nào cho kỳ nghỉ của bạn
                            </p>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Tổng giá
                        </h3>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 space-y-2">
                            {/* Original Price */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Tổng chi phí gốc</span>
                                <span className="text-gray-600">
                                    {formatVND(paymentLink.totalCost)}
                                </span>
                            </div>

                            {/* Discount (nếu có) */}
                            {appliedPromotion && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span className="flex items-center gap-1">
                                        <Tag className="h-4 w-4" />
                                        Giảm giá ({appliedPromotion.code})
                                    </span>
                                    <span className="font-semibold">
                                        -{formatVND(appliedPromotion.discountAmount)}
                                    </span>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-blue-200 my-2"></div>

                            {/* Final Price */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-semibold">Tổng thanh toán</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {formatVND(displayPrice)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                Đã bao gồm thuế và phí
                            </div>
                        </div>
                    </div>

                    {/* PayOS Payment Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Thanh toán qua PayOS
                        </h3>

                        {/* ✅ QR Code Expiry Warning */}
                        {isExpired ? (
                            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <span className="font-semibold text-red-800">
                                            Mã QR đã hết hạn
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-red-700 mb-3">
                                    Mã QR chỉ có hiệu lực trong 5 phút. Vui lòng tạo lại mã thanh toán mới.
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleRefreshPaymentLink}
                                    disabled={isRefreshing}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                        ) : (
                            <div className={`border rounded-lg p-4 ${timeRemaining <= 60
                                ? "bg-orange-50 border-orange-300"
                                : "bg-green-50 border-green-200"
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className={`h-5 w-5 ${timeRemaining <= 60 ? "text-orange-600" : "text-green-600"
                                            }`} />
                                        <span className={`font-semibold ${timeRemaining <= 60 ? "text-orange-800" : "text-green-800"
                                            }`}>
                                            Thời gian còn lại: {formatTimeRemaining(timeRemaining)}
                                        </span>
                                    </div>
                                </div>
                                {timeRemaining <= 60 && (
                                    <p className="text-sm text-orange-700 mb-2">
                                        ⚠️ Mã QR sẽ hết hạn trong vòng 1 phút. Vui lòng thanh toán ngay!
                                    </p>
                                )}
                                <p className="text-sm text-gray-700">
                                    Bạn sẽ được chuyển hướng đến trang thanh toán PayOS để hoàn tất giao dịch.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                                    <Shield className="h-3 w-3" />
                                    Thanh toán an toàn và được mã hóa
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 space-y-3">
                        {/* ✅ Hiển thị countdown ngay trên nút thanh toán */}
                        {!isExpired && (
                            <div className={`text-center p-2 rounded-md ${timeRemaining <= 60
                                ? "bg-orange-100 border border-orange-300"
                                : "bg-blue-100 border border-blue-300"
                                }`}>
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className={`h-4 w-4 ${timeRemaining <= 60 ? "text-orange-600" : "text-blue-600"
                                        }`} />
                                    <span className={`text-sm font-semibold ${timeRemaining <= 60 ? "text-orange-800" : "text-blue-800"
                                        }`}>
                                        ⏱️ Thời gian còn lại: {formatTimeRemaining(timeRemaining)}
                                    </span>
                                </div>
                                {timeRemaining <= 60 && (
                                    <p className="text-xs text-orange-700 mt-1 font-medium">
                                        Vui lòng thanh toán ngay! Mã QR sẽ hết hạn sau {formatTimeRemaining(timeRemaining)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ✅ Buttons: Submit và Cancel */}
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isExpired} // ✅ Disable nếu QR đã hết hạn
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    {isExpired ? "Mã QR đã hết hạn" : "Thanh toán với PayOS"}
                                </div>
                            </Button>

                            {/* ✅ Nút Cancel */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCancelDialog(true)}
                                className="px-6 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Hủy
                            </Button>
                        </div>

                        {isExpired && (
                            <p className="text-xs text-red-600 mt-2 text-center">
                                Vui lòng tạo lại mã thanh toán ở trên
                            </p>
                        )}
                        {!isExpired && (
                            <p className="text-xs text-gray-500 text-center">
                                💡 Lưu ý: Mã QR chỉ có hiệu lực trong 5 phút. Sau khi click nút trên, bạn sẽ được chuyển đến trang thanh toán PayOS.
                            </p>
                        )}
                    </div>
                </form>

                {/* Trust Indicators */}
                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-500" />
                            Thanh toán an toàn
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Xác nhận ngay
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-green-500" />
                            Hỗ trợ 24/7
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* ✅ Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            Xác nhận hủy đặt phòng
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn hủy đặt phòng? Thông tin đã nhập sẽ không được lưu.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            Không, tiếp tục đặt phòng
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowCancelDialog(false);
                                window.history.back();
                            }}
                        >
                            Có, hủy đặt phòng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingFormPayOS;