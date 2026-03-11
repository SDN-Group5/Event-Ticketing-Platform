import axios from 'axios';

const API_URL = 'http://localhost:4005/api/check-in';

interface CheckInRecord {
  id: string;
  ticketCode: string;
  customerName: string;
  customerEmail: string;
  eventId: string;
  eventName: string;
  zone: string;
  seatNumber: string;
  checkInTime: string | null;
  checkInBy: string;
  status: 'checked-in' | 'pending';
}

interface CheckInResponse {
  success: boolean;
  data: CheckInRecord[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

interface CheckInProcessResponse {
  success: boolean;
  data: CheckInRecord;
  message: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const CheckInAPI = {
  /**
   * GET /api/check-in/records
   * Fetch check-in records for all events managed by organizer
   */
  getRecords: async (params?: {
    eventId?: string;
    status?: 'pending' | 'checked-in' | 'all';
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CheckInResponse> => {
    try {
      const response = await axios.get(`${API_URL}/records`, {
        params,
        ...getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * POST /api/check-in/process
   * Process a ticket check-in by ticket code
   */
  processCheckIn: async (ticketCode: string, staffId?: string): Promise<CheckInProcessResponse> => {
    try {
      const response = await axios.post(`${API_URL}/process`, {
        ticketCode,
        staffId
      }, getAuthHeader());
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/check-in/:ticketId
   * Get detailed check-in information for a ticket
   */
  getTicketDetails: async (ticketId: string): Promise<{ success: boolean; data: CheckInRecord }> => {
    try {
      const response = await axios.get(`${API_URL}/${ticketId}`, getAuthHeader());
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * PATCH /api/check-in/:ticketId/undo
   * Undo a check-in (for error correction)
   */
  undoCheckIn: async (ticketId: string): Promise<CheckInProcessResponse> => {
    try {
      const response = await axios.patch(`${API_URL}/${ticketId}/undo`, {}, getAuthHeader());
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * GET /api/check-in/statistics/summary
   * Get check-in statistics
   */
  getStatistics: async (eventId?: string): Promise<{
    success: boolean;
    data: {
      total: number;
      checkedIn: number;
      pending: number;
      checkInRate: number;
    };
  }> => {
    try {
      const response = await axios.get(`${API_URL}/statistics/summary`, {
        params: { eventId },
        ...getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};
