import axios from 'axios';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const API_URL = `${API_BASE}/api/checkin`;

export interface CheckInRecord {
  id: string;
  ticketCode: string;
  userId: string;
  eventId: string;
  eventName: string;
  zoneName: string;
  seatLabel: string | null;
  price: number;
  status: 'issued' | 'checked-in' | 'used' | 'cancelled' | 'refunded';
  checkInTime: string | null;
}

export interface CheckInStats {
  total: number;
  checkedIn: number;
  pending: number;
  cancelled: number;
  checkInRate: number;
}

interface CheckInResponse {
  success: boolean;
  data: CheckInRecord[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ScanResponse {
  success: boolean;
  message: string;
  data?: {
    ticketCode: string;
    status: string;
    checkedInAt: string;
    event: {
      id: string;
      name: string;
      zoneName: string;
      seatLabel?: string;
    };
    owner: { id: string };
  };
}

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const CheckInAPI = {
  /**
   * GET /api/checkin/records
   * Lấy danh sách vé theo eventIds
   */
  getRecords: async (params?: {
    eventIds?: string;
    status?: 'issued' | 'checked-in' | 'all' | 'pending';
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CheckInResponse> => {
    const response = await axios.get(`${API_URL}/records`, {
      params,
      ...getAuthHeader(),
    });
    return response.data;
  },

  /**
   * POST /api/checkin/scan
   * Quét QR check-in vé
   */
  processCheckIn: async (ticketCode: string, staffId?: string): Promise<ScanResponse> => {
    const response = await axios.post(
      `${API_URL}/scan`,
      { ticketCode, staffId },
      getAuthHeader(),
    );
    return response.data;
  },

  /**
   * GET /api/checkin/statistics/summary
   * Thống kê check-in theo eventIds
   */
  getStatistics: async (eventIds?: string): Promise<{ success: boolean; data: CheckInStats }> => {
    const response = await axios.get(`${API_URL}/statistics/summary`, {
      params: eventIds ? { eventIds } : {},
      ...getAuthHeader(),
    });
    return response.data;
  },

  /**
   * GET /api/checkin/event/:eventId/summary
   * Thống kê theo 1 event cụ thể (public)
   */
  getEventSummary: async (eventId: string): Promise<{ success: boolean; data: { total: number; checkedIn: number; remaining: number } }> => {
    const response = await axios.get(`${API_URL}/event/${eventId}/summary`);
    return response.data;
  },

  /**
   * GET /api/checkin/event/:eventId/recent
   * Lịch sử quét gần đây theo event
   */
  getRecentScans: async (eventId: string, limit?: number) => {
    const response = await axios.get(`${API_URL}/event/${eventId}/recent`, {
      params: { limit },
    });
    return response.data;
  },
};
