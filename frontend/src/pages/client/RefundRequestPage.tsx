import React, { useState, useEffect } from 'react';

interface RefundRequest {
  id: string;
  ticketCode: string;
  eventName: string;
  originalPrice: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  processDate?: string;
}

export const RefundRequestPage: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');

  useEffect(() => {
    // TODO: Fetch refund requests from API
    // const fetchRefunds = async () => {
    //   try {
    //     const response = await fetch('/api/refund-requests');
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
        ticketCode: 'TICKET123456',
        eventName: 'Concert A',
        originalPrice: 500000,
        refundAmount: 300000,
        reason: 'Unable to attend',
        status: 'pending',
        requestDate: '2024-01-15',
      },
      {
        id: '2',
        ticketCode: 'TICKET789012',
        eventName: 'Sports Event B',
        originalPrice: 300000,
        refundAmount: 300000,
        reason: 'Event cancelled',
        status: 'completed',
        requestDate: '2024-01-10',
        processDate: '2024-01-12',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredRefunds = refunds.filter(refund => {
    if (filter === 'all') return true;
    return refund.status === filter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'approved':
        return 'bg-blue-500/20 text-blue-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'approved':
        return 'thumb_up';
      case 'rejected':
        return 'thumb_down';
      case 'completed':
        return 'check_circle';
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

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Refund Requests</h1>
        <p className="text-gray-400">Track your refund requests and status</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-blue-400">info</span>
          <div>
            <p className="text-blue-400 font-semibold text-sm">Refund Policy</p>
            <p className="text-blue-300/80 text-xs mt-1">
              Refunds can be requested within 36 hours before the event. A service fee of 40% will be deducted.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'pending', 'approved', 'rejected', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredRefunds.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">undo</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No refund requests</h2>
          <p className="text-gray-500">You haven't made any refund requests yet.</p>
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
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{refund.eventName}</h3>
                        <p className="text-gray-500 text-sm mt-1">Ticket: {refund.ticketCode}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 flex-shrink-0 ${getStatusBadgeColor(refund.status)}`}>
                        <span className="material-symbols-outlined text-sm">{getStatusIcon(refund.status)}</span>
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Original Price</p>
                        <p className="text-white font-semibold">{refund.originalPrice.toLocaleString()} đ</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Refund Amount</p>
                        <p className="text-green-400 font-semibold">{refund.refundAmount.toLocaleString()} đ</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Reason</p>
                        <p className="text-white font-semibold">{refund.reason}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Request Date</p>
                        <p className="text-white font-semibold">{new Date(refund.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {refund.processDate && (
                      <div className="mt-3 pt-3 border-t border-[#3a3447]">
                        <p className="text-gray-500 text-xs">Process Date: {new Date(refund.processDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {refund.status === 'pending' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg text-sm transition-colors">
                        Cancel Request
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
