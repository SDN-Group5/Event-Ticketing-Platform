import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckInRecord,
  CheckInStats,
  EventLayout,
  fetchOrganizerEvents,
  fetchAttendeesStats,
  fetchAttendeesRecords,
  performCheckIn,
  exportAttendeesCSV,
  buildEventIdsParam,
} from '../../services/attendeesService';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  issued:       { label: 'Chưa vào',    cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  'checked-in': { label: 'Đã vào cửa', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  used:         { label: 'Đã dùng',    cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  cancelled:    { label: 'Đã hủy',     cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' },
  refunded:     { label: 'Hoàn tiền',  cls: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
};

const STATUS_TEXT = Object.fromEntries(
  Object.entries(STATUS_LABEL).map(([k, v]) => [k, v.label]),
);

const STAT_CARDS = [
  { label: 'Tổng vé',    statKey: 'total',     icon: 'confirmation_number', color: 'text-blue-400',    filter: 'all' },
  { label: 'Chưa vào',   statKey: 'pending',   icon: 'schedule',            color: 'text-amber-400',   filter: 'issued' },
  { label: 'Đã vào cửa', statKey: 'checkedIn', icon: 'check_circle',        color: 'text-emerald-400', filter: 'checked-in' },
  { label: 'Đã hủy',     statKey: 'cancelled', icon: 'cancel',              color: 'text-rose-400',    filter: 'cancelled' },
] as const;

const PAGE_SIZE = 15;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatGridProps {
  stats: CheckInStats | null;
  loading: boolean;
  activeFilter: string;
  onFilter: (f: string) => void;
}

const StatGrid: React.FC<StatGridProps> = ({ stats, loading, activeFilter, onFilter }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {STAT_CARDS.map((c) => (
      <button
        key={c.label}
        onClick={() => onFilter(activeFilter === c.filter ? 'all' : c.filter)}
        className={`text-left bg-[#1e293b]/60 border rounded-xl p-4 transition-all ${
          activeFilter === c.filter
            ? 'border-[#8655f6] bg-[#8655f6]/10'
            : 'border-white/5 hover:border-white/15'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${c.color}`}>{c.icon}</span>
          <div>
            <p className="text-2xl font-bold text-white">
              {loading ? (
                <span className="inline-block w-8 h-5 bg-white/10 rounded animate-pulse" />
              ) : (
                stats?.[c.statKey] ?? '—'
              )}
            </p>
            <p className="text-xs text-slate-400">{c.label}</p>
          </div>
        </div>
      </button>
    ))}
  </div>
);

interface CheckInRateBarProps {
  stats: CheckInStats;
}

const CheckInRateBar: React.FC<CheckInRateBarProps> = ({ stats }) => (
  <div className="bg-[#1e293b]/40 border border-white/5 rounded-xl p-4 mb-6">
    <div className="flex justify-between text-sm mb-2">
      <span className="text-slate-400">Tỷ lệ check-in</span>
      <span className="text-emerald-400 font-bold">{stats.checkInRate}%</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-[#8655f6] to-emerald-400 h-2 rounded-full transition-all"
        style={{ width: `${stats.checkInRate}%` }}
      />
    </div>
  </div>
);

interface TicketTableProps {
  records: CheckInRecord[];
  loading: boolean;
  checkingIn: string | null;
  onCheckIn: (ticketCode: string) => void;
}

const TicketTable: React.FC<TicketTableProps> = ({ records, loading, checkingIn, onCheckIn }) => (
  <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl overflow-hidden">
    <table className="w-full">
      <thead className="bg-black/20">
        <tr className="text-xs text-slate-400 uppercase tracking-wider">
          <th className="text-left py-4 px-6">Mã Vé</th>
          <th className="text-left py-4 px-6">Sự Kiện</th>
          <th className="text-left py-4 px-6">Khu Vực / Ghế</th>
          <th className="text-left py-4 px-6">Giá</th>
          <th className="text-left py-4 px-6">Trạng Thái</th>
          <th className="text-left py-4 px-6">Giờ vào cửa</th>
          <th className="text-left py-4 px-6">Hành động</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 7 }).map((__, j) => (
                <td key={j} className="py-4 px-6">
                  <div className="h-4 bg-white/10 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))
        ) : records.length === 0 ? (
          <tr>
            <td colSpan={7} className="py-16 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              Không có dữ liệu vé
            </td>
          </tr>
        ) : (
          records.map((r) => {
            const s = STATUS_LABEL[r.status] ?? { label: r.status, cls: 'bg-slate-500/10 text-slate-400' };
            return (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-mono text-xs text-white bg-white/5 px-2 py-1 rounded">
                    {r.ticketCode.slice(-10).toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-white text-sm font-medium truncate max-w-[180px]">{r.eventName}</p>
                </td>
                <td className="py-4 px-6 text-slate-300 text-sm">
                  {r.zoneName}
                  {r.seatLabel && <span className="text-slate-500"> · {r.seatLabel}</span>}
                </td>
                <td className="py-4 px-6 text-slate-300 text-sm">
                  {r.price.toLocaleString('vi-VN')}đ
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.cls}`}>
                    {s.label}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-400 text-xs">
                  {r.checkInTime ? new Date(r.checkInTime).toLocaleString('vi-VN') : '—'}
                </td>
                <td className="py-4 px-6">
                  {r.status === 'issued' && (
                    <button
                      onClick={() => onCheckIn(r.ticketCode)}
                      disabled={checkingIn === r.ticketCode}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      {checkingIn === r.ticketCode ? (
                        <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <span className="material-symbols-outlined text-sm">how_to_reg</span>
                      )}
                      Check In
                    </button>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ page, totalPages, total, pageSize, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
      <span>
        Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total} vé
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 disabled:opacity-40 hover:bg-white/5"
        >
          ← Trước
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-[#8655f6]/20 border border-[#8655f6]/30 text-white font-medium">
          {page} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 disabled:opacity-40 hover:bg-white/5"
        >
          Sau →
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AttendeesPage: React.FC = () => {
  const [events, setEvents] = useState<EventLayout[]>([]);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [filterEventId, setFilterEventId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [scanMsg, setScanMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch events on mount
  useEffect(() => {
    fetchOrganizerEvents().then(setEvents);
  }, []);

  const eventIdsParam = useCallback(
    () => buildEventIdsParam(filterEventId, events),
    [filterEventId, events],
  );

  // Fetch stats
  useEffect(() => {
    if (events.length === 0 && filterEventId === 'all') return;
    setStatsLoading(true);
    fetchAttendeesStats(eventIdsParam())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, [eventIdsParam, events]);

  // Fetch records
  useEffect(() => {
    if (events.length === 0 && filterEventId === 'all') {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAttendeesRecords({
      eventIds: eventIdsParam(),
      status: filterStatus,
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    })
      .then(({ records: r, pagination }) => {
        setRecords(r);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [eventIdsParam, events, filterStatus, debouncedSearch, page]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filterEventId, filterStatus, debouncedSearch]);

  const handleCheckIn = async (ticketCode: string) => {
    setCheckingIn(ticketCode);
    setScanMsg(null);
    const result = await performCheckIn(ticketCode);
    setScanMsg({ ok: result.ok, text: result.message });
    if (result.ok) {
      setRecords((prev) =>
        prev.map((r) =>
          r.ticketCode === ticketCode
            ? { ...r, status: 'checked-in' as const, checkInTime: new Date().toISOString() }
            : r,
        ),
      );
      setStats((prev) =>
        prev ? { ...prev, checkedIn: prev.checkedIn + 1, pending: Math.max(0, prev.pending - 1) } : prev,
      );
    }
    setCheckingIn(null);
    setTimeout(() => setScanMsg(null), 3000);
  };

  const handleExport = () => exportAttendeesCSV(records, STATUS_TEXT);

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Attendees</h1>
            <p className="text-slate-400">Quản lý và theo dõi người tham dự sự kiện</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#8655f6] px-5 py-2.5 rounded-xl font-bold text-white hover:bg-[#7444e5] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>

        {/* Toast */}
        {scanMsg && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 font-medium text-sm ${
              scanMsg.ok
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {scanMsg.ok ? 'check_circle' : 'error'}
            </span>
            {scanMsg.text}
          </div>
        )}

        {/* Stats grid */}
        <StatGrid
          stats={stats}
          loading={statsLoading}
          activeFilter={filterStatus}
          onFilter={setFilterStatus}
        />

        {/* Check-in rate bar */}
        {stats && stats.total > 0 && <CheckInRateBar stats={stats} />}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã vé..."
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8655f6]"
            />
          </div>
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white min-w-[220px] focus:outline-none focus:border-[#8655f6]"
          >
            <option value="all">Tất cả sự kiện</option>
            {events.map((e) => (
              <option key={e.eventId} value={e.eventId}>
                {e.eventName || e.eventId}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <TicketTable
          records={records}
          loading={loading}
          checkingIn={checkingIn}
          onCheckIn={handleCheckIn}
        />

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    </div>
  );
};
