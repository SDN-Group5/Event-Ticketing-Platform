import { CheckInAPI, CheckInRecord, CheckInStats } from './checkInApiService';
import { LayoutAPI } from './layoutApiService';
import { EventLayout } from '../types/layout';

export type { CheckInRecord, CheckInStats };
export type { EventLayout };

export interface AttendeesData {
  records: CheckInRecord[];
  pagination: {
    total: number;
    totalPages: number;
  };
}

export interface RecordsParams {
  eventIds: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

/** Lấy danh sách sự kiện của organizer */
export async function fetchOrganizerEvents(): Promise<EventLayout[]> {
  try {
    return await LayoutAPI.getMyLayouts();
  } catch {
    return [];
  }
}

/** Build chuỗi eventIds từ filter + danh sách events */
export function buildEventIdsParam(filterEventId: string, events: EventLayout[]): string {
  if (filterEventId !== 'all') return filterEventId;
  return events.map((e) => e.eventId).join(',');
}

/** Lấy thống kê check-in theo eventIds */
export async function fetchAttendeesStats(eventIds: string): Promise<CheckInStats | null> {
  try {
    const res = await CheckInAPI.getStatistics(eventIds);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

/** Lấy danh sách vé (có phân trang, filter, search) */
export async function fetchAttendeesRecords(params: RecordsParams): Promise<AttendeesData> {
  try {
    const query: any = {
      page: params.page ?? 1,
      limit: params.limit ?? 15,
      eventIds: params.eventIds,
    };
    if (params.status && params.status !== 'all') query.status = params.status;
    if (params.search) query.search = params.search;

    const res = await CheckInAPI.getRecords(query);
    return {
      records: res.data || [],
      pagination: {
        total: res.pagination?.total ?? 0,
        totalPages: res.pagination?.totalPages ?? 1,
      },
    };
  } catch {
    return { records: [], pagination: { total: 0, totalPages: 1 } };
  }
}

/** Thực hiện check-in thủ công bằng ticketCode */
export async function performCheckIn(
  ticketCode: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await CheckInAPI.processCheckIn(ticketCode);
    return { ok: res.success, message: res.message };
  } catch (err: any) {
    const message = err?.response?.data?.message || 'Check-in thất bại';
    return { ok: false, message };
  }
}

/** Export danh sách vé hiện tại ra file CSV */
export function exportAttendeesCSV(
  records: CheckInRecord[],
  statusLabel: Record<string, string>,
): void {
  const header = ['Mã Vé', 'User ID', 'Sự Kiện', 'Khu Vực', 'Ghế', 'Giá', 'Trạng Thái', 'Giờ Check-in'];
  const rows = records.map((r) => [
    r.ticketCode,
    r.userId,
    r.eventName,
    r.zoneName,
    r.seatLabel ?? '',
    r.price.toLocaleString('vi-VN'),
    statusLabel[r.status] ?? r.status,
    r.checkInTime ? new Date(r.checkInTime).toLocaleString('vi-VN') : '',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((c) => `"${c}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendees_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
