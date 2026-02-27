// Shared seat-related types for frontend layout & booking flows

export type SeatStatus = 'available' | 'occupied' | 'blocked';

export interface Seat {
  id: string;
  row: string; // row label, e.g. "A" or "1"
  number: number;
  zone: string; // zone id or human readable zone name
  status: SeatStatus;
  price: number;
  panoramaUrl?: string;
}

export type SeatZoneType = 'vip' | 'regular' | 'economy' | 'seats' | 'standing' | 'stage' | 'exit' | 'barrier' | string;

export interface SeatZone {
  id: string;
  name: string;
  type: SeatZoneType;
  price: number;
  color: string;
  rows: number;
  seatsPerRow: number;
  // Optional spatial data (used when zones are placed on a canvas)
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  // Optional 360 view URL
  view360Url?: string;
}

export interface SelectedSeat {
  id: string;
  row: string | number;
  number: number;
  zone: string;
  price: number;
}

