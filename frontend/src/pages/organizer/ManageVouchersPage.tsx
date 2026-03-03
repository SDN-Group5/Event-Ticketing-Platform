import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  OrganizerVoucherAPI,
  VoucherDTO,
  VoucherInput,
} from '../../services/voucherApiService';

interface Voucher extends VoucherDTO {
  id: string;
}

interface VoucherFormState {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  maxUses: string;
  endDate: string;
  minimumPrice: string;
  status: 'active' | 'inactive' | 'expired';
}

export const ManageVouchersPage: React.FC = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherFormState>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '1',
    endDate: '',
    minimumPrice: '',
    status: 'active',
  });
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await OrganizerVoucherAPI.listMyVouchers(user.id);
        const mapped: Voucher[] = data.map((v) => ({
          ...v,
          id: v._id,
        }));
        setVouchers(mapped);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
        setError('Không tải được danh sách voucher');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [user?.id]);

  const handleDelete = (id: string) => {
    if (!user?.id) return;
    if (!window.confirm('Bạn có chắc muốn xoá voucher này?')) return;

    (async () => {
      try {
        await OrganizerVoucherAPI.deleteVoucher(user.id, id);
        setVouchers((prev) => prev.filter((v) => v.id !== id));
      } catch (err) {
        console.error('Error deleting voucher:', err);
        setError('Xoá voucher thất bại');
      }
    })();
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      description: voucher.description || '',
      discountType: voucher.discountType,
      discountValue: String(voucher.discountValue),
      maxUses: String(voucher.maxUses),
      endDate: voucher.endDate ? voucher.endDate.slice(0, 10) : '',
      minimumPrice:
        voucher.minimumPrice != null ? String(voucher.minimumPrice) : '',
      status: voucher.status,
    });
    setError(null);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingVoucher(null);
    setForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxUses: '1',
      endDate: '',
      minimumPrice: '',
      status: 'active',
    });
    setError(null);
    setShowModal(true);
  };

  const handleFormChange = (
    field: keyof VoucherFormState,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayloadFromForm = (): VoucherInput => {
    return {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue || 0),
      maxUses: Number(form.maxUses || 1),
      endDate: form.endDate || undefined,
      minimumPrice: form.minimumPrice
        ? Number(form.minimumPrice)
        : undefined,
      status: form.status,
    };
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayloadFromForm();

      if (!payload.code || !payload.discountValue || !payload.maxUses) {
        setError('Vui lòng nhập đủ mã, giá trị giảm và số lượt dùng');
        setSaving(false);
        return;
      }

      if (editingVoucher) {
        const updated = await OrganizerVoucherAPI.updateVoucher(
          user.id,
          editingVoucher.id,
          payload,
        );
        setVouchers((prev) =>
          prev.map((v) =>
            v.id === editingVoucher.id ? { ...updated, id: updated._id } : v,
          ),
        );
      } else {
        const created = await OrganizerVoucherAPI.createVoucher(
          user.id,
          payload,
        );
        setVouchers((prev) => [{ ...created, id: created._id }, ...prev]);
      }

      setShowModal(false);
    } catch (err: any) {
      console.error('Error saving voucher:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Lưu voucher thất bại';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'inactive':
        return 'DISABLED';
      case 'expired':
        return 'EXPIRED';
      default:
        return status.toUpperCase();
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    if (!user?.id) return;
    if (voucher.status === 'expired') return;

    const newStatus: VoucherFormState['status'] =
      voucher.status === 'active' ? 'inactive' : 'active';

    setTogglingId(voucher.id);
    setError(null);

    // Optimistic update
    setVouchers(prev =>
      prev.map(v =>
        v.id === voucher.id ? { ...v, status: newStatus } : v,
      ),
    );

    try {
      const updated = await OrganizerVoucherAPI.updateVoucher(user.id, voucher.id, {
        status: newStatus,
      });

      setVouchers(prev =>
        prev.map(v =>
          v.id === voucher.id ? { ...updated, id: updated._id } : v,
        ),
      );
    } catch (err: any) {
      console.error('Error toggling voucher status:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể cập nhật trạng thái voucher';
      setError(msg);

      // Revert on error
      setVouchers(prev =>
        prev.map(v =>
          v.id === voucher.id ? { ...v, status: voucher.status } : v,
        ),
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Vouchers</h1>
          <p className="text-gray-400">Create and manage discount vouchers</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Create Voucher
        </button>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">card_giftcard</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No vouchers created</h2>
          <p className="text-gray-500 mb-6">Create your first voucher to offer discounts to customers.</p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Create Voucher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vouchers.map(voucher => (
            <div
              key={voucher.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Voucher Header */}
              <div className="bg-gradient-to-r from-[#8655f6] to-[#d946ef] p-4">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="text-white font-bold text-xl tracking-wide">{voucher.code}</h3>
                    <p className="text-white/80 text-sm mt-1">{voucher.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(voucher.status)}`}>
                      {getStatusLabel(voucher.status)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(voucher)}
                      disabled={voucher.status === 'expired' || togglingId === voucher.id}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${
                        voucher.status === 'active'
                          ? 'bg-emerald-500/80'
                          : 'bg-gray-500/70'
                      } ${voucher.status === 'expired' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                          voucher.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Voucher Content */}
              <div className="p-4">
                {/* Discount Info */}
                <div className="mb-4 p-3 bg-[#3a3447] rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Discount</span>
                    <span className="text-white font-bold text-lg">
                      {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString()} đ`}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Usage</p>
                    <p className="text-white font-semibold">{voucher.usedCount} / {voucher.maxUses}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Valid Until</p>
                    <p className="text-white font-semibold">{new Date(voucher.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="mb-4">
                  <div className="w-full bg-[#3a3447] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#8655f6] to-[#d946ef] h-2 rounded-full transition-all"
                      style={{ width: `${(voucher.usedCount / voucher.maxUses) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Additional Info */}
                {voucher.minimumPrice && (
                  <div className="text-sm text-gray-400 mb-4">
                    Minimum order: {voucher.minimumPrice.toLocaleString()} đ
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(voucher)}
                    className="flex-1 px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(voucher.id)}
                    className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Voucher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-20">
          <div className="bg-[#1e1828] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#3a3447]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Voucher Code</label>
                <input
                  type="text"
                  placeholder="e.g., SUMMER50"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  value={form.code}
                  onChange={(e) => handleFormChange('code', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Describe this voucher"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange('description', e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    value={form.discountType}
                    onChange={(e) =>
                      handleFormChange(
                        'discountType',
                        e.target.value as VoucherFormState['discountType'],
                      )
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Value</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    value={form.discountValue}
                    onChange={(e) =>
                      handleFormChange('discountValue', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Uses</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    value={form.maxUses}
                    onChange={(e) =>
                      handleFormChange('maxUses', e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    value={form.endDate}
                    onChange={(e) =>
                      handleFormChange('endDate', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  value={form.status}
                  onChange={(e) =>
                    handleFormChange(
                      'status',
                      e.target.value as VoucherFormState['status'],
                    )
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Disabled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Order (Optional)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  value={form.minimumPrice}
                  onChange={(e) =>
                    handleFormChange('minimumPrice', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#3a3447] flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-[#3a3447] hover:bg-[#3a3447]/80 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
              >
                {saving
                  ? 'Saving...'
                  : editingVoucher
                  ? 'Update'
                  : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
