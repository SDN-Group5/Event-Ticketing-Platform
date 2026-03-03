import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { PaymentAPI } from '../../services/paymentApiService';
import { ROUTES } from '../../constants/routes';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const stateData = location.state;
  const orderCodeFromUrl = searchParams.get('orderCode');
  const orderCode = stateData?.orderCode || orderCodeFromUrl;

  useEffect(() => {
    if (!orderCode) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const result = await PaymentAPI.verifyPayment(orderCode);
        if (result.status === 'paid') {
          setOrderData({
            ...stateData,
            ...result.order,
            orderCode,
          });
        } else {
          setError(`Trạng thái thanh toán: ${result.status}. Vui lòng kiểm tra lại.`);
        }
      } catch (err: any) {
        if (stateData) {
          setOrderData(stateData);
        } else {
          setError('Không thể xác minh thanh toán.');
        }
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [orderCode]);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (!orderCode && !stateData) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl animate-spin text-[#8655f6] mb-4 block">
            progress_activity
          </span>
          <p className="text-lg text-gray-400">Đang xác minh thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
            <span className="material-symbols-outlined text-4xl text-amber-400">warning</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Chưa xác nhận</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="px-6 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const eventName = orderData?.eventName || stateData?.eventName || 'Sự kiện';
  const eventImage = orderData?.eventImage || stateData?.eventImage;
  const eventDate = orderData?.eventDate || stateData?.eventDate;
  const eventLocation = orderData?.eventLocation || stateData?.eventLocation;
  const zone = orderData?.zone || stateData?.zone;
  const ticketCount = orderData?.ticketCount || stateData?.ticketCount || orderData?.items?.length || 1;
  const totalAmount = orderData?.totalAmount || stateData?.totalAmount || 0;
  const seats = orderData?.seats || stateData?.seats || [];
  const displayOrderCode = orderData?.orderCode || orderCode;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8655f6]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ec4899]/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 mb-6 shadow-[0_0_60px_rgba(16,185,129,0.5)]">
          <span className="material-symbols-outlined text-5xl text-white font-bold">check</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Thanh toán thành công!</h1>
        <p className="text-slate-400 text-lg">Chúc bạn có trải nghiệm tuyệt vời!</p>
      </div>

      {/* Ticket Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#1e293b]/80 to-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-2/3 left-0 -translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-full" />
        <div className="absolute top-2/3 right-0 translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-full" />
        <div className="absolute top-2/3 left-4 right-4 border-b-2 border-dashed border-white/10" />

        {eventImage && (
          <div
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${eventImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
            <div className="absolute bottom-4 left-6">
              {zone && (
                <span className="px-3 py-1 bg-[#8655f6] text-white text-xs font-bold rounded-full uppercase">
                  {zone.name}
                </span>
              )}
              <h2 className="text-2xl font-bold text-white mt-2 mb-1">{eventName}</h2>
              {eventLocation && (
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">location_on</span>
                  {eventLocation}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-6 pt-8 space-y-4">
          {eventDate && (
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase">Ngày</p>
                <p className="font-semibold">
                  {new Date(eventDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">Giờ</p>
                <p className="font-semibold">
                  {new Date(eventDate).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">Số vé</p>
              <p className="font-semibold">
                {ticketCount} vé {zone ? `(${zone.name})` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase">Tổng tiền</p>
              <p className="font-semibold text-emerald-400">{formatVND(totalAmount)}</p>
            </div>
          </div>

          {seats.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Ghế đã chọn</p>
              <div className="flex flex-wrap gap-1">
                {seats.map((s: any) => (
                  <span
                    key={s.id || s.seatId}
                    className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded"
                  >
                    R{s.row}-{s.number}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/5 flex flex-col items-center justify-center">
          <div className="bg-white p-3 rounded-xl mb-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=ORDER-${displayOrderCode}`}
              alt="QR"
              className="w-28 h-28"
            />
          </div>
          <p className="text-xs text-gray-500 font-mono">Mã đơn: #{displayOrderCode}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8 w-full max-w-md">
        <button className="flex-1 py-3 border border-gray-600 rounded-xl font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">download</span>
          Tải PDF
        </button>
        <button
          onClick={() => navigate(ROUTES.MY_TICKETS)}
          className="flex-1 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold hover:shadow-lg hover:shadow-[#8655f6]/30 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">confirmation_number</span>
          Vé của tôi
        </button>
      </div>

      <button
        onClick={() => navigate(ROUTES.HOME)}
        className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Về trang chủ
      </button>
    </div>
  );
};
