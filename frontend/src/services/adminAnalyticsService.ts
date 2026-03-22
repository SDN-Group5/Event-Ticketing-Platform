import axios from 'axios';
import { UserAPI } from './userApiService';
import { formatVND, formatChartY } from './analyticsService';

export { formatVND, formatChartY };

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminKPI {
  totalRevenue: number;
  totalCommission: number;
  ticketsSold: number;
  totalOrders: number;
  totalEvents: number;
  totalUsers: number;
  allTimeRevenue: number;
  allTimeTickets: number;
  refundRequests: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  commission: number;
  orders: number;
}

export interface TopEventItem {
  eventId: string;
  eventName: string;
  revenue: number;
  ticketsSold: number;
  orderCount: number;
}

export interface TopOrganizerItem {
  organizerId: string;
  revenue: number;
  ticketsSold: number;
  orderCount: number;
}

export interface AdminAnalyticsData {
  kpi: AdminKPI;
  revenueByTime: RevenuePoint[];
  topEvents: TopEventItem[];
  topOrganizers: TopOrganizerItem[];
  ordersByStatus: Record<string, number>;
}

export const DEFAULT_ADMIN_KPI: AdminKPI = {
  totalRevenue: 0,
  totalCommission: 0,
  ticketsSold: 0,
  totalOrders: 0,
  totalEvents: 0,
  totalUsers: 0,
  allTimeRevenue: 0,
  allTimeTickets: 0,
  refundRequests: 0,
};

// ─── Fetch Functions ──────────────────────────────────────────────────────────

/** Lấy toàn bộ admin analytics (platform-wide) */
export async function fetchAdminAnalytics(
  period: 'month' | 'quarter' | 'year',
): Promise<AdminAnalyticsData> {
  const [overviewRes, usersRes] = await Promise.allSettled([
    axios.get(`${API_BASE}/api/analytics/admin/overview`, {
      params: { period },
      ...getAuthHeader(),
    }),
    UserAPI.getUsers({ page: 1, limit: 1 }),
  ]);

  const overview =
    overviewRes.status === 'fulfilled' ? overviewRes.value.data?.data : null;

  const totalUsers =
    usersRes.status === 'fulfilled'
      ? (usersRes.value as any)?.pagination?.total ?? (usersRes.value as any)?.total ?? 0
      : 0;

  const kpi: AdminKPI = {
    totalRevenue: overview?.kpi?.totalRevenue ?? 0,
    totalCommission: overview?.kpi?.totalCommission ?? 0,
    ticketsSold: overview?.kpi?.ticketsSold ?? 0,
    totalOrders: overview?.kpi?.totalOrders ?? 0,
    totalEvents: overview?.kpi?.totalEvents ?? 0,
    totalUsers,
    allTimeRevenue: overview?.kpi?.allTimeRevenue ?? 0,
    allTimeTickets: overview?.kpi?.allTimeTickets ?? 0,
    refundRequests: overview?.kpi?.refundRequests ?? 0,
  };

  return {
    kpi,
    revenueByTime: overview?.revenueByTime ?? [],
    topEvents: overview?.topEvents ?? [],
    topOrganizers: overview?.topOrganizers ?? [],
    ordersByStatus: overview?.ordersByStatus ?? {},
  };
}

/** Tính tổng revenue từ revenueByTime */
export function sumRevenue(data: RevenuePoint[]): number {
  return data.reduce((s, d) => s + d.revenue, 0);
}

/** Format label ngày/tháng cho chart */
export function formatDateLabel(raw: string): string {
  if (!raw) return '';
  // YYYY-MM-DD → DD/MM
  if (raw.length === 10) return raw.slice(5).replace('-', '/');
  // YYYY-MM → tháng MM
  if (raw.length === 7) return `T${raw.slice(5)}`;
  return raw;
}
