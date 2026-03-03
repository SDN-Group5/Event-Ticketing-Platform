import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { PaymentAPI } from '../../services/paymentApiService';

export const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const cleanupOrder = async () => {
      if (!orderCode) return;
      try {
        const result = await PaymentAPI.verifyPayment(orderCode);
        if (result.status === 'deleted' || result.status === 'cancelled') {
          setMessage('Đơn hàng đã được huỷ và xoá khỏi hệ thống.');
        } else if (result.status === 'paid') {
          setMessage('Đơn hàng đã được thanh toán trước đó.');
        } else {
          setMessage('Đơn hàng đang ở trạng thái không xác định, vui lòng thử lại sau.');
        }
      } catch {
        setMessage('Không thể cập nhật trạng thái đơn hàng. Bạn có thể thử lại sau.');
      }
    };

    void cleanupOrder();
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
          <span className="material-symbols-outlined text-4xl text-red-400">close</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Thanh toán bị huỷ</h1>
        <p className="text-gray-400 mb-2">
          Đơn hàng {orderCode ? `#${orderCode}` : ''} đã bị huỷ hoặc hết hạn.
        </p>
        <p className="text-gray-500 text-sm mb-2">
          Bạn có thể quay lại chọn vé và thử thanh toán lại.
        </p>
        {message && (
          <p className="text-xs text-gray-400 mb-8">
            {message}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="px-6 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold hover:shadow-lg hover:shadow-[#8655f6]/30 transition-all"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};
