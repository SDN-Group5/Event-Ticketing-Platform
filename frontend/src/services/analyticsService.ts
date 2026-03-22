import { AnalyticsAPI } from './analyticsApiService';

export interface AnalyticsKPI {
  totalRevenue: number;
  ticketsSold: number;
  activeEvents: number;
  avgConversion: number;
  revenueGrowth: number;
  ticketGrowth: number;
  conversionTrend: number;
}

export interface RevenuePoint {
  month: string;
  value: number;
}

export interface TicketTypeItem {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopEventItem {
  name: string;
  revenue: number;
  ticketsSold: number;
  rating: number;
}

export interface AnalyticsData {
  kpi: AnalyticsKPI;
  revenueByMonth: RevenuePoint[];
  ticketTypes: TicketTypeItem[];
  topEvents: TopEventItem[];
}

const ZONE_COLORS = ['#8655f6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

/** Format số tiền VND gọn gàng */
export function formatVND(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B₫`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M₫`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K₫`;
  return `${value.toLocaleString('vi-VN')}₫`;
}

/** Format nhãn trục Y của chart */
export function formatChartY(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

const DEFAULT_KPI: AnalyticsKPI = {
  totalRevenue: 0,
  ticketsSold: 0,
  activeEvents: 0,
  avgConversion: 0,
  revenueGrowth: 0,
  ticketGrowth: 0,
  conversionTrend: 0,
};

/** Lấy toàn bộ analytics data cho organizer */
export async function fetchAnalyticsData(
  period: 'month' | 'quarter' | 'year',
): Promise<AnalyticsData> {
  const response = await AnalyticsAPI.getOverview({ period });
  const data = response.data;

  const kpi: AnalyticsKPI = {
    totalRevenue: data.kpi?.totalRevenue ?? 0,
    ticketsSold: data.kpi?.ticketsSold ?? 0,
    activeEvents: data.kpi?.activeEvents ?? 0,
    avgConversion: data.kpi?.avgConversion ?? 0,
    revenueGrowth: data.revenueGrowth ?? 0,
    ticketGrowth: data.ticketGrowth ?? 0,
    conversionTrend: data.conversionTrend ?? 0,
  };

  const revenueByMonth: RevenuePoint[] = (data.revenueByMonth ?? []).map((item: any) => ({
    month: item.month,
    value: item.value,
  }));

  const ticketTypes: TicketTypeItem[] = (data.ticketTypeDistribution ?? []).map(
    (item: any, i: number) => ({
      type: item.type || 'Khác',
      count: item.count ?? 0,
      percentage: item.percentage ?? 0,
      color: ZONE_COLORS[i % ZONE_COLORS.length],
    }),
  );

  const topEvents: TopEventItem[] = (data.topEvents ?? []).map((item: any) => ({
    name: item.name || 'Không tên',
    revenue: item.revenue ?? 0,
    ticketsSold: item.ticketsSold ?? 0,
    rating: item.rating ?? 5,
  }));

  return { kpi, revenueByMonth, ticketTypes, topEvents };
}

export { DEFAULT_KPI };
