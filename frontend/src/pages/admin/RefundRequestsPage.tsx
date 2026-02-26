import React, { useState, useEffect } from 'react';

interface RefundRequest {
  id: string;
  customerName: string;
  ticketCode: string;
  eventName: string;
  originalPrice: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  customerEmail: string;
  ticketDate: string;
}

export const RefundRequestsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  useEffect(() => {
    // TODO: Fetch refund requests from API
    // const fetchRefunds = async () => {
    //   try {
    //     const response = await fetch('/api/admin/refund-requests');
    //     const data = await response.json();
    //     setRefunds(data);
    //   } catch (error) {
    //     console.error('Error fetching refunds:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRefunds();

    // Mock data
    setRefunds([
      {
        id: '1',
        customerName: 'Nguyen Van A',
        ticketCode: 'TICKET123456',
        eventName: 'Concert A',
        originalPrice: 500000,
        refundAmount: 300000,
        reason: 'Unable to attend',
        status: 'pending',
        requestDate: '2024-01-29',
        customerEmail: 'nguyenvana@example.com',
        ticketDate: '2024-01-15',
      },
      {
        id: '2',
        customerName: 'Tran Thi B',
        ticketCode: 'TICKET789012',
        eventName: 'Sports Event B',
        originalPrice: 300000,
        refundAmount: 300000,
        reason: 'Event cancelled',
        status: 'approved',
        requestDate: '2024-01-28',
        customerEmail: 'tranthib@example.com',
        ticketDate: '2024-01-10',
      },
      {
        id: '3',
        customerName: 'Le Van C',
        ticketCode: 'TICKET345678',
        eventName: 'Workshop C',
        originalPrice: 200000,
        refundAmount: 120000,
        reason: 'Changed mind',
        status: 'rejected',
        requestDate: '2024-01-27',
        customerEmail: 'levanc@example.com',
        ticketDate: '2024-01-08',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredRefunds = refunds.filter(refund => refund.status === filter);

  const handleApprove = (id: string) => {
    setRefunds(refunds.map(r =>
      r.id === id ? { ...r, status: 'approved' } : r
    ));
    setSelectedRefund(null);
  };

  const handleReject = (id: string) => {
    setRefunds(refunds.map(r =>
      r.id === id ? { ...r, status: 'rejected' } : r
    ));
    setSelectedRefund(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'approved':
        return 'check_circle';
      case 'rejected':
        return 'cancel';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  const totalRefundAmount = refunds
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.refundAmount, 0);

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Refund Requests</h1>
        <p className="text-gray-400">Review and process customer refund requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#2a2436] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-2">Total Requests</p>
          <p className="text-white font-bold text-2xl">{refunds.length}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm mb-2">Pending</p>
          <p className="text-yellow-400 font-bold text-2xl">{refunds.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 text-sm mb-2">Total Refunded</p>
          <p className="text-green-400 font-bold text-lg">{(totalRefundAmount / 1000000).toFixed(1)}M đ</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['pending', 'approved', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === status
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({refunds.filter(r => r.status === status).length})
          </button>
        ))}
      </div>

      {filteredRefunds.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">undo</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No refund requests</h2>
          <p className="text-gray-500">
            {filter === 'pending' ? 'No pending refund requests.' : `No ${filter} refunds to show.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRefunds.map(refund => (
            <div
              key={refund.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">{refund.customerName}</h3>
                        <p className="text-gray-400 text-sm mt-1">{refund.eventName}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 flex-shrink-0 ${getStatusColor(refund.status)}`}>
                        <span className="material-symbols-outlined text-sm">{getStatusIcon(refund.status)}</span>
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Ticket Code</p>
                        <p className="text-white font-mono text-xs">{refund.ticketCode}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Original Price</p>
                        <p className="text-white font-semibold">{refund.originalPrice.toLocaleString()} đ</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Refund Amount</p>
                        <p className="text-green-400 font-semibold">{refund.refundAmount.toLocaleString()} đ</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Service Fee</p>
                        <p className="text-orange-400 font-semibold">{(refund.originalPrice - refund.refundAmount).toLocaleString()} đ</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Customer Email</p>
                        <p className="text-white font-semibold text-xs">{refund.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Request Date</p>
                        <p className="text-white font-semibold">{new Date(refund.requestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Ticket Date</p>
                        <p className="text-white font-semibold">{new Date(refund.ticketDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#3a3447] rounded-lg">
                      <p className="text-gray-400 text-sm font-semibold mb-1">Reason:</p>
                      <p className="text-gray-300 text-sm">{refund.reason}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {refund.status === 'pending' && (
                    <div className="w-full md:w-auto flex flex-col gap-2">
                      <button
                        onClick={() => handleApprove(refund.id)}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(refund.id)}
                        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
