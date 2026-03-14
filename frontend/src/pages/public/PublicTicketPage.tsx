import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

type PublicTicket = {
  ticketId: string;
  orderCode: number;
  eventId: string;
  eventName: string;
  zoneName: string;
  seatLabel?: string;
  price: number;
  status: string;
  qrCodePayload: string;
};

export default function PublicTicketPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!ticketId) {
        setError('Thiếu mã vé');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
        const res = await axios.get(`${API_BASE}/api/payments/tickets/public/${encodeURIComponent(ticketId)}`);
        if (!alive) return;
        setTicket(res.data?.data || null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Không tải được vé');
        setTicket(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [ticketId]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(1000px 600px at 20% 10%, rgba(213,0,249,0.20), transparent 60%), radial-gradient(900px 600px at 80% 30%, rgba(0,229,255,0.18), transparent 55%), #070010',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(26,0,51,0.85)',
          border: '1px solid rgba(77,0,153,0.6)',
          borderRadius: 24,
          boxShadow: '0 0 30px rgba(213,0,249,0.20)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 18, borderBottom: '1px solid rgba(77,0,153,0.45)' }}>
          <div style={{ fontWeight: 900, letterSpacing: 2, fontSize: 18 }}>EVENTIX</div>
          <div style={{ color: '#b388ff', fontSize: 12, marginTop: 6 }}>
            Vé điện tử • Chỉ dùng 1 lần khi check-in
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {loading ? (
            <div style={{ color: '#b388ff', fontWeight: 700 }}>Đang tải vé...</div>
          ) : error ? (
            <div style={{ color: '#ff7b86', fontWeight: 800 }}>{error}</div>
          ) : !ticket ? (
            <div style={{ color: '#ff7b86', fontWeight: 800 }}>Không tìm thấy vé</div>
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{ticket.eventName}</div>
              <div style={{ color: '#b388ff', fontSize: 12, marginTop: 6 }}>
                Mã vé: <span style={{ color: '#00e5ff', fontWeight: 900 }}>{ticket.ticketId}</span>
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#b388ff', fontSize: 12 }}>Khu vực</div>
                  <div style={{ fontWeight: 800 }}>{ticket.zoneName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#b388ff', fontSize: 12 }}>Ghế</div>
                  <div style={{ fontWeight: 800 }}>{ticket.seatLabel || 'Standing'}</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 18,
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QRCodeCanvas value={ticket.qrCodePayload} size={220} />
              </div>

              <div style={{ marginTop: 12, color: 'rgba(179,136,255,0.9)', fontSize: 12 }}>
                Khi tới cổng, đưa QR này cho nhân viên quét.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

