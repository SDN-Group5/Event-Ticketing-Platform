import React, { useState, useEffect } from 'react';

interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  minimumPrice?: number;
  status: 'active' | 'inactive' | 'expired';
}

export const ManageVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    // TODO: Fetch vouchers from API
    // const fetchVouchers = async () => {
    //   try {
    //     const response = await fetch('/api/organizer/vouchers');
    //     const data = await response.json();
    //     setVouchers(data);
    //   } catch (error) {
    //     console.error('Error fetching vouchers:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchVouchers();

    // Mock data
    setVouchers([
      {
        id: '1',
        code: 'SUMMER50',
        description: '50% off summer events',
        discountType: 'percentage',
        discountValue: 50,
        maxUses: 100,
        usedCount: 45,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        status: 'active',
      },
      {
        id: '2',
        code: 'FLAT100K',
        description: 'Flat 100K discount',
        discountType: 'fixed',
        discountValue: 100000,
        maxUses: 200,
        usedCount: 180,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minimumPrice: 500000,
        status: 'active',
      },
      {
        id: '3',
        code: 'OLDCODE',
        description: 'Expired voucher',
        discountType: 'percentage',
        discountValue: 20,
        maxUses: 50,
        usedCount: 50,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: 'expired',
      },
    ]);
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      setVouchers(vouchers.filter(v => v.id !== id));
      // TODO: Call API to delete voucher
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingVoucher(null);
    setShowModal(true);
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-xl tracking-wide">{voucher.code}</h3>
                    <p className="text-white/80 text-sm mt-1">{voucher.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(voucher.status)}`}>
                    {voucher.status.toUpperCase()}
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
              {/* Form Fields */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Voucher Code</label>
                <input
                  type="text"
                  placeholder="e.g., SUMMER50"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  defaultValue={editingVoucher?.code}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Describe this voucher"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  defaultValue={editingVoucher?.description}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Value</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    defaultValue={editingVoucher?.discountValue}
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
                    defaultValue={editingVoucher?.maxUses}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    defaultValue={editingVoucher?.endDate}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Order (Optional)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  defaultValue={editingVoucher?.minimumPrice}
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
                onClick={() => {
                  setShowModal(false);
                  // TODO: Call API to create/update voucher
                }}
                className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
              >
                {editingVoucher ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
