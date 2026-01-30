import React, { useState, useEffect } from 'react';

interface OrganizerPayout {
  id: string;
  organizerName: string;
  eventName: string;
  totalGross: number;
  platformFee: number;
  netPayout: number;
  eventStatus: 'completed' | 'cancelled';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  eventEndDate: string;
}

export const OrganizerPayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<OrganizerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // TODO: Fetch organizer payouts from API
    // const fetchPayouts = async () => {
    //   try {
    //     const response = await fetch('/api/admin/organizer-payouts');
    //     const data = await response.json();
    //     setPayouts(data);
    //   } catch (error) {
    //     console.error('Error fetching payouts:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchPayouts();

    // Mock data - Organizer Payouts
    setPayouts([
      {
        id: '88210',
        organizerName: 'Lumina Productions',
        eventName: 'Neon Horizon Music Festival',
        totalGross: 124500000,
        platformFee: 15562500,
        netPayout: 108937500,
        eventStatus: 'completed',
        status: 'pending',
        requestDate: '2024-07-23',
        eventEndDate: '2024-07-22',
      },
      {
        id: '88211',
        organizerName: 'InnoVentures Group',
        eventName: 'Tech Summit 2024',
        totalGross: 45200000,
        platformFee: 5650000,
        netPayout: 39550000,
        eventStatus: 'completed',
        status: 'pending',
        requestDate: '2024-08-11',
        eventEndDate: '2024-08-10',
      },
      {
        id: '88215',
        organizerName: 'Blue Note Collective',
        eventName: 'Midnight Jazz Session',
        totalGross: 12850000,
        platformFee: 1606250,
        netPayout: 11243750,
        eventStatus: 'completed',
        status: 'pending',
        requestDate: '2024-07-01',
        eventEndDate: '2024-06-30',
      },
      {
        id: '88219',
        organizerName: 'Taste of City Hub',
        eventName: 'Gourmet Food Expo',
        totalGross: 8450000,
        platformFee: 1056250,
        netPayout: 7393750,
        eventStatus: 'completed',
        status: 'pending',
        requestDate: '2024-09-13',
        eventEndDate: '2024-09-12',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredPayouts = payouts.filter(payout => {
    const matchesStatus = payout.status === filter;
    const matchesSearch = searchQuery === '' || 
      payout.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApprove = (id: string) => {
    setPayouts(payouts.map(p =>
      p.id === id ? { ...p, status: 'approved' } : p
    ));
  };

  const handleReject = (id: string) => {
    setPayouts(payouts.map(p =>
      p.id === id ? { ...p, status: 'rejected' } : p
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'hourglass_top';
      case 'approved':
        return 'check_circle';
      case 'rejected':
        return 'close';
      default:
        return 'info';
    }
  };

  const formatCurrency = (amount: number) => {
    // Format VND với dấu phẩy
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  const totalPaidOut = payouts
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.netPayout, 0);

  const pendingCount = payouts.filter(p => p.status === 'pending').length;
  const approvedCount = payouts.filter(p => p.status === 'approved').length;
  const avgProcessingTime = '1.5 Days';

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Organizer Payouts</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
            <input
              type="text"
              placeholder="Search payouts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-sm w-64 focus:ring-2 focus:ring-[#d946ef] focus:border-[#d946ef] transition-all text-slate-200"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Total Paid out (MTD)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-400 text-sm">payments</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-100">{formatCurrency(totalPaidOut)}</h3>
            <span className="text-emerald-400 text-xs font-medium">+{approvedCount}</span>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Pending Payout Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-400 text-sm">hourglass_top</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-100">{pendingCount}</h3>
            <span className="text-slate-500 text-xs font-medium">Active</span>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Avg. Processing Time</span>
            <div className="w-8 h-8 rounded-lg bg-[#d946ef]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#d946ef] text-sm">schedule</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-100">{avgProcessingTime}</h3>
            <span className="text-[#d946ef] text-xs font-medium">-4h</span>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Service Fee Rate</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-pink-500 text-sm">account_balance</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold text-slate-100">12.5%</h3>
            <span className="text-slate-500 text-xs font-medium">Avg. Fee</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-slate-100">Pending Settlement Requests</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#d946ef]/10 text-[#d946ef] text-xs font-bold tracking-wider uppercase border border-[#d946ef]/20 font-sans">
              Needs Review
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center space-x-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span>Filter</span>
            </button>
            <div className="flex gap-2">
              {(['pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors font-sans ${
                    filter === status
                      ? 'bg-[#d946ef]/20 text-[#d946ef] border border-[#d946ef]/30'
                      : 'text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20">
              <span className="material-symbols-outlined text-sm">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {paginatedPayouts.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">account_balance_wallet</span>
            <h2 className="text-xl font-semibold text-slate-400 mb-2">No payout requests</h2>
            <p className="text-slate-500">
              {filter === 'pending' ? 'No pending payout requests.' : `No ${filter} payouts to show.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">
                      <input className="rounded text-[#d946ef] focus:ring-[#d946ef] bg-slate-800 border-slate-700" type="checkbox" />
                    </th>
                    <th className="px-6 py-4 font-semibold">Payout ID</th>
                    <th className="px-6 py-4 font-semibold">Event Details</th>
                    <th className="px-6 py-4 font-semibold">Organizer</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Gross</th>
                    <th className="px-6 py-4 font-semibold text-right">Platform Fee</th>
                    <th className="px-6 py-4 font-semibold text-right">Net Payout</th>
                    <th className="px-6 py-4 font-semibold text-center">Event Status</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {paginatedPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <input className="rounded text-[#d946ef] focus:ring-[#d946ef] bg-slate-800 border-slate-700" type="checkbox" />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500 uppercase">#PO-{payout.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-100">{payout.eventName}</p>
                          <p className="text-xs text-slate-500">Ended {formatDate(payout.eventEndDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{payout.organizerName}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-200">{formatCurrency(payout.totalGross)}</td>
                      <td className="px-6 py-4 text-right text-pink-500/80">-{formatCurrency(payout.platformFee)}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#d946ef]">{formatCurrency(payout.netPayout)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center space-x-1.5 text-slate-400">
                          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                          <span className="font-sans">Completed</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border font-sans ${getStatusColor(payout.status)}`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payout.status === 'pending' && (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(payout.id)}
                              className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                              title="Approve Payout"
                            >
                              <span className="material-symbols-outlined text-lg leading-none">check</span>
                            </button>
                            <button
                              onClick={() => handleReject(payout.id)}
                              className="p-1.5 rounded bg-slate-800 text-slate-500 hover:bg-red-500/20 hover:text-red-500 transition-all"
                              title="Reject Payout"
                            >
                              <span className="material-symbols-outlined text-lg leading-none">close</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                Showing {paginatedPayouts.length} of {filteredPayouts.length} pending requests
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  let page;
                  if (totalPages <= 3) {
                    page = i + 1;
                  } else if (currentPage === 1) {
                    page = i + 1;
                  } else if (currentPage === totalPages) {
                    page = totalPages - 2 + i;
                  } else {
                    page = currentPage - 1 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-bold transition-colors ${
                        currentPage === page
                          ? 'bg-[#d946ef] text-white border-[#d946ef] shadow-lg shadow-[#d946ef]/20'
                          : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <div className="bg-[#d946ef]/5 border border-[#d946ef]/20 p-6 rounded-xl flex items-start space-x-4">
          <div className="p-3 bg-[#d946ef]/20 rounded-lg">
            <span className="material-symbols-outlined text-[#d946ef]">account_balance</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Settlement Policy</h4>
            <p className="text-sm text-slate-400 mt-1">
              Payouts are typically processed 48-72 hours after event completion. All amounts are net of platform commission and standard transaction fees.
            </p>
            <a className="inline-block mt-3 text-sm text-[#d946ef] font-semibold hover:text-pink-400 transition-colors" href="#">
              View Fee Structure Details
            </a>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl">
          <h4 className="font-bold text-slate-100 mb-4">Payout Volume Trends</h4>
          <div className="h-24 flex items-end justify-between px-2 gap-1.5">
            {[40, 60, 90, 50, 70, 30, 45, 65, 80, 40, 20, 55].map((height, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t transition-all ${
                  index === 2 ? 'bg-gradient-to-t from-[#a855f7] to-[#d946ef] shadow-lg shadow-[#d946ef]/10' : 'bg-[#d946ef]/20'
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest font-bold">Last 12 Days Activity</p>
        </div>
      </div>
    </div>
  );
};
