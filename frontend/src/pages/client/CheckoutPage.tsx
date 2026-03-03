import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentAPI } from '../../services/paymentApiService';
import { ROUTES } from '../../constants/routes';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    qrCode: string;
    checkoutUrl: string;
    orderCode: number;
    totalAmount: number;
    commissionAmount: number;
    organizerAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkoutData = location.state;

  if (!checkoutData) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const {
    eventId,
    eventName,
    eventImage,
    eventDate,
    eventLocation,
    organizerId,
    zone,
    seats,
    ticketCount = seats?.length || 1,
    total,
  } = checkoutData;

  // Chuẩn hoá chuỗi QR từ PayOS để <img src="..."> hiển thị đúng
  const normalizeQrCode = (qr: string | undefined | null): string => {
    if (!qr) return '';
    // Nếu PayOS trả về url ảnh (http/https) thì dùng nguyên
    if (qr.startsWith('http://') || qr.startsWith('https://')) return qr;
    // Nếu đã là data url thì giữ nguyên
    if (qr.startsWith('data:image')) return qr;
    // Mặc định PayOS trả về base64 png → thêm prefix
    return `data:image/png;base64,${qr}`;
  };

  /**
   * Flow thanh toán:
   * - Frontend gửi dữ liệu order (event, zone, seats, userId) sang payment-service.
   * - payment-service tạo Order trong Mongo + gọi PayOS.createPaymentLink.
   * - Nếu PayOS trả về checkoutUrl:
   *   → redirect thẳng trình duyệt sang trang thanh toán PayOS (ưu tiên dùng giao diện thật của PayOS).
   * - Nếu vì lý do nào đó không có checkoutUrl:
   *   → dùng fallback hiển thị QR code ngay trong trang CheckoutPage (paymentData + <img src={qrCode} />).
   * - Trạng thái đơn hàng sau đó được kiểm tra lại bằng PaymentAPI.verifyPayment(orderCode).
   */
  const handleCreatePayment = useCallback(async () => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const items = seats?.length
        ? seats.map((seat: any) => ({
            zoneName: zone.name,
            seatId: seat.id,
            price: zone.price,
            quantity: 1,
          }))
        : [
            {
              zoneName: zone.name,
              price: zone.price,
              quantity: ticketCount,
            },
          ];

      const result = await PaymentAPI.createPayment({
        userId: user.id,
        eventId,
        eventName: eventName || 'Event',
        organizerId: organizerId || 'unknown',
        items,
      });

      // Auto redirect thẳng sang trang thanh toán PayOS,
      // không hiển thị UI checkout nội bộ nữa.
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      // (Fallback hiếm khi dùng): nếu vì lý do nào đó không có checkoutUrl,
      // vẫn hiển thị QR nội bộ với chuỗi QR đã normalize.
      setPaymentData({
        qrCode: normalizeQrCode(result.qrCode),
        checkoutUrl: result.checkoutUrl,
        orderCode: result.orderCode,
        totalAmount: result.totalAmount,
        commissionAmount: result.commissionAmount,
        organizerAmount: result.organizerAmount,
      });
    } catch (err: any) {
      console.error('Payment creation failed:', err);
      setError(err.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  }, [user, navigate, eventId, eventName, organizerId, seats, zone, ticketCount]);

  useEffect(() => {
    // Tự động gọi tạo thanh toán đúng 1 lần khi vào trang,
    // tránh loop gọi lại liên tục khi bị lỗi server.
    if (!paymentData && !isProcessing && !hasAttemptedCreate) {
      setHasAttemptedCreate(true);
      void handleCreatePayment();
    }
  }, [paymentData, isProcessing, hasAttemptedCreate, handleCreatePayment]);

  const handleOpenPayOS = () => {
    if (paymentData?.checkoutUrl) {
      window.open(paymentData.checkoutUrl, '_blank');
    }
  };

  const handleCheckStatus = async () => {
    if (!paymentData) return;

    try {
      const result = await PaymentAPI.verifyPayment(paymentData.orderCode);
      if (result.status === 'paid') {
        navigate(ROUTES.PAYMENT_SUCCESS, {
          state: {
            orderCode: paymentData.orderCode,
            eventName,
            eventImage,
            eventDate,
            eventLocation,
            zone,
            seats,
            ticketCount,
            totalAmount: paymentData.totalAmount,
          },
        });
      } else {
        setError(`Trạng thái: ${result.status === 'processing' ? 'Đang chờ thanh toán...' : result.status}`);
      }
    } catch (err) {
      setError('Không thể kiểm tra trạng thái. Thử lại sau.');
    }
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-bold">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: QR / Payment */}
          <div className="lg:col-span-7">
            <div className="bg-[#1e293b]/40 backdrop-blur border border-white/5 rounded-xl p-8">
              {!paymentData ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8655f6]/20 to-[#ec4899]/20 mb-6">
                    <span className="material-symbols-outlined text-4xl text-[#8655f6]">
                      qr_code_2
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Thanh toán qua PayOS</h2>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    Nhấn nút bên dưới để tạo mã QR thanh toán. Bạn có thể quét QR bằng app ngân hàng
                    hoặc mở trang PayOS để thanh toán.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleCreatePayment}
                    disabled={isProcessing}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold text-lg hover:shadow-lg hover:shadow-[#8655f6]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
                  >
                    {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">
                          progress_activity
                        </span>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">payments</span>
                        Tạo mã thanh toán
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">Quét mã QR để thanh toán</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Mở app ngân hàng → Quét QR → Xác nhận thanh toán
                  </p>

                  {/* QR Code */}
                  <div className="inline-block bg-white p-4 rounded-2xl shadow-2xl mb-6">
                    <img
                      src={paymentData.qrCode}
                      alt="PayOS QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>

                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#8655f6] to-[#ec4899] bg-clip-text text-transparent">
                    {formatVND(paymentData.totalAmount)}
                  </div>
                  <p className="text-xs text-gray-500 mb-6">
                    Mã đơn: #{paymentData.orderCode}
                  </p>

                  {/* Commission info */}
                  <div className="bg-[#0f172a]/60 rounded-lg p-4 mb-6 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Organizer nhận</span>
                      <span className="text-emerald-400 font-semibold">
                        {formatVND(paymentData.organizerAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phí dịch vụ (5%)</span>
                      <span className="text-amber-400 font-semibold">
                        {formatVND(paymentData.commissionAmount)}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={handleOpenPayOS}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold hover:shadow-lg hover:shadow-[#8655f6]/30 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                      Mở trang PayOS
                    </button>
                    <button
                      onClick={handleCheckStatus}
                      className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      Kiểm tra đã thanh toán
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

              {/* Event info */}
              <div className="flex gap-4 mb-6">
                {eventImage && (
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${eventImage})` }}
                  />
                )}
                <div>
                  <h4 className="font-bold line-clamp-2">{eventName || 'Sự kiện'}</h4>
                  {eventDate && (
                    <p className="text-xs text-gray-400">
                      {new Date(eventDate).toLocaleDateString('vi-VN')} •{' '}
                      {new Date(eventDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {eventLocation && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[10px]">location_on</span>
                      {eventLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* Zone + Seats */}
              <div className="bg-[#0f172a]/40 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: zone?.color || '#8655f6' }}
                  />
                  <span className="font-semibold">{zone?.name || 'Zone'}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    x{ticketCount}
                  </span>
                </div>

                {seats && seats.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {seats.map((seat: any) => (
                      <span
                        key={seat.id}
                        className="text-[10px] px-2 py-1 rounded bg-white/10 text-gray-300"
                      >
                        R{seat.row}-{seat.number}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-white/10 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    Vé ({ticketCount} × {formatVND(zone?.price || 0)})
                  </span>
                  <span>{formatVND(total || ticketCount * (zone?.price || 0))}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                <span className="text-gray-400">Tổng cộng</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-[#8655f6] to-[#ec4899] bg-clip-text text-transparent">
                  {formatVND(total || ticketCount * (zone?.price || 0))}
                </span>
              </div>

              <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Thanh toán bảo mật qua PayOS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
