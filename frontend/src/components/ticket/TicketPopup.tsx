import React from 'react';

export interface TicketPopupData {
  id: string;
  eventName: string;
  date: string;
  location?: string;
  zone: string;
  seatNumber: string;
  ticketCode: string;
  /** Row (hàng) - optional, hiển thị "—" nếu không có */
  row?: string;
}

interface TicketPopupProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketPopupData | null;
}

/** Format date "YYYY-MM-DD" → "2 MAR | 20:00" (time placeholder nếu không có) */
function formatEventDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ');
    const month = months[d.getMonth()];
    return `${day} ${month} | 20:00`;
  } catch {
    return dateStr;
  }
}

export const TicketPopup: React.FC<TicketPopupProps> = ({ isOpen, onClose, ticket }) => {
  if (!isOpen) return null;

  const fullName = ticket?.eventName || '—';
  const nameParts = fullName.split(' ');
  const highlightWord = nameParts.length > 1 ? nameParts.pop() as string : '';
  const baseTitle = nameParts.join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-[1000px] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
        role="dialog"
        aria-modal="true"
        aria-label="Vé sự kiện"
      >
        {/* Ticket layout: stub (trái) + main (phải) */}
        <div className="flex min-h-[300px]">
          {/* Phần cuống vé (stub) - nền hồng */}
          <div className="w-[130px] flex-shrink-0 bg-gradient-to-b from-[#ff4fa3] via-[#f4307c] to-[#f97373] flex flex-col justify-between py-6 pl-5 pr-4 rounded-l-3xl border-r-2 border-dashed border-white/40">
            <div className="space-y-1">
              <p className="text-white/80 text-[9px] uppercase tracking-[0.18em] font-semibold">
                {fullName.toUpperCase().slice(0, 20)}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-white font-bold text-sm leading-tight">
                {ticket?.eventName?.slice(0, 16) || '—'}
              </p>
              <p className="text-white text-xs font-medium tracking-wide">
                {ticket ? formatEventDateTime(ticket.date) : '—'}
              </p>
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="bg-white/15 rounded-md border border-white/40 px-2 py-1.5">
                  <p className="text-white/80 text-[9px] uppercase">Gate</p>
                  <p className="text-white font-semibold text-xs">{ticket?.zone?.slice(0, 4) || '—'}</p>
                </div>
                <div className="bg-white/15 rounded-md border border-white/40 px-2 py-1.5">
                  <p className="text-white/80 text-[9px] uppercase">Row</p>
                  <p className="text-white font-semibold text-xs">{ticket?.row || '—'}</p>
                </div>
                <div className="bg-white/15 rounded-md border border-white/40 px-2 py-1.5">
                  <p className="text-white/80 text-[9px] uppercase">Seat</p>
                  <p className="text-white font-semibold text-xs">{ticket?.seatNumber || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phần vé chính - nền xanh tím + QR lớn bên phải */}
          <div className="flex-1 min-w-0 relative bg-gradient-to-br from-[#1b1235] via-[#110d25] to-[#1b1030] rounded-r-3xl overflow-hidden">
            {/* Bokeh effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-[#7c3aed]/45 blur-3xl" />
              <div className="absolute bottom-0 left-[-40px] w-40 h-40 rounded-full bg-[#ec4899]/30 blur-3xl" />
              <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-[#22d3ee]/30 blur-2xl" />
            </div>

            <div className="relative p-5 flex h-full gap-6">
              {/* Thông tin bên trái */}
              <div className="flex-1 flex flex-col">
                <p className="text-white/70 text-[10px] uppercase tracking-[0.18em] mb-1">
                  {fullName.toUpperCase().slice(0, 26)}
                </p>
                <h2 className="text-white font-bold text-lg leading-tight mb-2">
                  <span className="text-white">{baseTitle}</span>
                  {highlightWord && <span className="text-[#ff4fa3]"> {highlightWord}</span>}
                </h2>
                <p className="text-white/90 text-sm mb-5">
                  {ticket ? formatEventDateTime(ticket.date) : '—'}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-3 max-w-md">
                  <div className="bg-white/10 rounded-xl border border-white/25 px-3 py-2 text-center">
                    <p className="text-white/70 text-[9px] uppercase mb-0.5">Gate</p>
                    <p className="text-white font-semibold text-sm">{ticket?.zone?.slice(0, 4) || '—'}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl border border-white/25 px-3 py-2 text-center">
                    <p className="text-white/70 text-[9px] uppercase mb-0.5">Row</p>
                    <p className="text-white font-semibold text-sm">{ticket?.row || '—'}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl border border-white/25 px-3 py-2 text-center">
                    <p className="text-white/70 text-[9px] uppercase mb-0.5">Seat</p>
                    <p className="text-white font-semibold text-sm">{ticket?.seatNumber || '—'}</p>
                  </div>
                </div>

                <p className="text-xs text-white/60 mt-2">
                  Powered by <span className="font-semibold text-[#a855f7]">TicketVibe</span>
                </p>
              </div>

              {/* QR lớn bên phải */}
              <div className="flex items-center justify-center">
                <div className="bg-white p-4 rounded-3xl shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket?.ticketCode || '')}`}
                    alt="QR Code vé"
                    className="w-40 h-40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nút đóng - mobile friendly */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
};
