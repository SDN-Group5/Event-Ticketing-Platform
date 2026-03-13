import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

interface Voucher {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  minimumPrice?: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt?: string;
}

function isExpired(v: Voucher): boolean {
  if (v.status === 'expired') return true;
  if (v.endDate && new Date(v.endDate) < new Date()) return true;
  return false;
}

function formatDate(d?: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

function daysLeft(endDate?: string): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const MyVouchersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    const token = localStorage.getItem('auth_token');
    axios
      .get(`${API_BASE}/api/payments/user/vouchers`, {
        params: { userId: user.id },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data = res.data?.data ?? [];
        setVouchers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error fetching user vouchers:', err);
        setError('Không thể tải voucher. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const filtered = vouchers.filter((v) => {
    if (filter === 'active') return !isExpired(v) && v.usedCount < v.maxUses;
    if (filter === 'expired') return isExpired(v) || v.usedCount >= v.maxUses;
    return true;
  });

  const activeCount = vouchers.filter((v) => !isExpired(v) && v.usedCount < v.maxUses).length;

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-[#8655f6]">redeem</span>
          Voucher của tôi
        </h1>
        <p className="text-gray-400">
          Các mã giảm giá được cấp cho tài khoản của bạn.
          {activeCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
              {activeCount} đang dùng được
            </span>
          )}
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === f
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'active' ? 'Còn hiệu lực' : 'Đã hết hạn'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
          <p className="text-red-400">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-[#2a2436] flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-gray-600">redeem</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            {filter === 'all' ? 'Bạn chưa có voucher nào' : filter === 'active' ? 'Không có voucher còn hiệu lực' : 'Không có voucher hết hạn'}
          </h2>
          <p className="text-gray-500 text-sm">Hủy vé để nhận voucher giảm giá 50%!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => {
            const expired = isExpired(v);
            const fullyUsed = v.usedCount >= v.maxUses;
            const inactive = expired || fullyUsed;
            const days = daysLeft(v.endDate);

            return (
              <div
                key={v._id}
                className={`relative rounded-2xl overflow-hidden border transition-all ${
                  inactive
                    ? 'border-[#3a3447]/60 opacity-60'
                    : 'border-[#8655f6]/40 hover:border-[#8655f6]/70 hover:shadow-[0_0_24px_rgba(134,85,246,0.15)]'
                }`}
              >
                {/* Top coloured band */}
                <div
                  className={`h-2 w-full ${
                    inactive
                      ? 'bg-gray-600'
                      : 'bg-gradient-to-r from-[#8655f6] to-[#d946ef]'
                  }`}
                />

                <div className="bg-[#2a2436] p-5">
                  {/* Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        inactive
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-[#8655f6]/20 text-[#a78bfa]'
                      }`}
                    >
                      {fullyUsed ? 'Đã dùng' : expired ? 'Hết hạn' : 'Còn hiệu lực'}
                    </span>

                    {!inactive && days !== null && (
                      <span
                        className={`text-xs font-medium ${
                          days <= 3 ? 'text-red-400' : days <= 7 ? 'text-orange-400' : 'text-gray-400'
                        }`}
                      >
                        {days === 0 ? 'Hết hạn hôm nay!' : `Còn ${days} ngày`}
                      </span>
                    )}
                  </div>

                  {/* Discount value */}
                  <p className={`text-4xl font-black mb-1 ${inactive ? 'text-gray-500' : 'text-white'}`}>
                    {v.discountType === 'percentage'
                      ? `-${v.discountValue}%`
                      : `-${v.discountValue.toLocaleString('vi-VN')}đ`}
                  </p>
                  <p className="text-sm text-gray-400 mb-4 min-h-[20px]">
                    {v.description || (v.discountType === 'percentage' ? 'Giảm giá phần trăm' : 'Giảm giá cố định')}
                  </p>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-400 mb-5 border-t border-[#3a3447] pt-3">
                    {v.minimumPrice != null && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-gray-500">sell</span>
                        Đơn tối thiểu: <span className="text-gray-300 font-medium">{v.minimumPrice.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    {v.endDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-gray-500">calendar_today</span>
                        HSD: <span className="text-gray-300">{formatDate(v.endDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-gray-500">repeat</span>
                      Đã dùng: <span className="text-gray-300">{v.usedCount}/{v.maxUses}</span>
                    </div>
                  </div>

                  {/* Code + Copy button */}
                  <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
                      inactive ? 'bg-[#1e1828]' : 'bg-[#1e1828] border border-[#8655f6]/30'
                    }`}
                  >
                    <span className={`flex-1 font-mono font-bold tracking-widest text-sm ${inactive ? 'text-gray-500' : 'text-[#d8b4fe]'}`}>
                      {v.code}
                    </span>
                    {!inactive && (
                      <button
                        onClick={() => handleCopy(v.code)}
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-[#8655f6] hover:text-[#d946ef] transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">
                          {copied === v.code ? 'check' : 'content_copy'}
                        </span>
                        {copied === v.code ? 'Đã copy' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
