import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const API_URL = `${API_BASE}/api/analytics`;

interface RevenueData {
  month: string;
  value: number;
  tickets: number;
}

interface TicketTypeData {
  type: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface TopEvent {
  id: string;
  name: string;
  revenue: number;
  ticketsSold: number;
  rating: number;
  capacity: number;
}

interface KPIData {
  totalRevenue: number;
  ticketsSold: number;
  activeEvents: number;
  avgConversion: number;
}

interface AnalyticsOverview {
  success: boolean;
  data: {
    kpi: KPIData;
    revenueByMonth: RevenueData[];
    ticketTypeDistribution: TicketTypeData[];
    topEvents: TopEvent[];
    revenueGrowth: number;
    ticketGrowth: number;
    conversionTrend: number;
  };
}

interface AnalyticsDetail {
  success: boolean;
  data: {
    eventId?: string;
    eventName?: string;
    revenue?: number;
    ticketsSold?: number;
    checkInRate?: number;
    refundRate?: number;
    rating?: number;
    timeline?: Array<{
      date: string;
      sales: number;
      revenue: number;
    }>;
  };
}

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const AnalyticsAPI = {
  /**
   * GET /api/analytics/overview
   * Get organizer's overall analytics overview
   */
  getOverview: async (params?: {
    startDate?: string;
    endDate?: string;
    period?: 'month' | 'quarter' | 'year';
  }): Promise<AnalyticsOverview> => {
    try {
      const response = await axios.get(`${API_URL}/overview`, {
        params: params || { period: 'month' },
        ...getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/analytics/events/:eventId
   * Get detailed analytics for a specific event
   */
  getEventAnalytics: async (eventId: string): Promise<AnalyticsDetail> => {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}`, getAuthHeader());
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/analytics/revenue
   * Get revenue breakdown and trends
   */
  getRevenueAnalytics: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: {
      total: number;
      byMonth: RevenueData[];
      topPaymentMethods: Array<{
        method: string;
        count: number;
        revenue: number;
      }>;
      refunds: number;
      pendingPayments: number;
    };
  }> => {
    try {
      const response = await axios.get(`${API_URL}/revenue`, {
        params: params || { period: 'month' },
        ...getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/analytics/tickets
   * Get ticket sales breakdown by type
   */
  getTicketAnalytics: async (eventId?: string): Promise<{
    success: boolean;
    data: {
      total: number;
      byType: TicketTypeData[];
      soldVsCapacity: {
        type: string;
        sold: number;
        capacity: number;
        percentage: number;
      }[];
    };
  }> => {
    try {
      const response = await axios.get(`${API_URL}/tickets`, {
        params: { eventId },
        ...getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/analytics/attendees
   * Get attendee statistics and demographics
   */
  getAttendeeAnalytics: async (params?: {
    eventId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: {
      total: number;
      checkedIn: number;
      noShow: number;
      checkInByHour: Array<{
        hour: number;
        count: number;
      }>;
    };
  }> => {
    try {
      const response = await axios.get(`${API_URL}/attendees`, {
        params,
        ...getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/analytics/export
   * Export analytics data as CSV or PDF
   */
  exportAnalytics: async (format: 'csv' | 'pdf', params?: {
    startDate?: string;
    endDate?: string;
    dataType?: 'revenue' | 'tickets' | 'attendees' | 'all';
  }): Promise<Blob> => {
    try {
      const response = await axios.get(`${API_URL}/export`, {
        params: { format, ...params },
        headers: getAuthHeader().headers,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};
