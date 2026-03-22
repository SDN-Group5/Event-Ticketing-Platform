import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnalyticsAPI } from '../../services/analyticsApiService';
import { EventApprovalAPI } from '../../services/eventApprovalApiService';
import { LayoutAPI } from '../../services/layoutApiService';
import { useToast } from '../../components/common/ToastProvider';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

/** Đánh dấu tất cả orders của sự kiện là payout success trong payment-service */
async function markPaymentServicePayoutSuccess(eventId: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  await axios.patch(
    `${API_BASE}/api/payments/admin/payout-event/${eventId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

interface EventRevenue {
    _id: string; // eventId
    eventName: string;
    organizerId: string;
    ticketsSold: number;
    totalRevenue: number;
    totalSubtotal: number;
    totalCommission: number;
    totalOrganizerAmount: number;
    payoutStatus?: string; // We might need to fetch this from layout service or merge data later, but for now we assume unpaid if it's in this list, or we add it to payment service response
}

export const PayoutsPage: React.FC = () => {
    const [revenues, setRevenues] = useState<EventRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventRevenue | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [sendEmail, setSendEmail] = useState(true);
    const [processingPayout, setProcessingPayout] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        fetchRevenues();
    }, []);

    const fetchRevenues = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Lấy sự kiện đã hoàn thành từ layout service (nếu có)
            let eventIdsParam: string | undefined;
            try {
                const completedLayouts = await LayoutAPI.getCompletedLayouts();
                if (completedLayouts && completedLayouts.length > 0) {
                    eventIdsParam = completedLayouts.map(l => l.eventId).join(',');
                }
                // Nếu không có completed events → không lọc theo eventIds
                // để vẫn hiện tất cả sự kiện có đơn paid chưa payout
            } catch {
                // Layout service lỗi → fallback: lấy tất cả
            }

            // 2. Lấy doanh thu (có hoặc không có filter theo eventIds)
            const res = await AnalyticsAPI.getAdminEventRevenues({
                limit: 100,
                ...(eventIdsParam ? { eventIds: eventIdsParam } : {}),
            });

            if (res.success) {
                setRevenues(res.data);
            } else {
                setError('Không thể tải dữ liệu payout');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (evt: EventRevenue) => {
        setSelectedEvent(evt);
        setReceiptFile(null);
        setSendEmail(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setReceiptFile(null);
    };

    const handleProcessPayout = async () => {
        if (!selectedEvent) return;

        setProcessingPayout(true);
        try {
            // 1. Ghi nhận payout ở layout service (receipt, email thông báo)
            const res = await EventApprovalAPI.processPayout(selectedEvent._id, {
                amount: selectedEvent.totalOrganizerAmount,
                sendEmail,
                receipt: receiptFile || undefined
            });

            if (!res.success) {
                showToast(res.message || 'Failed to process payout', 'error');
                return;
            }

            // 2. Cập nhật payoutStatus orders trong payment service: pending → success
            try {
                await markPaymentServicePayoutSuccess(selectedEvent._id);
            } catch (paymentErr: any) {
                console.warn('[PayoutsPage] Không cập nhật được payoutStatus trong payment-service:', paymentErr?.message);
                // Không throw — vẫn coi là thành công về phía layout
            }

            showToast(`Đã thanh toán thành công cho sự kiện "${selectedEvent.eventName}"!`, 'success');
            handleCloseModal();
            setRevenues(revenues.filter(r => r._id !== selectedEvent._id));
        } catch (err: any) {
            showToast(err.message || 'Error processing payout', 'error');
        } finally {
            setProcessingPayout(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Calculate totals for KPIs
    const totalRevenue = revenues.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const totalOrganizerPayout = revenues.reduce((acc, curr) => acc + curr.totalOrganizerAmount, 0);
    const totalCommission = revenues.reduce((acc, curr) => acc + curr.totalCommission, 0);

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black mb-1">Payouts Dashboard</h1>
                    <p className="text-slate-400 font-medium">Manage organizer withdrawals and settlements.</p>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total App Revenue (Sales)', val: formatCurrency(totalRevenue), color: 'text-blue-400' },
                    { label: 'Organizers Cut (Pending)', val: formatCurrency(totalOrganizerPayout), color: 'text-amber-500' },
                    { label: 'Total Commission (Profit)', val: formatCurrency(totalCommission), color: 'text-emerald-400' },
                    { label: 'Events to Pay', val: revenues.length.toString(), color: 'text-slate-300' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700/40">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">{kpi.label}</p>
                        <p className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</p>
                    </div>
                ))}
            </div>

            {/* Payouts Table */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-slate-400">Loading payout data...</div>
                ) : error ? (
                    <div className="p-10 text-center text-red-400">{error}</div>
                ) : revenues.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">No events requiring payout at the moment.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-black/20 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="text-left py-4 px-6">Event Name</th>
                                    <th className="text-left py-4 px-6">Organizer ID</th>
                                    <th className="text-left py-4 px-6">Tickets Sold</th>
                                    <th className="text-left py-4 px-6">Total Sales</th>
                                    <th className="text-left py-4 px-6">App Cut</th>
                                    <th className="text-left py-4 px-6">Org. Payout</th>
                                    <th className="text-left py-4 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {revenues.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-700/20 group transition-colors">
                                        <td className="py-4 px-6 font-semibold max-w-[200px] truncate" title={row.eventName}>{row.eventName}</td>
                                        <td className="py-4 px-6 text-slate-400 text-sm max-w-[150px] truncate" title={row.organizerId}>{row.organizerId}</td>
                                        <td className="py-4 px-6 font-mono text-center">{row.ticketsSold}</td>
                                        <td className="py-4 px-6 text-blue-400 font-medium">{formatCurrency(row.totalRevenue)}</td>
                                        <td className="py-4 px-6 text-emerald-400 font-medium">{formatCurrency(row.totalCommission)}</td>
                                        <td className="py-4 px-6 font-bold text-[#d946ef] text-lg">{formatCurrency(row.totalOrganizerAmount)}</td>
                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleOpenModal(row)}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                                            >
                                                Process Payout
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payout Processing Modal */}
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white">Process Payout</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Summary Card */}
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="mb-4">
                                    <p className="text-sm text-slate-400 mb-1">Event</p>
                                    <p className="font-bold text-lg text-white">{selectedEvent.eventName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Tickets Sold</p>
                                        <p className="font-medium text-white">{selectedEvent.ticketsSold}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Organizer ID</p>
                                        <p className="font-medium text-white truncate" title={selectedEvent.organizerId}>{selectedEvent.organizerId}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <p className="text-sm text-slate-400 mb-1">Payout Amount</p>
                                    <p className="text-3xl font-black text-[#d946ef]">{formatCurrency(selectedEvent.totalOrganizerAmount)}</p>
                                </div>
                            </div>

                            {/* Receipt Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Upload Bank Transfer Receipt (Optional but recommended)
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-slate-800/50">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-slate-400 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 px-3 py-1">
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setReceiptFile(e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                                        {receiptFile && <p className="text-sm font-medium text-emerald-400 mt-2">Selected: {receiptFile.name}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Email Checkbox */}
                            <div className="flex items-center">
                                <input
                                    id="sendEmail"
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-[#a855f7] focus:ring-[#a855f7] focus:ring-offset-slate-900 cursor-pointer"
                                />
                                <label htmlFor="sendEmail" className="ml-3 block text-sm font-medium text-slate-300 cursor-pointer">
                                    Send email notification to organizer
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={processingPayout}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProcessPayout}
                                disabled={processingPayout}
                                className={`px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${processingPayout
                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#a855f7] to-[#d946ef] text-white hover:shadow-[#a855f7]/40'
                                    }`}
                            >
                                {processingPayout ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm & Mark as Paid'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
