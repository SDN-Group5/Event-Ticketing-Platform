import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { formatVND } from "../../../utils/formatCurrency";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
    CreditCard,
    Search,
    Eye,
    Download,
    Filter,
    Calendar,
    DollarSign,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";

/**
 * PaymentsSection Component
 * Quản lý và xem danh sách giao dịch thanh toán từ PayOS
 */
const PaymentsSection = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<apiClient.PaymentDetailType | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    // Query để lấy danh sách payments
    const { data: paymentsData, isLoading } = useQuery({
        queryKey: ["getAllPayments", currentPage, pageSize, paymentStatusFilter],
        queryFn: () =>
            apiClient.getAllPayments({
                paymentStatus: paymentStatusFilter || undefined,
                page: currentPage,
                limit: pageSize,
            }),
    });

    // Query để lấy chi tiết payment khi mở modal
    const { data: paymentDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ["getPaymentByOrderCode", selectedPayment?.orderCode],
        queryFn: () => apiClient.getPaymentByOrderCode(selectedPayment!.orderCode.toString()),
        enabled: !!selectedPayment && isDetailModalOpen,
    });

    // Query để lấy thống kê
    const { data: statisticsData } = useQuery({
        queryKey: ["getPaymentStatistics"],
        queryFn: () => apiClient.getPaymentStatistics(),
    });

    // Filter payments theo search term
    const filteredPayments = paymentsData?.payments?.filter((payment) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            payment.orderCode?.toString().toLowerCase().includes(searchLower) ||
            payment.customerName.toLowerCase().includes(searchLower) ||
            payment.customerEmail.toLowerCase().includes(searchLower) ||
            payment.hotelName?.toLowerCase().includes(searchLower)
        );
    }) || [];

    const handleViewDetail = async (payment: apiClient.PaymentType) => {
        try {
            const detail = await apiClient.getPaymentByOrderCode(payment.orderCode.toString());
            setSelectedPayment(detail.payment);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error("Error fetching payment detail:", error);
        }
    };

    const handleViewQR = async (payment: apiClient.PaymentType) => {
        // Lấy checkoutUrl từ PayOS
        // Vì payment đã được tạo, cần lấy lại thông tin từ PayOS để có QR code
        try {
            const detail = await apiClient.getPaymentByOrderCode(payment.orderCode.toString());
            setSelectedPayment(detail.payment);
            setIsQRModalOpen(true);
        } catch (error) {
            console.error("Error fetching payment detail:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-800" },
            pending: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-800" },
            failed: { label: "Thất bại", className: "bg-red-100 text-red-800" },
            refunded: { label: "Đã hoàn tiền", className: "bg-gray-100 text-gray-800" },
        };

        const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
        return (
            <Badge
                variant="outline"
                className={`font-semibold ${statusInfo.className}`}
            >
                {statusInfo.label}
            </Badge>
        );
    };

    const getBookingStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            confirmed: { label: "Đã xác nhận", className: "bg-green-100 text-green-800" },
            checked_in: { label: "Đã check-in", className: "bg-blue-100 text-blue-800" },
            completed: { label: "Hoàn tất", className: "bg-gray-100 text-gray-800" },
            cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
            pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
        };

        const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
        return (
            <Badge className={statusInfo.className}>
                {statusInfo.label}
            </Badge>
        );
    };

    // Tính tổng số trang
    const totalPages = paymentsData?.pagination?.pages || 1;

    return (
        <div id="payments-section" className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Quản lý Giao dịch Thanh toán
                </h2>
                <p className="text-gray-600">
                    Xem và quản lý tất cả giao dịch thanh toán qua PayOS
                </p>
            </div>

            {/* Statistics Cards */}
            {statisticsData?.statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tổng giao dịch</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {statisticsData.statistics.totalTransactions}
                                    </p>
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatVND(statisticsData.statistics.totalRevenue)}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Giao dịch thành công</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {statisticsData.statistics.statusBreakdown?.paid || 0}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm theo orderCode, tên khách hàng, email, khách sạn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => {
                                    setPaymentStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="paid">Đã thanh toán</option>
                                <option value="pending">Chờ thanh toán</option>
                                <option value="failed">Thất bại</option>
                                <option value="refunded">Đã hoàn tiền</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Giao dịch</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Không tìm thấy giao dịch nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">OrderCode</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách sạn</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Số tiền</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Booking</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày tạo</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment) => (
                                            <tr
                                                key={payment.orderCode}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <span className="font-mono text-sm font-semibold">
                                                        #{payment.orderCode}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{payment.customerName}</p>
                                                        <p className="text-sm text-gray-500">{payment.customerEmail}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-gray-900">{payment.hotelName || "N/A"}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-green-600">
                                                        {formatVND(payment.amount)}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getStatusBadge(payment.status)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getBookingStatusBadge(payment.bookingStatus)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(payment.createdAt).toLocaleString("vi-VN", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetail(payment)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Chi tiết
                                                        </Button>
                                                        {payment.status === "pending" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewQR(payment)}
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                QR Code
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Trang {currentPage} / {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Trước
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Payment Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết Giao dịch #{selectedPayment?.orderCode}</DialogTitle>
                    </DialogHeader>
                    {isLoadingDetail ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : paymentDetail?.payment ? (
                        <div className="space-y-4">
                            {/* Customer Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông tin Khách hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><span className="font-semibold">Tên:</span> {paymentDetail.payment.customerName}</p>
                                    <p><span className="font-semibold">Email:</span> {paymentDetail.payment.customerEmail}</p>
                                    {paymentDetail.payment.customerPhone && (
                                        <p><span className="font-semibold">SĐT:</span> {paymentDetail.payment.customerPhone}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Hotel Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông tin Khách sạn</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><span className="font-semibold">Tên:</span> {paymentDetail.payment.hotelName}</p>
                                    {paymentDetail.payment.hotelCity && (
                                        <p><span className="font-semibold">Thành phố:</span> {paymentDetail.payment.hotelCity}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Booking Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông tin Booking</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><span className="font-semibold">Check-in:</span> {new Date(paymentDetail.payment.checkIn).toLocaleDateString("vi-VN")}</p>
                                    <p><span className="font-semibold">Check-out:</span> {new Date(paymentDetail.payment.checkOut).toLocaleDateString("vi-VN")}</p>
                                    <p><span className="font-semibold">Người lớn:</span> {paymentDetail.payment.adultCount}</p>
                                    <p><span className="font-semibold">Trẻ em:</span> {paymentDetail.payment.childCount}</p>
                                    <p><span className="font-semibold">Trạng thái:</span> {getBookingStatusBadge(paymentDetail.payment.bookingStatus)}</p>
                                </CardContent>
                            </Card>

                            {/* Payment Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông tin Thanh toán</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><span className="font-semibold">OrderCode:</span> #{paymentDetail.payment.orderCode}</p>
                                    <p><span className="font-semibold">Số tiền:</span> <span className="text-green-600 font-bold">{formatVND(paymentDetail.payment.amount)}</span></p>
                                    {paymentDetail.payment.finalTotalCost && (
                                        <p><span className="font-semibold">Tổng cuối:</span> <span className="text-green-600 font-bold">{formatVND(paymentDetail.payment.finalTotalCost)}</span></p>
                                    )}
                                    <p><span className="font-semibold">Trạng thái:</span> {getStatusBadge(paymentDetail.payment.status)}</p>
                                    {paymentDetail.payment.paymentMethod && (
                                        <p><span className="font-semibold">Phương thức:</span> {paymentDetail.payment.paymentMethod}</p>
                                    )}
                                    <p><span className="font-semibold">Ngày tạo:</span> {new Date(paymentDetail.payment.createdAt).toLocaleString("vi-VN")}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* QR Code Modal - Sử dụng iframe để hiển thị PayOS checkout page với UI có sẵn */}
            <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Mã QR Thanh toán - OrderCode #{selectedPayment?.orderCode}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsQRModalOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    {paymentDetail?.payment?.payosInfo?.checkoutUrl ? (
                        <div className="flex-1 flex flex-col space-y-4">
                            <p className="text-sm text-gray-600">
                                Quét mã QR bằng app ngân hàng để thanh toán. Giao dịch này sẽ được cập nhật tự động khi thanh toán thành công.
                            </p>
                            {/* Hiển thị PayOS checkout page trong iframe - Sử dụng UI có sẵn từ PayOS */}
                            <div className="flex-1 border-4 border-black rounded-lg overflow-hidden bg-white" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                                <iframe
                                    src={paymentDetail.payment.payosInfo.checkoutUrl}
                                    className="w-full h-full min-h-[600px] border-0"
                                    title="PayOS Checkout - QR Code Payment"
                                    allow="payment"
                                />
                            </div>
                        </div>
                    ) : paymentDetail?.payment?.payosInfo ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">
                                Không thể tải trang thanh toán PayOS. Vui lòng thử lại sau.
                            </p>
                            <p className="text-sm text-gray-500">
                                OrderCode: #{selectedPayment?.orderCode}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải thông tin thanh toán từ PayOS...</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentsSection;

