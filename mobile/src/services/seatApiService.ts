export type SeatStatus = 'available' | 'reserved' | 'sold' | 'blocked';

export type SeatData = {
  _id: string;
  eventId: string;
  layoutId: string;
  zoneId: string;
  row: number;
  seatNumber: number;
  seatLabel: string;
  status: SeatStatus;
  price: number;
  discount?: number;
  isAccessible?: boolean;
  notes?: string;
  bookingId?: string;
  reservedBy?: string;
  reservedAt?: string;
  reservationExpiry?: string;
  soldBy?: string;
  soldAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type SeatsResponse = {
  seats: SeatData[];
  total: number;
  page: number;
  limit: number;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

const BASE_URL =
  process.env.EXPO_PUBLIC_LAYOUT_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:4002';

async function requestSeats<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  console.log('[SeatAPI] Request', {
    url: url.toString(),
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const rawText = await response.text();
  let json: ApiResponse<T> | any;

  try {
    json = rawText ? (JSON.parse(rawText) as ApiResponse<T> | any) : {};
  } catch (err) {
    console.error('[SeatAPI] JSON parse error', {
      url: url.toString(),
      status: response.status,
      rawText: rawText.slice(0, 300),
      error: (err as Error).message,
    });
    throw new Error(`JSON Parse error: ${(err as Error).message}`);
  }

  console.log('[SeatAPI] Response', {
    url: url.toString(),
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const msg = json?.error?.message || json?.message || `Seat API error: ${response.status}`;
    throw new Error(msg);
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const SeatAPI = {
  async getSeatsByZone(
    eventId: string,
    zoneId: string,
    options?: {
      status?: SeatStatus;
      page?: number;
      limit?: number;
    },
  ): Promise<SeatsResponse> {
    return requestSeats<SeatsResponse>(`/api/v1/events/${encodeURIComponent(eventId)}/seats`, {
      zoneId,
      ...(options || {}),
    });
  },
};

