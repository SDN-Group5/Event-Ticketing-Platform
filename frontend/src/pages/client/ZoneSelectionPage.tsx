import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventLayoutViewer, PanoramaViewer } from '../../components/seats';
import { Seat as SeatType, SelectedSeat } from '../../types/seat';
import { LayoutAPI } from '../../services/layoutApiService';
import { SeatAPI, SeatData } from '../../services/seatApiService';
import { PaymentAPI } from '../../services/paymentApiService';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import eventsData from '../../data/events';
import { Zone360Viewer } from '../../components/Zone360Viewer';
import { io, Socket } from 'socket.io-client';

export const ZoneSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [ticketCount, setTicketCount] = useState(2);
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [previewSeat, setPreviewSeat] = useState<SeatType | null>(null);
    const [is360ViewerOpen, setIs360ViewerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [layoutData, setLayoutData] = useState<any>(null);
    const [seatsData, setSeatsData] = useState<SeatData[]>([]);
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherError, setVoucherError] = useState<string | null>(null);
    const [agreePreviewTerms, setAgreePreviewTerms] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // countdown (seconds)
    const [openPolicy, setOpenPolicy] = useState<'terms' | null>(null);
    const [showPaymentWaiting, setShowPaymentWaiting] = useState(false);
    const [paymentCheckoutUrl, setPaymentCheckoutUrl] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Load event data
    const event = useMemo(() => eventsData.find(e => e.id === id), [id]);

    // Fetch layout and seats from MongoDB
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch layout from MongoDB
                const layout = await LayoutAPI.getLayout(id);
                setLayoutData(layout);

                // Fetch seats for all zones
                const zoneIds = layout.zones
                    .filter((z: any) => z.type === 'seats' || z.type === 'standing')
                    .map((z: any) => z.id);

                if (zoneIds.length > 0) {
                    const seats = await SeatAPI.getAllSeatsForEvent(id, zoneIds);
                    setSeatsData(seats);
                }
            } catch (err) {
                console.error('Error fetching layout/seats:', err);
                setError('Failed to load event layout. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // WebSocket: realtime seat updates
    useEffect(() => {
        if (!id) return;

        const socket = io('http://localhost:4002', { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join-event', id);
        });

        socket.on('seats-updated', (payload: { eventId: string; seats: Array<{ zoneId: string; row: number; seatNumber: number; status: string; reservedBy?: string }> }) => {
            if (payload.eventId !== id) return;
            setSeatsData(prev => {
                const updated = [...prev];
                for (const change of payload.seats) {
                    const idx = updated.findIndex(
                        s => s.zoneId === change.zoneId && s.row === change.row && s.seatNumber === change.seatNumber,
                    );
                    if (idx !== -1) {
                        updated[idx] = { ...updated[idx], status: change.status as SeatData['status'], reservedBy: change.reservedBy };
                    }
                }
                return updated;
            });

            // Chỉ bỏ ghế nếu bị NGƯỜI KHÁC lock (không phải mình)
            const currentUserId = user?.id;
            setSelectedSeats(prev => {
                return prev.filter(sel => {
                    const parts = String(sel.id).split('-');
                    const seatNum = Number(parts.pop());
                    const rowNum = Number(parts.pop());
                    const zId = parts.join('-');
                    const conflict = payload.seats.find(
                        c => c.zoneId === zId && c.row === rowNum && c.seatNumber === seatNum
                            && c.status !== 'available'
                            && c.reservedBy !== currentUserId,
                    );
                    return !conflict;
                });
            });
        });

        return () => {
            socket.emit('leave-event', id);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [id]);

    // Transform layout zones for the viewer
    const zones = useMemo(() => {
        if (!layoutData) return [];

        return layoutData.zones
            .filter((zone: any) => zone.type === 'seats' || zone.type === 'standing' || zone.type === 'stage')
            .map((zone: any) => ({
                id: zone.id,
                name: zone.name,
                type: zone.type,
                price: zone.price || 0,
                color: zone.color,
                rows: zone.rows || 1,
                seatsPerRow: zone.seatsPerRow || 1,
                position: zone.position,
                size: zone.size,
                rotation: zone.rotation || 0,
                view360Url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg'
            }));
    }, [layoutData]);

    const total = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }, [selectedSeats]);

    const selectedZoneData = useMemo(() => {
        if (selectedSeats.length > 0) {
            const lastSeat = selectedSeats[selectedSeats.length - 1];
            return zones.find(z => z.name === lastSeat.zone);
        }
        return zones[0];
    }, [selectedSeats, zones]);

    // Chọn / bỏ chọn ghế chỉ xử lý trên UI.
    // Không đụng đến DB; DB chỉ lock ghế khi tạo thanh toán.
    const handleSeatToggle = (seat: SelectedSeat) => {
        setVoucherError(null);
        setError(null);

        setSelectedSeats(prev => {
            const exists = prev.find(s => s.id === seat.id);
            if (exists) {
                // Bỏ chọn
                return prev.filter(s => s.id !== seat.id);
            }
            // Chọn thêm
            return [...prev, seat];
        });
    };

    // Đếm ngược 5 phút khi đang chờ thanh toán PayOS
    useEffect(() => {
        if (!showPaymentWaiting) {
            setTimeLeft(null);
            return;
        }

        setTimeLeft(300);
        const intervalId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null) return prev;
                if (prev <= 1) {
                    clearInterval(intervalId);
                    setShowPaymentWaiting(false);
                    setPaymentCheckoutUrl(null);
                    setSelectedSeats([]);
                    setError('Hết thời gian giữ ghế (5 phút). Ghế đã được trả lại. Vui lòng chọn lại.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [showPaymentWaiting]);

    const handleConfirmPayment = useCallback(async () => {
        if (!id || isProcessingPayment) return;

        if (selectedSeats.length === 0) {
            setVoucherError('Vui lòng chọn ít nhất 1 ghế trước khi thanh toán.');
            return;
        }

        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }

        // Bắt user tick ô điều khoản ở thanh dưới trước khi tạo thanh toán
        if (!agreePreviewTerms) {
            setVoucherError('Vui lòng tick vào điều khoản trước khi tiếp tục.');
            return;
        }

        setVoucherError(null);

        const items = selectedSeats.map(seat => {
            const seatZone = zones.find(z => z.name === seat.zone) || zones[0];
            return {
                zoneName: seat.zone,
                seatId: seat.id,
                price: seatZone ? seatZone.price : seat.price,
                quantity: 1,
            };
        });

        try {
            setIsProcessingPayment(true);

            // 1) Reserve tất cả ghế trong DB (lock) trước khi tạo payment
            const reserveResults: boolean[] = [];
            for (const seat of selectedSeats) {
                const parts = String(seat.id).split('-');
                const seatNumber = Number(parts.pop());
                const rowNumber = Number(parts.pop());
                const zoneId = parts.join('-');
                try {
                    await SeatAPI.reserveSeat(id, zoneId, rowNumber, seatNumber);
                    reserveResults.push(true);
                } catch (err: any) {
                    console.error('Reserve failed for', seat.id, err?.response?.data);
                    reserveResults.push(false);
                }
            }

            const failedCount = reserveResults.filter(r => !r).length;
            if (failedCount > 0) {
                setVoucherError(`${failedCount} ghế đã bị người khác giữ/mua. Vui lòng chọn lại.`);
                setIsProcessingPayment(false);
                return;
            }

            // 2) Tạo payment (ghế đã locked trong DB)
            await PaymentAPI.createPayment({
                userId: user.id,
                eventId: id,
                eventName: event?.title || layoutData?.eventName || 'Event',
                organizerId: layoutData?.organizerId || event?.organizerId || 'unknown',
                items,
                voucherCode: voucherCode.trim() || undefined,
            });

            // 3) Luôn mở trang thanh toán PayOS CỐ ĐỊNH do bạn cung cấp
            window.open(FIXED_PAYOS_CHECKOUT_URL, '_blank');
            setPaymentCheckoutUrl(FIXED_PAYOS_CHECKOUT_URL);
            setShowPaymentWaiting(true);
        } catch (err: any) {
            console.error('Error creating payment from ZoneSelectionPage:', err);
            const msg = err?.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.';
            setVoucherError(msg);
        } finally {
            setIsProcessingPayment(false);
        }
    }, [
        id,
        selectedSeats,
        user,
        isProcessingPayment,
        agreePreviewTerms,
        zones,
        event,
        layoutData,
        voucherCode,
    ]);

    const handleOpen360 = () => {
        navigate(`/event/${id}/venue-3d`);
    };

    return (
        <div className="min-h-screen bg-[#151022] text-white p-6 flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(ROUTES.HOME)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black">Select Your Seats</h1>
                        <p className="text-[#a59cba]">
                            {event?.title} • {event?.location}
                        </p>
                    </div>
                </div>
            </header>

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-xl">Loading seat map...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 max-w-md">
                        <p className="text-xl font-bold mb-2">⚠️ Error</p>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content: Unified Layout Viewer */}
            {!loading && !error && (
                <div className="flex-1 bg-[#1e1a29] rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center mb-36">
                    <EventLayoutViewer
                        zones={zones}
                        seats={seatsData}
                        selectedSeats={selectedSeats}
                        onSeatToggle={handleSeatToggle}
                        currentUserId={user?.id}
                    />
                </div>
            )}

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[#151022]/90 backdrop-blur border-t border-white/10 p-6 z-[150]">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-sm text-[#a59cba]">Selected:</span>
                            <span className="text-xl font-bold ml-2">{selectedSeats.length} seats</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="w-full md:w-auto">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                    className="w-full md:w-56 bg-[#201936] border border-[#3b3158] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8655f6]"
                                />
                                <span className="text-xs text-[#a59cba] hidden md:inline">
                                    (Áp dụng khi tạo thanh toán)
                                </span>
                            </div>
                            {voucherError && (
                                <p className="mt-1 text-xs text-red-400">{voucherError}</p>
                            )}
                            {/* Preview policy checkboxes (chính sách hiển thị ngay bước chọn ghế) */}
                            <div className="mt-3 space-y-2 text-xs text-[#a59cba]">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreePreviewTerms}
                                        onChange={(e) => setAgreePreviewTerms(e.target.checked)}
                                        className="mt-0.5 h-3.5 w-3.5 rounded border-gray-500 bg-transparent"
                                    />
                                    <span>
                                        Tôi đã đọc và đồng ý{' '}
                                        <button
                                            type="button"
                                            onClick={() => setOpenPolicy('terms')}
                                            className="font-semibold text-gray-200 underline underline-offset-2"
                                        >
                                            điều khoản
                                        </button>
                                        .
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="text-right">
                                <p className="text-xs text-[#a59cba] uppercase font-bold">Tạm tính</p>
                                <p className="text-2xl font-black">{total.toLocaleString()} đ</p>
                            </div>
                            <button
                                onClick={handleOpen360}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-4 md:px-6 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2 text-sm md:text-base"
                            >
                                <span className="material-symbols-outlined">360</span>
                                View 360°
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={selectedSeats.length === 0}
                                className={`font-bold py-3 px-6 md:px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm md:text-base ${selectedSeats.length > 0
                                    ? 'bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white hover:brightness-110'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                <span>Tiếp tục thanh toán</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 360 Viewer Modal */}
            <Zone360Viewer
                imageUrl={selectedZoneData?.view360Url || ''}
                isOpen={is360ViewerOpen}
                onClose={() => setIs360ViewerOpen(false)}
                zoneName={selectedZoneData ? `${selectedZoneData.name} (${selectedZoneData.type})` : ''}
            />

            {/* Trang chờ thanh toán PayOS - đếm ngược 5 phút */}
            {showPaymentWaiting && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
                    <div className="bg-[#1e1828] border border-[#3a3447] rounded-2xl w-full max-w-md text-center p-8">
                        <div className="mb-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-amber-400">hourglass_top</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Đang chờ thanh toán</h2>
                            <p className="text-sm text-gray-400">
                                Ghế của bạn đã được giữ. Vui lòng hoàn tất thanh toán trên trang PayOS.
                            </p>
                        </div>

                        {timeLeft !== null && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Thời gian còn lại</p>
                                <p className={`text-5xl font-mono font-black ${timeLeft <= 60 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                                </p>
                                <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-1000 ${timeLeft <= 60 ? 'bg-red-500' : 'bg-amber-400'}`}
                                        style={{ width: `${((timeLeft) / 300) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-[#261b3a] rounded-xl p-4 border border-[#3a3447] mb-6 text-left">
                            <p className="text-sm font-semibold text-white mb-1">
                                {event?.title || layoutData?.eventName || 'Event'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {selectedSeats.length} ghế · Tổng: <span className="font-semibold text-white">{total.toLocaleString()} đ</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {paymentCheckoutUrl && (
                                <a
                                    href={paymentCheckoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-gradient-to-r from-[#8655f6] to-[#a855f7] text-white font-bold py-3 px-6 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">open_in_new</span>
                                    Mở lại trang thanh toán
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    setShowPaymentWaiting(false);
                                    setPaymentCheckoutUrl(null);
                                    setSelectedSeats([]);
                                    setError(null);
                                }}
                                className="w-full bg-[#3a3447] text-gray-200 font-medium py-3 px-6 rounded-xl hover:bg-[#4a3e5a] transition-all"
                            >
                                Huỷ & chọn lại ghế
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Policy doc modal (điều khoản & bảo mật) */}
            {openPolicy && (
                <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="bg-[#1e1828] border border-[#3a3447] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-[#3a3447] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">
                                Điều khoản thanh toán, huỷ / đổi vé & bảo mật
                            </h2>
                            <button
                                onClick={() => setOpenPolicy(null)}
                                className="p-1 rounded-full hover:bg-white/10 text-gray-400"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-sm text-gray-200">
                            <p>
                                Các điều khoản dưới đây mô tả quy định về việc thanh toán, huỷ/đổi vé và bảo mật dữ
                                liệu khách hàng. Vui lòng{' '}
                                <span className="font-semibold text-white">đọc kỹ trước khi tiếp tục</span>.
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                <li>
                                    Vé đã thanh toán chỉ có thể huỷ theo{' '}
                                    <span className="font-semibold text-emerald-300">
                                        chính sách riêng của ban tổ chức
                                    </span>.
                                </li>
                                <li>
                                    Khi sử dụng chức năng{' '}
                                    <span className="font-semibold text-emerald-300">
                                        huỷ vé (nhận voucher)
                                    </span>
                                    , bạn sẽ{' '}
                                    <span className="font-semibold text-red-300">
                                        không được hoàn tiền
                                    </span>
                                    , thay vào đó hệ thống sẽ cấp một{' '}
                                    <span className="font-semibold text-emerald-300">
                                        voucher giảm giá (hiện tại: 50% giá trị đơn)
                                    </span>
                                    .
                                </li>
                                <li>
                                    Sau khi huỷ, vé sẽ{' '}
                                    <span className="font-semibold text-red-300">
                                        mất hiệu lực vĩnh viễn
                                    </span>{' '}
                                    và ghế sẽ được trả về trạng thái trống để người khác có thể mua.
                                </li>
                                <li>
                                    Voucher có{' '}
                                    <span className="font-semibold text-amber-300">
                                        thời hạn sử dụng và điều kiện áp dụng riêng
                                    </span>{' '}
                                    (ví dụ: thời hạn 30 ngày, áp dụng cho một số sự kiện/đơn tối thiểu).
                                </li>
                                <li>
                                    Chúng tôi{' '}
                                    <span className="font-semibold text-emerald-300">
                                        cam kết bảo vệ thông tin cá nhân của bạn
                                    </span>{' '}
                                    và chỉ sử dụng cho mục đích vận hành hệ thống đặt vé.
                                </li>
                                <li>
                                    Thông tin của bạn chỉ được chia sẻ cho{' '}
                                    <span className="font-semibold text-emerald-300">
                                        đối tác thanh toán và đơn vị tổ chức sự kiện
                                    </span>{' '}
                                    liên quan, nhằm phục vụ việc xác nhận vé và hỗ trợ khách hàng.
                                </li>
                                <li>
                                    Chúng tôi{' '}
                                    <span className="font-semibold text-emerald-300">
                                        không bán hoặc cho thuê dữ liệu cá nhân
                                    </span>{' '}
                                    của bạn cho bên thứ ba vì mục đích quảng cáo trái phép.
                                </li>
                            </ul>
                        </div>

                        <div className="p-5 border-t border-[#3a3447] flex justify-end">
                            <button
                                type="button"
                                onClick={() => setOpenPolicy(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#3a3447] text-gray-200 hover:bg-[#4a3e5a]"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
